"""
Abstract base class for processors.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..models import WordInfo


class Processor(ABC):
    """
    Abstract base class for word processors.

    Processors transform and enrich WordInfo objects:
    - HierarchyProcessor: assigns hierarchy levels
    - SemanticProcessor: adds semantic relations
    - ClusteringProcessor: assigns galaxy groupings
    - RankingProcessor: computes importance/frequency scores
    """

    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize processor with configuration.

        Args:
            config: Processor-specific configuration
        """
        self.config = config or {}

    @abstractmethod
    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Process a list of words and return enriched versions.

        Args:
            words: List of WordInfo objects to process

        Returns:
            List of processed WordInfo objects (may modify in-place)
        """
        pass

    def get_name(self) -> str:
        """
        Get a human-readable name for this processor.
        """
        return self.__class__.__name__
