ALTER TABLE deliveries
    ADD COLUMN otp VARCHAR(6),
    ADD COLUMN delivery_fee NUMERIC(8, 2);
