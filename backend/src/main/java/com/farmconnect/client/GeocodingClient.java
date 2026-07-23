package com.farmconnect.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Turns a free-text address into coordinates via Google's Geocoding API. Fully inert
 * (returns Optional.empty() for every call) when GOOGLE_MAPS_API_KEY isn't set, so
 * callers keep working exactly as before - same "wired up and inert" pattern as
 * Google OAuth2 / Cloudinary / SMTP elsewhere in this app.
 */
@Slf4j
@Component
public class GeocodingClient {

    private final RestClient geocodingRestClient;
    private final String apiKey;
    private final boolean configured;

    public GeocodingClient(RestClient geocodingRestClient, @Value("${app.geocoding.api-key}") String apiKey) {
        this.geocodingRestClient = geocodingRestClient;
        this.apiKey = apiKey;
        this.configured = StringUtils.hasText(apiKey);
    }

    public record Coordinates(BigDecimal latitude, BigDecimal longitude) {
    }

    public Optional<Coordinates> geocode(String address) {
        if (!configured || !StringUtils.hasText(address)) {
            return Optional.empty();
        }
        try {
            GeocodeApiResponse response = geocodingRestClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/json")
                            .queryParam("address", address)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GeocodeApiResponse.class);

            if (response == null || !"OK".equals(response.status()) || response.results() == null || response.results().isEmpty()) {
                log.warn("Geocoding returned no result for '{}': status={}", address, response == null ? "null" : response.status());
                return Optional.empty();
            }

            GeocodeApiResponse.Location location = response.results().get(0).geometry().location();
            return Optional.of(new Coordinates(BigDecimal.valueOf(location.lat()), BigDecimal.valueOf(location.lng())));
        } catch (Exception ex) {
            log.error("Geocoding request failed for '{}'", address, ex);
            return Optional.empty();
        }
    }

    private record GeocodeApiResponse(List<Result> results, String status) {
        private record Result(@JsonProperty("formatted_address") String formattedAddress, Geometry geometry) {
        }

        private record Geometry(Location location) {
        }

        private record Location(double lat, double lng) {
        }
    }
}
