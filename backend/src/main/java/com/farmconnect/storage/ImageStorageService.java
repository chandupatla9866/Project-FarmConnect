package com.farmconnect.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    /**
     * Stores an uploaded image and returns a publicly reachable URL.
     * Uses Cloudinary when credentials are configured, otherwise falls back
     * to serving the file from local disk under /uploads/**.
     */
    String upload(MultipartFile file, String folder);
}
