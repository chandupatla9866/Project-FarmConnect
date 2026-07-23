-- Demo password for every LOCAL account below is documented in docs/SETUP.md.
-- Farmer accounts: Farmer@123   |   Buyer accounts: Buyer@123   |   Admin: Admin@123   |   Delivery: Delivery@123
-- Hashes are BCrypt (verifiable by Spring Security's BCryptPasswordEncoder).

INSERT INTO users (id, full_name, email, password_hash, phone, auth_provider, enabled) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Ramesh Patil', 'farmer1@farmconnect.ai', '$2b$10$VDpINakVh/Q5xMAzLjkmEOsPrPF8K21Vuqq63XwWJAcmKgn29g7OG', '9876500001', 'LOCAL', TRUE),
    ('11111111-1111-1111-1111-111111111102', 'Lakshmi Devi', 'farmer2@farmconnect.ai', '$2b$10$VDpINakVh/Q5xMAzLjkmEOsPrPF8K21Vuqq63XwWJAcmKgn29g7OG', '9876500002', 'LOCAL', TRUE),
    ('11111111-1111-1111-1111-111111111103', 'Green Meadows Apartments', 'buyer1@farmconnect.ai', '$2b$10$VDpINakVh/Q5xMAzLjkmEOsPrPF8K21Vuqq63XwWJAcmKgn29g7OG', '9876500003', 'LOCAL', TRUE),
    ('11111111-1111-1111-1111-111111111104', 'Spice Route Restaurant', 'buyer2@farmconnect.ai', '$2b$10$VDpINakVh/Q5xMAzLjkmEOsPrPF8K21Vuqq63XwWJAcmKgn29g7OG', '9876500004', 'LOCAL', TRUE),
    ('11111111-1111-1111-1111-111111111105', 'Platform Admin', 'admin@farmconnect.ai', '$2b$10$NGPUfOL9QlMauSKv/RblpOyOIXmUOhmXiLLyHsDoW2TdhGtbUgjua', '9876500005', 'LOCAL', TRUE),
    ('11111111-1111-1111-1111-111111111106', 'Suresh Kumar', 'delivery1@farmconnect.ai', '$2b$10$VDpINakVh/Q5xMAzLjkmEOsPrPF8K21Vuqq63XwWJAcmKgn29g7OG', '9876500006', 'LOCAL', TRUE);

INSERT INTO user_roles (user_id, role_id)
SELECT '11111111-1111-1111-1111-111111111101'::uuid, id FROM roles WHERE name = 'ROLE_FARMER'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111102'::uuid, id FROM roles WHERE name = 'ROLE_FARMER'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111103'::uuid, id FROM roles WHERE name = 'ROLE_BUYER'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111104'::uuid, id FROM roles WHERE name = 'ROLE_BUYER'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111105'::uuid, id FROM roles WHERE name = 'ROLE_ADMIN'
UNION ALL
SELECT '11111111-1111-1111-1111-111111111106'::uuid, id FROM roles WHERE name = 'ROLE_DELIVERY';

INSERT INTO farmers (id, user_id, farm_name, farm_address, farm_city, farm_state, farm_pincode,
                      farm_size_acres, farming_experience_years, primary_crop_types, bio,
                      farm_latitude, farm_longitude, verified) VALUES
    ('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111101',
     'Patil Organic Farms', 'Village Wagholi, Pune-Nagar Road', 'Pune', 'Maharashtra', '412207',
     12.50, 18, 'Tomato, Brinjal, Okra, Cabbage', 'Third-generation organic farmer specialising in pesticide-free vegetables.',
     18.5793, 73.9089, TRUE),
    ('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111102',
     'Devi Green Farms', 'Near Sinhagad Road', 'Pune', 'Maharashtra', '411041',
     8.00, 10, 'Spinach, Coriander, Fenugreek, Carrot', 'Focused on leafy greens grown with drip irrigation and natural compost.',
     18.4634, 73.8231, TRUE);

INSERT INTO buyers (id, user_id, buyer_type, business_name, delivery_address, city, state, pincode, latitude, longitude) VALUES
    ('11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111103',
     'APARTMENT_COMMUNITY', 'Green Meadows Apartments', 'Baner Road, Pune', 'Pune', 'Maharashtra', '411045', 18.5590, 73.7868),
    ('11111111-1111-1111-1111-111111111204', '11111111-1111-1111-1111-111111111104',
     'RESTAURANT', 'Spice Route Restaurant', 'FC Road, Pune', 'Pune', 'Maharashtra', '411004', 18.5236, 73.8478);
