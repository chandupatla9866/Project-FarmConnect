CREATE TABLE orders (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number           VARCHAR(30) NOT NULL UNIQUE,
    buyer_id               UUID NOT NULL REFERENCES buyers (id),
    farmer_id              UUID NOT NULL REFERENCES farmers (id),
    status                 VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount           NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_address       VARCHAR(255),
    delivery_latitude      NUMERIC(9, 6),
    delivery_longitude     NUMERIC(9, 6),
    expected_delivery_date DATE,
    notes                  VARCHAR(500),
    created_at             TIMESTAMP NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders (farmer_id);
CREATE INDEX idx_orders_status ON orders (status);
