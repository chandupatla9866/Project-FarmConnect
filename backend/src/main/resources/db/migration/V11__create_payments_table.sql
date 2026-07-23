CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
    amount           NUMERIC(12, 2) NOT NULL,
    payment_method   VARCHAR(20) NOT NULL DEFAULT 'COD',
    payment_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_ref  VARCHAR(120),
    paid_at          TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_status ON payments (payment_status);
