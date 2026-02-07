"""
Data source abstractions for vocabulary universe building.
"""
from .base import DataSource
from .wordnet import WordNetSource
from .spacy import SpacySource
from .llm import LLMSource
from .conceptnet import ConceptNetSource

__all__ = [
    "DataSource",
    "WordNetSource",
    "SpacySource",
    "LLMSource",
    "ConceptNetSource",
]
