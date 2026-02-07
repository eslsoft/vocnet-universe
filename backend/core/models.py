"""
Core data models for the Universe Builder.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from enum import Enum


class RelationType(str, Enum):
    """Supported relation types"""
    SYNONYM = "synonym"
    HYPERNYM = "hypernym"
    HYPONYM = "hyponym"
    ANTONYM = "antonym"
    RELATED = "related"


@dataclass
class VocabRelation:
    """Represents a relationship between words"""
    target_id: str
    type: RelationType
    strength: float = 0.5

    def to_dict(self) -> dict:
        return {
            "targetId": self.target_id,
            "type": self.type.value,
            "strength": self.strength
        }


@dataclass
class WordInfo:
    """Internal representation of a word with all its metadata"""
    # Identity
    word: str
    id: str = field(default="")

    # Core attributes
    frequency: int = 1000
    first_recorded_year: int = 1500
    hierarchy_level: int = 4

    # Semantic data
    pos: str = "noun"
    definition: str = ""

    # Grouping
    galaxy_id: str = "galaxy_unknown"
    solar_system_id: Optional[str] = None

    # Relations
    relations: List[VocabRelation] = field(default_factory=list)

    # Additional metadata (for internal processing)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.id:
            self.id = f"word_{self.word}"

    def to_dict(self) -> dict:
        """Convert to v4.0-static format"""
        result = {
            "id": self.id,
            "word": self.word,
            "frequency": self.frequency,
            "firstRecordedYear": self.first_recorded_year,
            "hierarchyLevel": self.hierarchy_level,
            "pos": self.pos,
            "definition": self.definition,
            "galaxyId": self.galaxy_id,
            "relations": [r.to_dict() for r in self.relations]
        }

        if self.solar_system_id:
            result["solarSystemId"] = self.solar_system_id

        return result


@dataclass
class GalaxyConfig:
    """Galaxy configuration with spatial position"""
    id: str
    name: str
    color: str
    center: Dict[str, float]  # {x, y, z}

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "center": self.center
        }


@dataclass
class UniverseData:
    """Complete universe dataset in v4.0-static format"""
    words: List[WordInfo]
    galaxies: List[GalaxyConfig] = field(default_factory=list)
    meta: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convert to JSON-serializable dict"""
        import time

        result = {
            "version": "v4.0-static",
            "meta": {
                "generatedAt": int(time.time() * 1000),
                "wordCount": len(self.words),
                **self.meta
            },
            "words": [w.to_dict() for w in self.words]
        }

        if self.galaxies:
            result["galaxies"] = [g.to_dict() for g in self.galaxies]

        return result
