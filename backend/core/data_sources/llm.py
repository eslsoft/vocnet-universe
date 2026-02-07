"""
LLM data source - loads semantic relations from llm_distill output.
"""
from typing import Optional, List, Dict
import json
from pathlib import Path
import logging

from .base import DataSource
from ..models import WordInfo, VocabRelation, RelationType


logger = logging.getLogger(__name__)


class LLMSource(DataSource):
    """
    LLM-based semantic graph data source.

    Loads pre-computed semantic associations from llm_distill.py output.

    Provides:
    - Rich semantic relations (synonym, antonym, category, etc.)
    - Human-learning-optimized associations
    """

    def __init__(self, graph_path: str, config: Dict = None):
        """
        Initialize with path to LLM semantic graph.

        Args:
            graph_path: Path to llm_semantic_graph.json
            config: Additional configuration
        """
        super().__init__(config)
        self.graph_path = Path(graph_path)
        self.graph_data = {}

    def _do_initialize(self):
        """Load LLM semantic graph."""
        if not self.graph_path.exists():
            logger.warning(f"LLM graph not found at {self.graph_path}")
            return

        try:
            with self.graph_path.open('r', encoding='utf-8') as f:
                self.graph_data = json.load(f)
            logger.info(f"Loaded LLM graph with {len(self.graph_data)} words")
        except Exception as e:
            logger.error(f"Failed to load LLM graph: {e}")
            raise

    def get_word_info(self, word: str) -> Optional[WordInfo]:
        """
        Check if word exists in LLM graph.

        Returns:
            Basic WordInfo if word exists in graph, None otherwise
        """
        self.initialize()

        if word not in self.graph_data:
            return None

        # LLM source provides relations, not base info
        # Return minimal WordInfo to indicate word is known
        return WordInfo(
            word=word,
            metadata={'in_llm_graph': True}
        )

    def get_relations(self, word: str) -> List[VocabRelation]:
        """
        Get LLM-derived semantic relations.

        Returns:
            List of VocabRelation objects from LLM associations
        """
        self.initialize()

        if word not in self.graph_data:
            return []

        relations = []
        associations = self.graph_data[word]

        # Map LLM relation types to our RelationType
        type_map = {
            'synonym': RelationType.SYNONYM,
            'antonym': RelationType.ANTONYM,
            'category': RelationType.HYPERNYM,  # Category ~= hypernym
            'attribute': RelationType.RELATED,
            'action': RelationType.RELATED,
            'context': RelationType.RELATED,
            'component': RelationType.RELATED,
            'consequence': RelationType.RELATED,
        }

        for assoc in associations:
            target = assoc.get('target', '').strip().lower()
            rel_type_str = assoc.get('type', 'related').lower()

            if not target:
                continue

            rel_type = type_map.get(rel_type_str, RelationType.RELATED)

            relations.append(VocabRelation(
                target_id=f"word_{target}",
                type=rel_type,
                strength=0.8  # LLM associations are high quality
            ))

        return relations

    def get_word_associations(self, word: str) -> List[Dict]:
        """
        Get raw LLM associations for a word.

        Args:
            word: Word to look up

        Returns:
            List of raw association dicts
        """
        self.initialize()
        return self.graph_data.get(word, [])
