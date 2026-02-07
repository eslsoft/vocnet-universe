"""
Exporter for converting UniverseData to JSON files.
"""
import json
from pathlib import Path
from typing import Union
import logging

from .models import UniverseData


logger = logging.getLogger(__name__)


class V4Exporter:
    """
    Exports UniverseData to v4.0-static JSON format.
    """

    def __init__(self, indent: int = 2, ensure_ascii: bool = False):
        """
        Initialize exporter.

        Args:
            indent: JSON indentation (default: 2)
            ensure_ascii: Whether to escape non-ASCII chars (default: False)
        """
        self.indent = indent
        self.ensure_ascii = ensure_ascii

    def export(self, universe: UniverseData, output_path: Union[str, Path]) -> None:
        """
        Export universe to JSON file.

        Args:
            universe: UniverseData to export
            output_path: Output file path
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        data = universe.to_dict()

        with output_path.open('w', encoding='utf-8') as f:
            json.dump(data, f, indent=self.indent, ensure_ascii=self.ensure_ascii)

        word_count = len(universe.words)
        galaxy_count = len(universe.galaxies)
        logger.info(f"Exported universe to {output_path}")
        logger.info(f"  - {word_count} words")
        logger.info(f"  - {galaxy_count} galaxies")

    def to_json(self, universe: UniverseData) -> str:
        """
        Convert universe to JSON string.

        Args:
            universe: UniverseData to convert

        Returns:
            JSON string
        """
        data = universe.to_dict()
        return json.dumps(data, indent=self.indent, ensure_ascii=self.ensure_ascii)
