"""
LLM-based universe builder.

Uses LLM semantic associations as the primary data source.
Best for: Rich semantic networks with human-learning-optimized relations.
"""
from pathlib import Path
from typing import List
import logging

from core import UniverseBuilder
from core.data_sources import LLMSource, SpacySource
from core.processors import (
    HierarchyProcessor,
    SemanticProcessor,
    ThematicClusteringProcessor,
    FrequencyRankingProcessor
)
from core.exporter import V4Exporter
from core.models import UniverseData


logger = logging.getLogger(__name__)


def build_llm_universe(
    wordlist: List[str],
    llm_graph_path: str = "backend/data/llm_semantic_graph.json",
    spacy_model: str = "en_core_web_md",
    output_path: str = None,
    num_galaxies: int = 7
) -> UniverseData:
    """
    Build a universe based on LLM semantic associations.

    Args:
        wordlist: List of words to include
        llm_graph_path: Path to llm_semantic_graph.json
        spacy_model: Spacy model name
        output_path: Optional output path (if None, won't save to file)
        num_galaxies: Number of thematic galaxies

    Returns:
        UniverseData object
    """
    logger.info("🌌 Building LLM Semantic Universe...")

    # Create builder
    builder = UniverseBuilder(name="llm_semantic")

    # Add data sources
    builder.add_source(LLMSource(llm_graph_path))
    builder.add_source(SpacySource(spacy_model))

    # Add processors
    builder.add_processor(HierarchyProcessor())
    builder.add_processor(SemanticProcessor({
        'max_relations': 5,
        'min_similarity': 0.5
    }))
    builder.add_processor(ThematicClusteringProcessor({
        'num_galaxies': num_galaxies
    }))
    builder.add_processor(FrequencyRankingProcessor())

    # Build universe
    universe = builder.build(wordlist)

    # Export if output path provided
    if output_path:
        exporter = V4Exporter()
        exporter.export(universe, output_path)

    return universe


if __name__ == "__main__":
    """
    Quick test of LLM universe builder.
    """
    import sys

    # Load a small wordlist for testing
    test_words = [
        "communicate", "speak", "listen", "talk", "say",
        "technology", "computer", "internet", "software",
        "science", "biology", "chemistry", "physics",
        "emotion", "happy", "sad", "angry", "love"
    ]

    logging.basicConfig(level=logging.INFO)

    try:
        universe = build_llm_universe(
            wordlist=test_words,
            output_path="public/data/universe_llm_test.json"
        )
        print(f"\n✅ Built universe with {len(universe.words)} words")
        print(f"✅ {len(universe.galaxies)} galaxies created")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
