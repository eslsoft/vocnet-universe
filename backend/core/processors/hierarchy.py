"""
Hierarchy processor - assigns hierarchy levels based on relations.
"""
from typing import List, Dict, Set
from collections import defaultdict, deque
import logging

from .base import Processor
from ..models import WordInfo, RelationType


logger = logging.getLogger(__name__)


class HierarchyProcessor(Processor):
    """
    Assigns hierarchy levels to words based on hypernym/hyponym relations.

    Strategy:
    1. Build a graph from hypernym relations
    2. Find root nodes (no parents)
    3. Assign levels via BFS from roots
    4. Words with more parents/broader concepts = lower level (0-2)
    5. Words with fewer parents/specific = higher level (3-6)
    """

    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        """
        Assign hierarchy levels based on relation graph.

        Args:
            words: List of WordInfo objects

        Returns:
            Words with updated hierarchy_level
        """
        logger.info(f"Processing hierarchy for {len(words)} words...")

        # Build word lookup
        word_dict = {w.id: w for w in words}
        word_by_name = {w.word: w for w in words}

        # Build parent-child graph
        children = defaultdict(set)  # parent -> children
        parents = defaultdict(set)   # child -> parents

        for word in words:
            for rel in word.relations:
                if rel.type == RelationType.HYPERNYM:
                    # word -> rel.target (word is child of target)
                    if rel.target_id in word_dict:
                        parents[word.id].add(rel.target_id)
                        children[rel.target_id].add(word.id)
                elif rel.type == RelationType.HYPONYM:
                    # word -> rel.target (word is parent of target)
                    if rel.target_id in word_dict:
                        children[word.id].add(rel.target_id)
                        parents[rel.target_id].add(word.id)

        # Find roots (words with no parents or very few)
        roots = set()
        for word in words:
            if len(parents[word.id]) == 0:
                roots.add(word.id)

        logger.info(f"Found {len(roots)} root nodes")

        # BFS from roots to assign levels
        levels = {}
        queue = deque()

        # Initialize roots at level 1
        for root_id in roots:
            levels[root_id] = 1
            queue.append((root_id, 1))

        # BFS
        visited = set()
        while queue:
            node_id, level = queue.popleft()
            if node_id in visited:
                continue
            visited.add(node_id)

            # Assign level (cap at 6)
            levels[node_id] = min(level, 6)

            # Process children
            for child_id in children[node_id]:
                if child_id not in visited:
                    # Child is one level deeper
                    queue.append((child_id, level + 1))

        # Apply levels to words
        for word in words:
            if word.id in levels:
                word.hierarchy_level = levels[word.id]
            else:
                # Orphan words default to level 4
                word.hierarchy_level = 4

        # Log distribution
        level_dist = defaultdict(int)
        for word in words:
            level_dist[word.hierarchy_level] += 1

        logger.info(f"Hierarchy levels assigned: {dict(level_dist)}")

        return words
