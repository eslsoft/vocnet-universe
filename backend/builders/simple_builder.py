"""
Simple universe builder.

Uses only WordNet for clean, straightforward hierarchical universes.
Best for: Educational purposes, clear word relationships without noise.
"""
from typing import List
import logging

from core import UniverseBuilder
from core.data_sources import WordNetSource, SpacySource
from core.processors import (
    HierarchyProcessor,
    VectorClusteringProcessor,
    FrequencyRankingProcessor
)
from core.exporter import V4Exporter
from core.models import UniverseData


logger = logging.getLogger(__name__)


def build_simple_universe(
    wordlist: List[str],
    spacy_model: str = "en_core_web_md",
    output_path: str = None,
    num_galaxies: int = 5
) -> UniverseData:
    """
    Build a simple WordNet-based universe.

    Uses:
    - WordNet for hierarchy and definitions
    - Spacy for vectors (used in clustering)
    - Vector clustering for galaxy assignment

    Args:
        wordlist: List of words to include
        spacy_model: Spacy model name
        output_path: Optional output path
        num_galaxies: Number of galaxy clusters

    Returns:
        UniverseData object
    """
    logger.info("🌌 Building Simple WordNet Universe...")

    # Create builder
    builder = UniverseBuilder(name="simple_wordnet")

    # Add sources
    builder.add_source(WordNetSource())
    builder.add_source(SpacySource(spacy_model))

    # Add processors
    builder.add_processor(HierarchyProcessor())
    builder.add_processor(VectorClusteringProcessor({
        'num_galaxies': num_galaxies,
        'random_seed': 42
    }))
    builder.add_processor(FrequencyRankingProcessor())

    # Build
    universe = builder.build(wordlist)

    # Export
    if output_path:
        exporter = V4Exporter()
        exporter.export(universe, output_path)

    return universe


if __name__ == "__main__":
    """
    Quick test of simple builder.
    """
    import sys

    test_words = [
        "animal", "dog", "cat", "bird", "fish",
        "food", "fruit", "apple", "banana", "orange",
        "vehicle", "car", "bus", "bicycle", "train",
        "color", "red", "blue", "green", "yellow"
    ]

    logging.basicConfig(level=logging.INFO)

    try:
        universe = build_simple_universe(
            wordlist=test_words,
            output_path="public/data/universe_simple_test.json"
        )
        print(f"\n✅ Built simple universe with {len(universe.words)} words")
        print(f"✅ {len(universe.galaxies)} galaxies created")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
