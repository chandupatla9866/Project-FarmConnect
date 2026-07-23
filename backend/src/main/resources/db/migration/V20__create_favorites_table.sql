CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id    UUID NOT NULL REFERENCES buyers (id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_favorites_buyer_product ON favorites (buyer_id, product_id);
CREATE INDEX idx_favorites_buyer_id ON favorites (buyer_id);
