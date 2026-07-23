INSERT INTO orders (id, order_number, buyer_id, farmer_id, status, total_amount, delivery_address,
                     delivery_latitude, delivery_longitude, expected_delivery_date, notes, created_at) VALUES
    ('11111111-1111-1111-1111-111111111401', 'FC-ORD-000001', '11111111-1111-1111-1111-111111111203',
     '11111111-1111-1111-1111-111111111201', 'PENDING', 460.00, 'Green Meadows Apartments, Baner Road, Pune',
     18.5590, 73.7868, CURRENT_DATE + INTERVAL '2 days', 'Weekly community vegetable basket', now() - INTERVAL '1 days'),

    ('11111111-1111-1111-1111-111111111402', 'FC-ORD-000002', '11111111-1111-1111-1111-111111111204',
     '11111111-1111-1111-1111-111111111201', 'ACCEPTED', 488.00, 'Spice Route Restaurant, FC Road, Pune',
     18.5236, 73.8478, CURRENT_DATE + INTERVAL '1 days', 'Bulk order for weekend menu', now() - INTERVAL '2 days'),

    ('11111111-1111-1111-1111-111111111403', 'FC-ORD-000003', '11111111-1111-1111-1111-111111111203',
     '11111111-1111-1111-1111-111111111202', 'DELIVERED', 170.00, 'Green Meadows Apartments, Baner Road, Pune',
     18.5590, 73.7868, CURRENT_DATE - INTERVAL '3 days', 'Leafy greens for monthly subscription', now() - INTERVAL '7 days'),

    ('11111111-1111-1111-1111-111111111404', 'FC-ORD-000004', '11111111-1111-1111-1111-111111111204',
     '11111111-1111-1111-1111-111111111202', 'REJECTED', 180.00, 'Spice Route Restaurant, FC Road, Pune',
     18.5236, 73.8478, CURRENT_DATE - INTERVAL '1 days', 'Out of stock at time of order', now() - INTERVAL '4 days');

INSERT INTO order_items (id, order_id, product_id, quantity, price_per_unit_at_order, subtotal) VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111301', 10, 32.00, 320.00),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111302', 5, 28.00, 140.00),

    (gen_random_uuid(), '11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111303', 8, 36.00, 288.00),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111304', 10, 20.00, 200.00),

    (gen_random_uuid(), '11111111-1111-1111-1111-111111111403', '11111111-1111-1111-1111-111111111306', 5, 18.00, 90.00),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111403', '11111111-1111-1111-1111-111111111307', 2, 40.00, 80.00),

    (gen_random_uuid(), '11111111-1111-1111-1111-111111111404', '11111111-1111-1111-1111-111111111309', 6, 30.00, 180.00);

INSERT INTO payments (id, order_id, amount, payment_method, payment_status, transaction_ref, paid_at) VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111403', 170.00, 'UPI', 'COMPLETED', 'DEMO-TXN-0003', now() - INTERVAL '3 days');

INSERT INTO reviews (id, order_id, buyer_id, farmer_id, rating, comment, created_at) VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111403', '11111111-1111-1111-1111-111111111203',
     '11111111-1111-1111-1111-111111111202', 5, 'Extremely fresh greens, delivered right on time!', now() - INTERVAL '2 days');

INSERT INTO notifications (id, user_id, title, message, type, is_read, related_entity_type, related_entity_id, created_at) VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'New order received', 'Green Meadows Apartments placed a new order (FC-ORD-000001) worth ₹460.00.', 'ORDER_UPDATE', FALSE, 'ORDER', '11111111-1111-1111-1111-111111111401', now() - INTERVAL '1 days'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Order accepted', 'You accepted order FC-ORD-000002 from Spice Route Restaurant.', 'ORDER_UPDATE', TRUE, 'ORDER', '11111111-1111-1111-1111-111111111402', now() - INTERVAL '2 days'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Weather alert', 'Heavy rain expected in Pune over the next 48 hours. Protect harvested stock.', 'WEATHER', FALSE, NULL, NULL, now() - INTERVAL '5 hours'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'Payment received', 'Payment of ₹170.00 received for order FC-ORD-000003.', 'PAYMENT', FALSE, 'ORDER', '11111111-1111-1111-1111-111111111403', now() - INTERVAL '3 days');
