"""
Semantic processor - adds similarity-based relations using word vectors.
"""
from typing import List, Dict, Optional
import logging
import numpy as np

from .base import Processor
from ..models import WordInfo, VocabRelation, RelationType


logger = logging.getLogger(__name__)


class SemanticProcessor(Processor):
    """
    Adds semantic similarity relations based on word embeddings.

    Requires words to have vector metadata from SpacySource.

    Config:
        max_relations: Max similar words to link per word (default: 3)
        min_similarity: Minimum cosine similarity threshold (default: 0.6)
    """

    def __init__(self, config: Dict = None):
        super().__init__(config)
        self.max_relations = self.config.get('max_relations', 3)
        self.min_similarity = self.config.get('min_similarity', 0.6)

    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Add semantic similarity relations.

        Args:
            words: List of WordInfo objects

        Returns:
            Words with added semantic relations
        """
        logger.info(f"Computing semantic relations for {len(words)} words...")

        # Extract vectors
        word_vectors = []
        valid_words = []

        for word in words:
            vector = word.metadata.get('vector')
            if vector is not None:
                word_vectors.append(vector)
                valid_words.append(word)

        if not word_vectors:
            logger.warning("No word vectors found, skipping semantic processing")
            return words

        logger.info(f"Computing similarities for {len(valid_words)} words with vectors")

        # Stack vectors for batch computation
        vectors_np = np.stack(word_vectors)

        # Compute pairwise cosine similarities
        # Normalize vectors
        norms = np.linalg.norm(vectors_np, axis=1, keepdims=True)
        vectors_norm = vectors_np / (norms + 1e-8)

        # Cosine similarity matrix
        similarity_matrix = np.dot(vectors_norm, vectors_norm.T)

        # Add relations
        added_count = 0
        for i, word in enumerate(valid_words):
            # Get similarities for this word
            sims = similarity_matrix[i]

            # Find top similar words (excluding self)
            # Set self-similarity to -1 to exclude it
            sims[i] = -1

            # Get top-k indices
            top_indices = np.argsort(sims)[-self.max_relations:][::-1]

            # Add relations if above threshold
            for idx in top_indices:
                sim_value = sims[idx]
                if sim_value >= self.min_similarity:
                    target_word = valid_words[idx]

                    # Avoid duplicate relations
                    existing = any(r.target_id == target_word.id for r in word.relations)
                    if not existing:
                        word.relations.append(VocabRelation(
                            target_id=target_word.id,
                            type=RelationType.RELATED,
                            strength=float(sim_value)
                        ))
                        added_count += 1

        logger.info(f"Added {added_count} semantic relations")

        return words
