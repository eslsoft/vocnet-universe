"""
VocNet Universe Builder - Core Module

A modular, composable framework for building vocabulary universes.
"""

from .models import WordInfo, VocabRelation, UniverseData, GalaxyConfig
from .builder import UniverseBuilder

__all__ = [
    "WordInfo",
    "VocabRelation",
    "UniverseData",
    "GalaxyConfig",
    "UniverseBuilder",
]
