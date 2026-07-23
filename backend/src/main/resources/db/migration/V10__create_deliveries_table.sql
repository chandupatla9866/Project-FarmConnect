CREATE TABLE deliveries (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id               UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    delivery_partner_id    UUID REFERENCES users (id),
    pickup_address         VARCHAR(255),
    drop_address           VARCHAR(255),
    status                 VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    pickup_time            TIMESTAMP,
    delivery_time          TIMESTAMP,
    estimated_distance_km  NUMERIC(8, 2),
    route_info             JSONB,
    created_at             TIMESTAMP NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_partner_id ON deliveries (delivery_partner_id);
CREATE INDEX idx_deliveries_status ON deliveries (status);
