CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    buyer_id    UUID NOT NULL REFERENCES buyers (id),
    farmer_id   UUID NOT NULL REFERENCES farmers (id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(1000),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_farmer_id ON reviews (farmer_id);
CREATE UNIQUE INDEX uq_reviews_order_id ON reviews (order_id);
