"""
Hybrid universe builder.

Combines multiple data sources for rich, well-structured universes.
Uses WordNet for hierarchy + LLM for semantics + Spacy for vectors.
"""
from pathlib import Path
from typing import List
import logging

from core import UniverseBuilder
from core.data_sources import WordNetSource, LLMSource, SpacySource
from core.processors import (
    HierarchyProcessor,
    SemanticProcessor,
    ThematicClusteringProcessor,
    FrequencyRankingProcessor
)
from core.exporter import V4Exporter
from core.models import UniverseData


logger = logging.getLogger(__name__)


def build_hybrid_universe(
    wordlist: List[str],
    llm_graph_path: str = "backend/data/llm_semantic_graph.json",
    spacy_model: str = "en_core_web_md",
    output_path: str = None,
    num_galaxies: int = 7
) -> UniverseData:
    """
    Build a hybrid universe combining multiple data sources.

    This is the most comprehensive builder:
    - WordNet provides solid hierarchical structure
    - LLM provides rich semantic associations
    - Spacy provides vectors for similarity

    Args:
        wordlist: List of words to include
        llm_graph_path: Path to llm_semantic_graph.json
        spacy_model: Spacy model name
        output_path: Optional output path
        num_galaxies: Number of galaxies

    Returns:
        UniverseData object
    """
    logger.info("🌌 Building Hybrid Universe...")

    # Create builder
    builder = UniverseBuilder(name="hybrid")

    # Add data sources (order matters - first source provides base info)
    builder.add_source(WordNetSource())      # Base: definitions, POS
    builder.add_source(LLMSource(llm_graph_path))  # Enrich: semantic relations
    builder.add_source(SpacySource(spacy_model))   # Enrich: vectors, POS

    # Add processors
    builder.add_processor(HierarchyProcessor())  # Must run before clustering
    builder.add_processor(ThematicClusteringProcessor({
        'num_galaxies': num_galaxies
    }))
    builder.add_processor(SemanticProcessor({
        'max_relations': 3,
        'min_similarity': 0.6
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
    Quick test of hybrid builder.
    """
    import sys

    # Test with moderate wordlist
    test_words = [
        # Communication
        "communicate", "speak", "listen", "talk", "say", "write", "read",
        # Technology
        "technology", "computer", "software", "internet", "data", "algorithm",
        # Science
        "science", "biology", "chemistry", "physics", "research", "experiment",
        # Education
        "learn", "teach", "study", "school", "education", "knowledge",
        # Emotion
        "emotion", "happy", "sad", "angry", "love", "fear", "joy"
    ]

    logging.basicConfig(level=logging.INFO)

    try:
        universe = build_hybrid_universe(
            wordlist=test_words,
            output_path="public/data/universe_hybrid_test.json"
        )
        print(f"\n✅ Built hybrid universe with {len(universe.words)} words")
        print(f"✅ {len(universe.galaxies)} galaxies created")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
