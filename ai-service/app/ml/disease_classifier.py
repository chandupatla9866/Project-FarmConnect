import hashlib
import json
import random
from abc import ABC, abstractmethod

from app.core.config import DATA_DIR
from app.schemas.disease import DiseaseDetectionResponse

with open(DATA_DIR / "disease_labels.json") as f:
    _LABELS = json.load(f)


class DiseaseClassifier(ABC):
    """Swap point for a real TensorFlow/OpenCV image classification model."""

    @abstractmethod
    def classify(self, image_bytes: bytes) -> DiseaseDetectionResponse:
        raise NotImplementedError


class MockHashDiseaseClassifier(DiseaseClassifier):
    """
    Deterministically buckets the image (by content hash) into one of the seeded
    disease labels, so the same upload always returns the same "prediction" while
    still looking like real inference output. This is the explicit swap point for
    a future trained classifier - only this class needs to change.
    """

    def classify(self, image_bytes: bytes) -> DiseaseDetectionResponse:
        digest = hashlib.sha256(image_bytes).hexdigest()
        index = int(digest[:8], 16) % len(_LABELS)
        label = _LABELS[index]

        # Deterministic "confidence" derived from the same hash, in a plausible range.
        rng = random.Random(digest)
        confidence = round(rng.uniform(78.0, 97.5), 1)

        return DiseaseDetectionResponse(
            detectedCondition=label["detectedCondition"],
            confidenceScore=confidence,
            severity=label["severity"],
            recommendedAction=label["recommendedAction"],
            affectedCropTypeGuess=label["affectedCropTypeGuess"],
        )


disease_classifier: DiseaseClassifier = MockHashDiseaseClassifier()
