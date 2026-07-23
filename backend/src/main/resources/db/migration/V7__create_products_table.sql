CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id           UUID NOT NULL REFERENCES farmers (id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES categories (id),
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    unit                VARCHAR(20) NOT NULL,
    price_per_unit      NUMERIC(10, 2) NOT NULL CHECK (price_per_unit >= 0),
    quantity_available  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    organic             BOOLEAN NOT NULL DEFAULT FALSE,
    harvest_date        DATE,
    image_url           VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_farmer_id ON products (farmer_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status ON products (status);
