CREATE TABLE notifications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title                VARCHAR(150) NOT NULL,
    message              VARCHAR(500) NOT NULL,
    type                 VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    is_read              BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type  VARCHAR(50),
    related_entity_id    UUID,
    created_at           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id, is_read);
