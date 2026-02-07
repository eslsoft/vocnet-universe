"""
ConceptNet data source - provides common-sense relations.
"""
from typing import Optional, List, Dict
import gzip
import json
from pathlib import Path
import logging

from .base import DataSource
from ..models import WordInfo, VocabRelation, RelationType


logger = logging.getLogger(__name__)


class ConceptNetSource(DataSource):
    """
    ConceptNet-based data source for common-sense relations.

    Provides:
    - IsA, PartOf, UsedFor relations
    - Common-sense knowledge links
    """

    def __init__(self, dump_path: str, config: Dict = None):
        """
        Initialize with ConceptNet dump path.

        Args:
            dump_path: Path to conceptnet-assertions-5.7.0.csv.gz
            config: Additional configuration (e.g., min_weight)
        """
        super().__init__(config)
        self.dump_path = Path(dump_path)
        self.min_weight = self.config.get('min_weight', 1.5)
        self.relations_cache = {}

    def _do_initialize(self):
        """
        Load and index ConceptNet relations.

        This may take a while for the full dump, so we build an index.
        """
        if not self.dump_path.exists():
            logger.warning(f"ConceptNet dump not found at {self.dump_path}")
            return

        logger.info(f"Indexing ConceptNet dump (this may take a minute)...")
        count = 0

        try:
            with gzip.open(self.dump_path, 'rt', encoding='utf-8') as f:
                for line in f:
                    try:
                        cols = line.strip().split('\t')
                        if len(cols) < 5:
                            continue

                        # Parse relation, source, target
                        rel = cols[1].split('/')[-1]
                        source_uri = cols[2]
                        target_uri = cols[3]

                        # Parse metadata for weight
                        try:
                            meta = json.loads(cols[4])
                            weight = meta.get('weight', 1.0)
                        except:
                            weight = 1.0

                        # Filter by weight
                        if weight < self.min_weight:
                            continue

                        # Extract English words
                        source_word = self._extract_word(source_uri)
                        target_word = self._extract_word(target_uri)

                        if not source_word or not target_word:
                            continue

                        # Map relation type
                        rel_type = self._map_relation(rel)
                        if not rel_type:
                            continue

                        # Store in cache
                        if source_word not in self.relations_cache:
                            self.relations_cache[source_word] = []

                        self.relations_cache[source_word].append({
                            'target': target_word,
                            'type': rel_type,
                            'weight': weight
                        })

                        count += 1
                        if count % 100000 == 0:
                            logger.info(f"  Indexed {count} relations...")

                    except Exception as e:
                        continue

            logger.info(f"ConceptNet indexed: {count} relations for {len(self.relations_cache)} words")

        except Exception as e:
            logger.error(f"Failed to load ConceptNet: {e}")
            raise

    def _extract_word(self, uri: str) -> Optional[str]:
        """Extract English word from ConceptNet URI."""
        # URI format: /c/en/word or /c/en/word/pos
        parts = uri.split('/')
        if len(parts) < 4 or parts[2] != 'en':
            return None
        word = parts[3].replace('_', ' ').lower()
        return word if len(word) > 1 else None

    def _map_relation(self, rel: str) -> Optional[RelationType]:
        """Map ConceptNet relation to our RelationType."""
        mapping = {
            'IsA': RelationType.HYPERNYM,
            'PartOf': RelationType.RELATED,
            'HasA': RelationType.RELATED,
            'UsedFor': RelationType.RELATED,
            'CapableOf': RelationType.RELATED,
            'AtLocation': RelationType.RELATED,
            'Synonym': RelationType.SYNONYM,
            'Antonym': RelationType.ANTONYM,
        }
        return mapping.get(rel)

    def get_word_info(self, word: str) -> Optional[WordInfo]:
        """
        ConceptNet doesn't provide base word info.
        Returns None (rely on other sources for base info).
        """
        return None

    def get_relations(self, word: str) -> List[VocabRelation]:
        """
        Get ConceptNet relations for a word.

        Returns:
            List of VocabRelation objects
        """
        self.initialize()

        if word not in self.relations_cache:
            return []

        relations = []
        for rel_data in self.relations_cache[word]:
            relations.append(VocabRelation(
                target_id=f"word_{rel_data['target']}",
                type=rel_data['type'],
                strength=min(rel_data['weight'] / 3.0, 1.0)  # Normalize weight
            ))

        return relations
