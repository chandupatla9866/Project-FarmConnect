package com.farmconnect.ai;

import com.farmconnect.dto.request.CropRecommendationRequest;
import com.farmconnect.dto.response.CropRecommendationResponse;
import com.farmconnect.dto.response.DiseaseDetectionResponse;
import com.farmconnect.exception.BadRequestException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Real crop recommendation + disease detection, backed by a local Ollama vision model
 * (see spring.ai.ollama.* in application.yml) instead of the heuristic Python service.
 * Everything else (demand, price, weather) still goes through AiServiceClient.
 *
 * JSON is requested via an explicit inline example and parsed leniently by hand rather
 * than Spring AI's .entity() converter - small local models follow a concrete example
 * far more reliably than the JSON-schema instructions the converter appends, and their
 * output sometimes needs light repair (markdown fences, truncated closing brackets).
 */
@Slf4j
@Service
public class LocalAiService {

    private final ChatClient chatClient;
    private final ObjectMapper lenientMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public LocalAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public CropRecommendationResponse recommendCrop(CropRecommendationRequest request) {
        String prompt = """
                You are an expert agronomist advising a smallholder farmer in India.

                Soil type: %s
                Region: %s
                Season: %s
                Farm size (acres): %s
                Water availability: %s

                Recommend the 3 best crops to plant right now for these conditions, ranked best
                first. suitabilityScore is 0 to 1. expectedYieldPerAcre is in kg. Prices are INR
                per kg, realistic for that region. Each reason is one sentence grounded in the
                soil/season/water inputs above.

                Respond with ONLY a JSON object in exactly this shape, no other text:
                {"recommendedCrops":[{"cropName":"...","suitabilityScore":0.9,"expectedYieldPerAcre":1200,"expectedMarketPricePerUnit":25,"reason":"..."}]}
                """.formatted(
                request.soilType(),
                request.region(),
                request.season(),
                request.farmSizeAcres() != null ? request.farmSizeAcres() : "not specified",
                request.waterAvailability() != null ? request.waterAvailability() : "not specified");

        try {
            String raw = chatClient.prompt().user(prompt).call().content();
            CropSuggestions parsed = parseLeniently(raw, CropSuggestions.class);
            List<CropRecommendationResponse.CropSuggestion> crops =
                    parsed != null && parsed.recommendedCrops() != null ? parsed.recommendedCrops() : List.of();
            if (crops.isEmpty()) {
                log.warn("Crop recommendation model returned unparseable output: {}", raw);
                throw new BadRequestException("The AI model returned an unexpected response. Please try again.");
            }
            return new CropRecommendationResponse(crops, Instant.now().toString());
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Local AI crop recommendation failed", ex);
            throw new BadRequestException(
                    "AI crop recommendation is currently unavailable (is Ollama running locally?). Please try again shortly.");
        }
    }

    public DiseaseDetectionResponse detectDisease(MultipartFile image) {
        byte[] bytes;
        try {
            bytes = image.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded image: " + ex.getMessage());
        }

        String prompt = """
                You are a plant pathologist. Examine this photo of a crop leaf or plant closely
                and identify the most likely disease or condition affecting it - or "Healthy" if
                it looks fine. confidenceScore is 0 to 1. severity is "low", "medium", or "high".
                recommendedAction is one short practical sentence a farmer can act on.
                affectedCropTypeGuess is your best guess at the plant species shown.

                Respond with ONLY a JSON object in exactly this shape, no other text:
                {"detectedCondition":"...","confidenceScore":0.8,"severity":"medium","recommendedAction":"...","affectedCropTypeGuess":"..."}
                """;

        try {
            String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
            String raw = chatClient.prompt()
                    .user(u -> u.text(prompt)
                            .media(MimeTypeUtils.parseMimeType(mimeType), new ByteArrayResource(bytes)))
                    .call()
                    .content();

            DiseaseDetectionResponse response = parseLeniently(raw, DiseaseDetectionResponse.class);
            if (response == null || !StringUtils.hasText(response.detectedCondition())) {
                log.warn("Disease detection model returned unparseable output: {}", raw);
                throw new BadRequestException("The AI model could not analyze this image. Please try a clearer photo.");
            }
            return response;
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Local AI disease detection failed", ex);
            throw new BadRequestException(
                    "AI disease detection is currently unavailable (is Ollama running locally?). Please try again shortly.");
        }
    }

    private <T> T parseLeniently(String raw, Class<T> type) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String candidate = extractJsonObject(raw);
        if (candidate == null) {
            return null;
        }
        // Try as-is first, then repair-and-retry: append missing closing quotes/brackets
        // to fix a response truncated mid-object (a known small-model failure mode).
        String attempt = candidate;
        for (int i = 0; i < 3; i++) {
            try {
                return lenientMapper.readValue(attempt, type);
            } catch (Exception ex) {
                String closers = closersFor(attempt);
                if (closers.isEmpty()) {
                    return null;
                }
                attempt = attempt + closers;
            }
        }
        return null;
    }

    private String extractJsonObject(String raw) {
        String cleaned = raw.replace("```json", "").replace("```", "").trim();
        int start = cleaned.indexOf('{');
        if (start < 0) {
            return null;
        }
        int end = cleaned.lastIndexOf('}');
        return end > start ? cleaned.substring(start, end + 1) : cleaned.substring(start);
    }

    private String closersFor(String json) {
        int braces = 0;
        int brackets = 0;
        boolean inString = false;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) {
                inString = !inString;
            } else if (!inString) {
                if (c == '{') braces++;
                else if (c == '}') braces--;
                else if (c == '[') brackets++;
                else if (c == ']') brackets--;
            }
        }
        StringBuilder closers = new StringBuilder();
        if (inString) {
            closers.append('"');
        }
        closers.append("]".repeat(Math.max(0, brackets)));
        closers.append("}".repeat(Math.max(0, braces)));
        return closers.toString();
    }

    private record CropSuggestions(List<CropRecommendationResponse.CropSuggestion> recommendedCrops) {
    }
}
