"""
Abstract base class for data sources.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ..models import WordInfo, VocabRelation


class DataSource(ABC):
    """
    Abstract base class for vocabulary data sources.

    Each data source provides specific aspects of word information:
    - WordNet: hierarchy, definitions, POS
    - ConceptNet: common-sense relations
    - LLM: semantic associations
    - Spacy: word vectors, POS tagging
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize data source with optional configuration.

        Args:
            config: Source-specific configuration dict
        """
        self.config = config or {}
        self._initialized = False

    def initialize(self):
        """
        Load/prepare the data source (lazy initialization).
        Called automatically on first use.
        """
        if not self._initialized:
            self._do_initialize()
            self._initialized = True

    @abstractmethod
    def _do_initialize(self):
        """
        Subclasses implement actual initialization logic here.
        """
        pass

    @abstractmethod
    def get_word_info(self, word: str) -> Optional[WordInfo]:
        """
        Get basic word information.

        Args:
            word: The word to look up

        Returns:
            WordInfo object if found, None otherwise
        """
        pass

    @abstractmethod
    def get_relations(self, word: str) -> List[VocabRelation]:
        """
        Get relations for a word.

        Args:
            word: The word to find relations for

        Returns:
            List of VocabRelation objects
        """
        pass

    def enrich_word(self, word_info: WordInfo) -> WordInfo:
        """
        Enrich an existing WordInfo with additional data from this source.

        Args:
            word_info: WordInfo to enrich

        Returns:
            Enriched WordInfo (may modify in-place)
        """
        # Default implementation: add relations
        self.initialize()
        relations = self.get_relations(word_info.word)
        word_info.relations.extend(relations)
        return word_info

    def supports_batch(self) -> bool:
        """
        Returns True if this source supports batch operations.
        """
        return False

    def get_batch_info(self, words: List[str]) -> Dict[str, WordInfo]:
        """
        Get info for multiple words at once (if supported).

        Args:
            words: List of words to look up

        Returns:
            Dict mapping word -> WordInfo
        """
        # Default implementation: iterate
        result = {}
        for word in words:
            info = self.get_word_info(word)
            if info:
                result[word] = info
        return result
