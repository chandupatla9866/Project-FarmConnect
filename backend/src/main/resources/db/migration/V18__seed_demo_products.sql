INSERT INTO products (id, farmer_id, category_id, name, description, unit, price_per_unit,
                       quantity_available, organic, harvest_date, image_url, status) VALUES
    ('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111201',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Fresh Tomatoes',
     'Vine-ripened, pesticide-free tomatoes picked this week.', 'KG', 32.00, 180, TRUE,
     CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111201',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Brinjal (Eggplant)',
     'Glossy purple brinjals, ideal for bharta and curries.', 'KG', 28.00, 120, TRUE,
     CURRENT_DATE - INTERVAL '1 days', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111201',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Okra (Bhindi)',
     'Tender okra harvested at peak freshness.', 'KG', 36.00, 90, FALSE,
     CURRENT_DATE - INTERVAL '3 days', 'https://images.unsplash.com/photo-1638336017184-c6d20bc7a2f5', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111304', '11111111-1111-1111-1111-111111111201',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Green Cabbage',
     'Crisp, tightly packed cabbage heads.', 'KG', 20.00, 150, FALSE,
     CURRENT_DATE - INTERVAL '4 days', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111305', '11111111-1111-1111-1111-111111111201',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Red Onion',
     'Farm-stored onions, medium size, low moisture.', 'KG', 25.00, 300, FALSE,
     CURRENT_DATE - INTERVAL '10 days', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111306', '11111111-1111-1111-1111-111111111202',
     (SELECT id FROM categories WHERE name = 'Leafy Greens'), 'Baby Spinach',
     'Washed and bunched baby spinach leaves.', 'KG', 18.00, 60, TRUE,
     CURRENT_DATE, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111307', '11111111-1111-1111-1111-111111111202',
     (SELECT id FROM categories WHERE name = 'Leafy Greens'), 'Fresh Coriander',
     'Fragrant coriander bunches, cut same-day.', 'KG', 40.00, 35, TRUE,
     CURRENT_DATE, 'https://images.unsplash.com/photo-1615485291234-4bea88a95dc0', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111308', '11111111-1111-1111-1111-111111111202',
     (SELECT id FROM categories WHERE name = 'Leafy Greens'), 'Fenugreek (Methi)',
     'Tender methi leaves, great for parathas and sabzi.', 'KG', 22.00, 40, TRUE,
     CURRENT_DATE - INTERVAL '1 days', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 'ACTIVE'),

    ('11111111-1111-1111-1111-111111111309', '11111111-1111-1111-1111-111111111202',
     (SELECT id FROM categories WHERE name = 'Vegetables'), 'Carrots',
     'Sweet, crunchy carrots grown in sandy loam soil.', 'KG', 30.00, 100, FALSE,
     CURRENT_DATE - INTERVAL '5 days', 'https://images.unsplash.com/photo-1447175008436-054170c2e979', 'ACTIVE'),

    ('11111111-1111-1111-1111-11111111130a', '11111111-1111-1111-1111-111111111202',
     (SELECT id FROM categories WHERE name = 'Spices & Herbs'), 'Green Chilli',
     'Medium-heat green chillies, hand-picked.', 'KG', 45.00, 25, FALSE,
     CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1583119912267-cc97c911e416', 'OUT_OF_STOCK');
