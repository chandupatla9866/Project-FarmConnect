CREATE TABLE farmers (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    farm_name                 VARCHAR(150) NOT NULL,
    farm_address              VARCHAR(255),
    farm_city                 VARCHAR(100),
    farm_state                VARCHAR(100),
    farm_pincode              VARCHAR(12),
    farm_size_acres           NUMERIC(8, 2),
    farming_experience_years  INTEGER,
    primary_crop_types        VARCHAR(500),
    bio                       TEXT,
    farm_latitude             NUMERIC(9, 6),
    farm_longitude            NUMERIC(9, 6),
    verified                  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                TIMESTAMP NOT NULL DEFAULT now(),
    updated_at                TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmers_user_id ON farmers (user_id);
CREATE INDEX idx_farmers_city ON farmers (farm_city);
