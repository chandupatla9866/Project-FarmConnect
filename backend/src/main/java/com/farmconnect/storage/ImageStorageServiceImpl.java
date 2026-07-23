package com.farmconnect.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.farmconnect.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class ImageStorageServiceImpl implements ImageStorageService {

    private final Cloudinary cloudinary;
    private final boolean cloudinaryConfigured;
    private final Path uploadDir;
    private final String localPublicBaseUrl;

    public ImageStorageServiceImpl(
            Cloudinary cloudinary,
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.local-storage.upload-dir}") String uploadDir,
            @Value("${app.local-storage.public-base-url}") String localPublicBaseUrl) {
        this.cloudinary = cloudinary;
        this.cloudinaryConfigured = StringUtils.hasText(cloudName);
        this.uploadDir = Path.of(uploadDir);
        this.localPublicBaseUrl = localPublicBaseUrl;
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        if (cloudinaryConfigured) {
            return uploadToCloudinary(file, folder);
        }
        log.warn("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME missing) - falling back to local disk storage");
        return uploadToLocalDisk(file, folder);
    }

    @SuppressWarnings("unchecked")
    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "farmconnect/" + folder));
            return (String) result.get("secure_url");
        } catch (Exception ex) {
            // Cloudinary's SDK throws plain RuntimeException (not IOException) for API-level
            // failures like auth/permission errors - catch broadly so any Cloudinary failure
            // (network, auth, quota, permissions) falls back to local disk instead of 500ing.
            log.error("Cloudinary upload failed, falling back to local disk", ex);
            return uploadToLocalDisk(file, folder);
        }
    }

    private String uploadToLocalDisk(MultipartFile file, String folder) {
        try {
            Path targetDir = uploadDir.resolve(folder);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path targetFile = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetFile);

            return localPublicBaseUrl + "/" + folder + "/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store uploaded image: " + ex.getMessage());
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
}
