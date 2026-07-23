CREATE TABLE order_items (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                 UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id                UUID NOT NULL REFERENCES products (id),
    quantity                 NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    price_per_unit_at_order  NUMERIC(10, 2) NOT NULL,
    subtotal                 NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
