"""
Main UniverseBuilder class - orchestrates data sources and processors.
"""
from typing import List, Optional
from pathlib import Path
import logging

from .models import WordInfo, UniverseData
from .data_sources.base import DataSource
from .processors.base import Processor


logger = logging.getLogger(__name__)


class UniverseBuilder:
    """
    Main builder class that orchestrates universe construction.

    Usage:
        builder = UniverseBuilder()
        builder.add_source(WordNetSource())
        builder.add_source(SpacySource())
        builder.add_processor(HierarchyProcessor())
        builder.add_processor(ClusteringProcessor())
        universe = builder.build(wordlist)
    """

    def __init__(self, name: str = "universe"):
        """
        Initialize the builder.

        Args:
            name: Name/ID for this universe
        """
        self.name = name
        self.sources: List[DataSource] = []
        self.processors: List[Processor] = []

    def add_source(self, source: DataSource) -> 'UniverseBuilder':
        """
        Add a data source.

        Args:
            source: DataSource instance

        Returns:
            self (for chaining)
        """
        self.sources.append(source)
        logger.info(f"Added data source: {source.__class__.__name__}")
        return self

    def add_processor(self, processor: Processor) -> 'UniverseBuilder':
        """
        Add a processor.

        Args:
            processor: Processor instance

        Returns:
            self (for chaining)
        """
        self.processors.append(processor)
        logger.info(f"Added processor: {processor.get_name()}")
        return self

    def build(self, wordlist: List[str]) -> UniverseData:
        """
        Build the universe from a word list.

        Args:
            wordlist: List of words to include

        Returns:
            UniverseData object ready for export
        """
        logger.info(f"Building universe '{self.name}' with {len(wordlist)} words...")

        # Initialize all sources
        for source in self.sources:
            source.initialize()

        # Step 1: Gather word info from all sources
        logger.info("Step 1: Gathering word information...")
        words = self._gather_words(wordlist)
        logger.info(f"Collected {len(words)} valid words")

        # Step 2: Run processors
        logger.info("Step 2: Running processors...")
        for processor in self.processors:
            logger.info(f"  - Running {processor.get_name()}...")
            words = processor.process(words)

        # Step 3: Extract galaxies from metadata (if any processor created them)
        galaxies = []
        if words:
            galaxies = words[0].metadata.get('_galaxies', [])

        # Step 4: Create UniverseData
        universe = UniverseData(
            words=words,
            galaxies=galaxies,
            meta={
                "id": self.name,
                "name": self.name.replace("_", " ").title()
            }
        )

        logger.info(f"Universe build complete: {len(words)} words, {len(galaxies)} galaxies")
        return universe

    def _gather_words(self, wordlist: List[str]) -> List[WordInfo]:
        """
        Gather word information from all sources.

        Args:
            wordlist: List of words to process

        Returns:
            List of WordInfo objects
        """
        words_dict = {}

        for word in wordlist:
            word = word.strip().lower()
            if not word or len(word) < 2:
                continue

            # Try to get info from sources in order
            word_info = None
            for source in self.sources:
                info = source.get_word_info(word)
                if info:
                    if word_info is None:
                        word_info = info
                    else:
                        # Merge info from multiple sources
                        word_info = source.enrich_word(word_info)

            if word_info:
                words_dict[word] = word_info

        return list(words_dict.values())
