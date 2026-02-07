"""
Ranking processor - assigns frequency and importance scores.
"""
from typing import List, Dict
from collections import Counter
import logging

from .base import Processor
from ..models import WordInfo


logger = logging.getLogger(__name__)


class FrequencyRankingProcessor(Processor):
    """
    Assigns frequency scores based on:
    1. Number of incoming relations (in-degree)
    2. Hierarchy level (higher = more specific = lower frequency)
    3. Manual frequency data if available

    Config:
        base_frequency: Base frequency for all words (default: 1000)
        level_multiplier: Multiplier per hierarchy level (default: 500)
    """

    def __init__(self, config: Dict = None):
        super().__init__(config)
        self.base_frequency = self.config.get('base_frequency', 1000)
        self.level_multiplier = self.config.get('level_multiplier', 500)

    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Assign frequency scores to words.

        Args:
            words: List of WordInfo objects

        Returns:
            Words with updated frequency values
        """
        logger.info(f"Computing frequency scores for {len(words)} words...")

        # Count in-degrees (how many words point to each word)
        in_degree = Counter()

        for word in words:
            for rel in word.relations:
                target_id = rel.target_id
                in_degree[target_id] += 1

        # Assign frequencies
        for word in words:
            # Base frequency
            freq = self.base_frequency

            # Boost based on in-degree (more connections = more common)
            degree_boost = in_degree[word.id] * 50
            freq += degree_boost

            # Adjust based on hierarchy level
            # Lower levels (0-2) = more abstract/common = higher frequency
            # Higher levels (3-6) = more specific = lower frequency
            level_adjustment = (6 - word.hierarchy_level) * self.level_multiplier
            freq += level_adjustment

            # Cap at reasonable ranges
            word.frequency = max(800, min(12000, freq))

        # Log distribution
        freq_ranges = {
            'very_high': sum(1 for w in words if w.frequency > 9000),
            'high': sum(1 for w in words if 7000 <= w.frequency <= 9000),
            'medium': sum(1 for w in words if 3000 <= w.frequency < 7000),
            'low': sum(1 for w in words if w.frequency < 3000)
        }
        logger.info(f"Frequency distribution: {freq_ranges}")

        return words
