CREATE TABLE users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name          VARCHAR(150) NOT NULL,
    email              VARCHAR(180) NOT NULL UNIQUE,
    password_hash      VARCHAR(255),
    phone              VARCHAR(20),
    auth_provider      VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    provider_id        VARCHAR(120),
    profile_image_url  VARCHAR(500),
    enabled            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_provider ON users (auth_provider, provider_id);
