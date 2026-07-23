CREATE TABLE buyers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    buyer_type        VARCHAR(30) NOT NULL,
    business_name     VARCHAR(150) NOT NULL,
    delivery_address  VARCHAR(255),
    city              VARCHAR(100),
    state             VARCHAR(100),
    pincode           VARCHAR(12),
    latitude          NUMERIC(9, 6),
    longitude         NUMERIC(9, 6),
    gst_number        VARCHAR(30),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_buyers_user_id ON buyers (user_id);
CREATE INDEX idx_buyers_city ON buyers (city);
