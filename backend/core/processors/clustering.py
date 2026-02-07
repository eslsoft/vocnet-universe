"""
Clustering processor - assigns words to galaxies/themes.
"""
from typing import List, Dict
from collections import Counter
import logging
import math

from .base import Processor
from ..models import WordInfo, GalaxyConfig


logger = logging.getLogger(__name__)


class ThematicClusteringProcessor(Processor):
    """
    Assigns words to thematic galaxies.

    Strategy:
    1. Extract themes from LLM category relations
    2. Create galaxy configs for top N themes
    3. Assign words to galaxies based on their relations

    Config:
        num_galaxies: Number of galaxies to create (default: 7)
        default_themes: Fallback themes if no LLM data
    """

    def __init__(self, config: Dict = None):
        super().__init__(config)
        self.num_galaxies = self.config.get('num_galaxies', 7)
        self.default_themes = self.config.get('default_themes', [
            "Communication", "Science", "Technology", "Nature",
            "Society", "Art", "Abstract"
        ])

    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Assign words to thematic galaxies.

        Args:
            words: List of WordInfo objects

        Returns:
            Words with galaxy_id assigned
        """
        logger.info(f"Clustering {len(words)} words into {self.num_galaxies} galaxies...")

        # Step 1: Extract themes from word categories
        theme_counts = Counter()

        for word in words:
            # Look for category-type relations to identify themes
            for rel in word.relations:
                if rel.type.value in ['hypernym', 'category']:
                    # Extract target word as potential theme
                    target_word = rel.target_id.replace('word_', '')
                    theme_counts[target_word.capitalize()] += 1

        # Step 2: Select top themes
        if theme_counts:
            themes = [theme for theme, _ in theme_counts.most_common(self.num_galaxies)]
        else:
            # Fallback to default themes
            themes = self.default_themes[:self.num_galaxies]

        logger.info(f"Selected themes: {themes}")

        # Step 3: Create galaxy configs
        galaxies = []
        radius = 4000  # Match frontend scale

        for i, theme in enumerate(themes):
            # Distribute galaxies in 3D sphere using Fibonacci sphere
            phi = math.acos(-1 + 2 * i / len(themes))
            theta = math.sqrt(len(themes) * math.pi) * phi

            galaxy = GalaxyConfig(
                id=f"galaxy_{theme.lower().replace(' ', '_')}",
                name=theme,
                color=f"hsl({(i * 137.5) % 360}, 70%, 60%)",
                center={
                    "x": radius * math.sin(phi) * math.cos(theta),
                    "y": radius * math.sin(phi) * math.sin(theta),
                    "z": radius * math.cos(phi)
                }
            )
            galaxies.append(galaxy)

        # Store galaxies in metadata for later export
        if words:
            words[0].metadata['_galaxies'] = galaxies

        # Step 4: Assign words to galaxies
        theme_to_galaxy = {theme: galaxies[i].id for i, theme in enumerate(themes)}

        for word in words:
            # Try to find theme from hypernym relations
            assigned = False
            for rel in word.relations:
                if rel.type.value in ['hypernym', 'category']:
                    target_word = rel.target_id.replace('word_', '').capitalize()
                    if target_word in theme_to_galaxy:
                        word.galaxy_id = theme_to_galaxy[target_word]
                        assigned = True
                        break

            # Fallback: assign based on word hash for consistency
            if not assigned:
                word.galaxy_id = galaxies[hash(word.word) % len(galaxies)].id

        # Log distribution
        galaxy_dist = Counter(w.galaxy_id for w in words)
        logger.info(f"Galaxy distribution: {dict(galaxy_dist)}")

        return words


class VectorClusteringProcessor(Processor):
    """
    Assigns words to galaxies using K-means clustering on word vectors.

    Requires word vectors in metadata.

    Config:
        num_galaxies: Number of clusters (default: 7)
        random_seed: Random seed for reproducibility
    """

    def __init__(self, config: Dict = None):
        super().__init__(config)
        self.num_galaxies = self.config.get('num_galaxies', 7)
        self.random_seed = self.config.get('random_seed', 42)

    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Cluster words using K-means on vectors.

        Args:
            words: List of WordInfo objects

        Returns:
            Words with galaxy_id assigned
        """
        logger.info(f"K-means clustering into {self.num_galaxies} galaxies...")

        # Extract vectors
        import numpy as np
        from sklearn.cluster import KMeans

        vectors = []
        valid_words = []

        for word in words:
            vec = word.metadata.get('vector')
            if vec is not None:
                vectors.append(vec)
                valid_words.append(word)

        if not vectors:
            logger.warning("No vectors found, assigning random galaxies")
            for i, word in enumerate(words):
                word.galaxy_id = f"galaxy_cluster_{i % self.num_galaxies}"
            return words

        vectors_np = np.stack(vectors)

        # K-means clustering
        kmeans = KMeans(n_clusters=self.num_galaxies, random_state=self.random_seed)
        labels = kmeans.fit_predict(vectors_np)

        # Create galaxy configs
        galaxies = []
        radius = 4000

        for i in range(self.num_galaxies):
            phi = math.acos(-1 + 2 * i / self.num_galaxies)
            theta = math.sqrt(self.num_galaxies * math.pi) * phi

            galaxy = GalaxyConfig(
                id=f"galaxy_cluster_{i}",
                name=f"Cluster {i+1}",
                color=f"hsl({(i * 137.5) % 360}, 70%, 60%)",
                center={
                    "x": radius * math.sin(phi) * math.cos(theta),
                    "y": radius * math.sin(phi) * math.sin(theta),
                    "z": radius * math.cos(phi)
                }
            )
            galaxies.append(galaxy)

        # Store galaxies
        if words:
            words[0].metadata['_galaxies'] = galaxies

        # Assign clusters
        for word, label in zip(valid_words, labels):
            word.galaxy_id = f"galaxy_cluster_{label}"

        # Assign remaining words randomly
        word_ids = {w.id for w in valid_words}
        for word in words:
            if word.id not in word_ids:
                word.galaxy_id = f"galaxy_cluster_{hash(word.word) % self.num_galaxies}"

        logger.info(f"Clustered {len(valid_words)} words")
        return words
