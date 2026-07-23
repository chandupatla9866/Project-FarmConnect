CREATE TABLE ai_predictions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_type    VARCHAR(30) NOT NULL,
    requested_by       UUID NOT NULL REFERENCES users (id),
    farmer_id          UUID REFERENCES farmers (id),
    input_payload      JSONB NOT NULL,
    output_payload     JSONB NOT NULL,
    confidence_score   NUMERIC(5, 2),
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_predictions_farmer_id ON ai_predictions (farmer_id, prediction_type);
CREATE INDEX idx_ai_predictions_requested_by ON ai_predictions (requested_by);
