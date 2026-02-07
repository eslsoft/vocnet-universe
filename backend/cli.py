#!/usr/bin/env python3
"""
VocNet Universe Builder - Unified CLI

Usage:
    python backend/cli.py build --builder llm --wordlist data/wordlist.txt --out public/data/universe.json
    python backend/cli.py build --builder hybrid --limit 500
    python backend/cli.py build --builder simple --wordlist data/wordlist.txt
"""
import argparse
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from builders import build_llm_universe, build_hybrid_universe, build_simple_universe


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_wordlist(path: str, limit: int = None) -> list:
    """Load words from file."""
    wordlist_path = Path(path)
    if not wordlist_path.exists():
        raise FileNotFoundError(f"Wordlist not found: {path}")

    words = []
    with wordlist_path.open('r', encoding='utf-8') as f:
        for line in f:
            word = line.strip().lower()
            if word and len(word) > 1:
                words.append(word)

    if limit:
        words = words[:limit]

    return words


def build_command(args):
    """Build a universe."""
    logger.info(f"Building {args.builder} universe...")

    # Load wordlist
    try:
        words = load_wordlist(args.wordlist, args.limit)
        logger.info(f"Loaded {len(words)} words from {args.wordlist}")
    except Exception as e:
        logger.error(f"Failed to load wordlist: {e}")
        return 1

    # Select builder
    builders = {
        'llm': build_llm_universe,
        'hybrid': build_hybrid_universe,
        'simple': build_simple_universe
    }

    if args.builder not in builders:
        logger.error(f"Unknown builder: {args.builder}")
        logger.info(f"Available builders: {', '.join(builders.keys())}")
        return 1

    build_func = builders[args.builder]

    # Build universe
    try:
        universe = build_func(
            wordlist=words,
            output_path=args.out,
            num_galaxies=args.galaxies
        )

        logger.info(f"\n{'='*60}")
        logger.info(f"✅ Universe built successfully!")
        logger.info(f"   - Words: {len(universe.words)}")
        logger.info(f"   - Galaxies: {len(universe.galaxies)}")
        if args.out:
            logger.info(f"   - Output: {args.out}")
        logger.info(f"{'='*60}\n")

        return 0

    except Exception as e:
        logger.error(f"Build failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


def list_command(args):
    """List available builders and data sources."""
    print("\n🌌 VocNet Universe Builders\n")

    print("Available Builders:")
    print("  - llm:     LLM semantic associations (rich relations)")
    print("  - hybrid:  WordNet + LLM + Spacy (comprehensive)")
    print("  - simple:  WordNet only (clean hierarchy)")

    print("\nData Sources:")
    print("  - WordNet:    Hierarchy, definitions, POS")
    print("  - LLM:        Semantic associations (needs llm_semantic_graph.json)")
    print("  - Spacy:      Word vectors, similarity")
    print("  - ConceptNet: Common-sense relations (optional)")

    print("\nProcessors:")
    print("  - HierarchyProcessor:  Assign hierarchy levels")
    print("  - SemanticProcessor:   Add similarity-based relations")
    print("  - ClusteringProcessor: Assign galaxy groupings")
    print("  - RankingProcessor:    Compute frequency scores")

    print()
    return 0


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="VocNet Universe Builder - Generate vocabulary universes",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Build LLM universe with 1000 words
  python backend/cli.py build --builder llm --limit 1000

  # Build hybrid universe with custom wordlist
  python backend/cli.py build --builder hybrid --wordlist data/my_words.txt

  # Build simple universe and save to specific location
  python backend/cli.py build --builder simple --out public/data/my_universe.json

  # List available builders
  python backend/cli.py list
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Build command
    build_parser = subparsers.add_parser('build', help='Build a universe')
    build_parser.add_argument(
        '--builder',
        choices=['llm', 'hybrid', 'simple'],
        default='hybrid',
        help='Builder type to use (default: hybrid)'
    )
    build_parser.add_argument(
        '--wordlist',
        default='backend/data/wordlist.txt',
        help='Path to wordlist file (default: backend/data/wordlist.txt)'
    )
    build_parser.add_argument(
        '--out',
        help='Output path for universe JSON (default: auto-generated)'
    )
    build_parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of words to process'
    )
    build_parser.add_argument(
        '--galaxies',
        type=int,
        default=7,
        help='Number of galaxies to create (default: 7)'
    )

    # List command
    list_parser = subparsers.add_parser('list', help='List available builders')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Route to command
    if args.command == 'build':
        # Auto-generate output path if not specified
        if not args.out:
            args.out = f"public/data/universe_{args.builder}_generated.json"
        return build_command(args)
    elif args.command == 'list':
        return list_command(args)
    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
