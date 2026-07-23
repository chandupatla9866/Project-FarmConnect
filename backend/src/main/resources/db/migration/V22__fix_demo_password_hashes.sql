-- V17 accidentally gave every seeded LOCAL account (farmers, buyers, delivery) the same
-- password hash ("Farmer@123"), even though docs/SETUP.md documents distinct per-role
-- demo passwords (Buyer@123, Delivery@123). V17 has already run in deployed environments
-- and cannot be edited in place, so this migration corrects the hashes to match the docs.

UPDATE users SET password_hash = '$2b$10$Q3z0GOEpT1Vg7/AONobbJ.O6EzKdidXXViozrgxYDGJejyePzCQhG'
WHERE email IN ('buyer1@farmconnect.ai', 'buyer2@farmconnect.ai');

UPDATE users SET password_hash = '$2b$10$6Nb/tgwdl9aYxeh8dxo2BOFP.TF.gVR4kSBSY3rXTCLp1tP5Vmlq.'
WHERE email = 'delivery1@farmconnect.ai';
