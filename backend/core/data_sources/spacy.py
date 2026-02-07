"""
Spacy data source - provides word vectors and POS tagging.
"""
from typing import Optional, List, Dict
import logging
import numpy as np

from .base import DataSource
from ..models import WordInfo, VocabRelation


logger = logging.getLogger(__name__)


class SpacySource(DataSource):
    """
    Spacy-based data source for word vectors and POS.

    Provides:
    - Word embeddings/vectors
    - POS tagging
    - Similarity computation
    """

    def __init__(self, model: str = "en_core_web_md", config: Dict = None):
        """
        Initialize with a spacy model.

        Args:
            model: Spacy model name (default: en_core_web_md)
            config: Additional configuration
        """
        super().__init__(config)
        self.model_name = model
        self.nlp = None
        self._word_cache = {}

    def _do_initialize(self):
        """Load spacy model."""
        try:
            import spacy
            logger.info(f"Loading spacy model: {self.model_name}")
            self.nlp = spacy.load(self.model_name)
            logger.info("Spacy model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load spacy model: {e}")
            logger.info("Try running: python -m spacy download en_core_web_md")
            raise

    def get_word_info(self, word: str) -> Optional[WordInfo]:
        """
        Get word info using spacy.

        Returns:
            WordInfo with POS and vector metadata
        """
        self.initialize()

        # Check cache
        if word in self._word_cache:
            return self._word_cache[word]

        doc = self.nlp(word)
        if not doc or len(doc) == 0:
            return None

        token = doc[0]

        # Check if has vector
        if not token.has_vector:
            return None

        # Map POS
        pos = token.pos_.lower()
        if pos not in ['noun', 'verb', 'adj', 'adv']:
            pos = 'noun'  # Default

        word_info = WordInfo(
            word=word,
            pos=pos,
            metadata={
                'vector': token.vector,
                'has_vector': True
            }
        )

        self._word_cache[word] = word_info
        return word_info

    def get_relations(self, word: str) -> List[VocabRelation]:
        """
        Spacy doesn't provide explicit relations.
        Use processors for similarity-based relations.
        """
        return []

    def get_vector(self, word: str) -> Optional[np.ndarray]:
        """
        Get word vector.

        Args:
            word: Word to vectorize

        Returns:
            numpy array or None
        """
        self.initialize()
        doc = self.nlp(word)
        if doc and len(doc) > 0 and doc[0].has_vector:
            return doc[0].vector
        return None

    def get_batch_vectors(self, words: List[str]) -> Dict[str, np.ndarray]:
        """
        Get vectors for multiple words efficiently.

        Args:
            words: List of words

        Returns:
            Dict mapping word -> vector
        """
        self.initialize()
        result = {}
        docs = list(self.nlp.pipe(words))

        for word, doc in zip(words, docs):
            if doc and len(doc) > 0 and doc[0].has_vector:
                result[word] = doc[0].vector

        return result

    def supports_batch(self) -> bool:
        return True
