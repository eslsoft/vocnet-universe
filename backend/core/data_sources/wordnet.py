"""
WordNet data source - provides hierarchy and definitions.
"""
from typing import Optional, List
import logging

from .base import DataSource
from ..models import WordInfo, VocabRelation, RelationType


logger = logging.getLogger(__name__)


class WordNetSource(DataSource):
    """
    WordNet-based data source for word hierarchy and definitions.

    Provides:
    - Word definitions
    - Hypernym/hyponym relations
    - Part of speech
    - Hierarchy depth information
    """

    def _do_initialize(self):
        """Download and load WordNet."""
        try:
            import nltk
            from nltk.corpus import wordnet as wn

            # Try to load, download if needed
            try:
                wn.ensure_loaded()
            except:
                logger.info("Downloading WordNet...")
                nltk.download('wordnet', quiet=True)
                nltk.download('omw-1.4', quiet=True)

            self.wn = wn
            logger.info("WordNet initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize WordNet: {e}")
            raise

    def get_word_info(self, word: str) -> Optional[WordInfo]:
        """
        Get basic word info from WordNet.

        Returns:
            WordInfo with definition, POS, and basic metadata
        """
        self.initialize()

        synsets = self.wn.synsets(word)
        if not synsets:
            return None

        # Use the most common synset (first one)
        synset = synsets[0]

        # Extract POS
        pos_map = {'n': 'noun', 'v': 'verb', 'a': 'adjective', 'r': 'adverb', 's': 'adjective'}
        pos = pos_map.get(synset.pos(), 'noun')

        # Get definition
        definition = synset.definition()

        # Calculate hierarchy depth (for hierarchy_level estimation)
        depth = synset.min_depth() if hasattr(synset, 'min_depth') else 5

        # Estimate first_recorded_year based on depth (deeper = more recent/specific)
        # Ancient words (shallow depth) = older years
        first_year = max(900, 2000 - (depth * 100))

        word_info = WordInfo(
            word=word,
            pos=pos,
            definition=definition,
            hierarchy_level=min(depth, 6),  # Cap at level 6
            first_recorded_year=first_year,
            metadata={'synset': synset.name(), 'depth': depth}
        )

        return word_info

    def get_relations(self, word: str) -> List[VocabRelation]:
        """
        Get WordNet relations (hypernyms, hyponyms, synonyms).

        Returns:
            List of VocabRelation objects
        """
        self.initialize()

        relations = []
        synsets = self.wn.synsets(word)

        if not synsets:
            return relations

        synset = synsets[0]

        # Hypernyms (is-a, parent)
        for hypernym in synset.hypernyms():
            for lemma in hypernym.lemmas():
                target_word = lemma.name().replace('_', ' ').lower()
                if target_word != word:
                    relations.append(VocabRelation(
                        target_id=f"word_{target_word}",
                        type=RelationType.HYPERNYM,
                        strength=0.8
                    ))
                    break  # Only take one lemma per synset

        # Hyponyms (has-a, children)
        for hyponym in synset.hyponyms()[:3]:  # Limit to 3
            for lemma in hyponym.lemmas():
                target_word = lemma.name().replace('_', ' ').lower()
                if target_word != word:
                    relations.append(VocabRelation(
                        target_id=f"word_{target_word}",
                        type=RelationType.HYPONYM,
                        strength=0.7
                    ))
                    break

        # Synonyms (same synset)
        for lemma in synset.lemmas():
            target_word = lemma.name().replace('_', ' ').lower()
            if target_word != word:
                relations.append(VocabRelation(
                    target_id=f"word_{target_word}",
                    type=RelationType.SYNONYM,
                    strength=0.9
                ))

        return relations
