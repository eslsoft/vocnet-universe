#!/usr/bin/env python3
"""
Vocab Universe Builder v5.1 - "Aligned Dimensions"
- Fix: L1/L2 now have valid sx,sy,sz (computed as centroids of their children).
- Feature: Semantic view is no longer collapsed at origin.
- Consistency: Hierarchical and Semantic views use matched scales.
"""
from __future__ import annotations

import argparse
import json
import math
import random
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple, Set, Optional

import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# --- Configuration ---

STOP_SYNSETS = {
    'entity.n.01', 'physical_entity.n.01', 'abstraction.n.06', 'object.n.01', 
    'whole.n.02', 'part.n.01', 'matter.n.03', 'attribute.n.02', 'state.n.02', 'point.n.02'
}

@dataclass
class WordEntry:
    word: str
    vector: np.ndarray
    pos: str
    synset: any = None
    level: int = 4
    id: str = ""
    semantic_pos: np.ndarray = None

@dataclass
class Node:
    id: str
    label: str
    level: int
    val: float
    x: float
    y: float
    z: float
    sx: float
    sy: float
    sz: float
    fx: Optional[float] = None
    fy: Optional[float] = None
    fz: Optional[float] = None
    grouping: Dict[str, str] = None

@dataclass
class Link:
    source: str
    target: str
    type: str

def get_fibonacci_sphere_pos(i: int, n: int, radius: float) -> Tuple[float, float, float]:
    if n <= 1: return (0, radius, 0)
    phi = math.acos(1 - 2 * (i / (n - 1)))
    theta = math.pi * (1 + 5**0.5) * i
    return (math.cos(theta) * math.sin(phi) * radius,
            math.sin(theta) * math.sin(phi) * radius,
            math.cos(phi) * radius)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordlist", required=True)
    parser.add_argument("--out", default="public/data/universe_graph.json")
    parser.add_argument("--max-words", type=int, default=1200)
    parser.add_argument("--scale", type=float, default=4000.0)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    np.random.seed(args.seed)

    import spacy
    import nltk
    from nltk.corpus import wordnet as wn

    print("Building v5.1 Aligned Universe...")
    nlp = spacy.load("en_core_web_md")
    try: nltk.data.find("corpora/wordnet")
    except LookupError: nltk.download("wordnet")

    # 1. Word Analysis
    raw_words = Path(args.wordlist).read_text().splitlines()
    entries: List[WordEntry] = []
    seen = set()
    docs = list(nlp.pipe([w.strip().lower() for w in raw_words if w.strip()][:args.max_words], batch_size=256))
    all_hypernyms = Counter()
    
    for doc in docs:
        word = doc.text
        if not doc.has_vector or word in seen or "_" in word: continue
        seen.add(word)
        syns = wn.synsets(word)
        if not syns: continue
        syn = syns[0]
        for path in syn.hypernym_paths():
            for ancestor in path:
                if ancestor.name() not in STOP_SYNSETS:
                    all_hypernyms[ancestor.name()] += 1
        entries.append(WordEntry(word=word, vector=doc.vector, pos=doc[0].pos_, synset=syn))

    # 2. PCA
    print("Computing PCA...")
    vectors_np = np.stack([e.vector for e in entries])
    scaler = StandardScaler()
    vectors_scaled = scaler.fit_transform(vectors_np)
    pca = PCA(n_components=3, random_state=args.seed)
    coords_pca = pca.fit_transform(vectors_scaled)
    coords_pca = np.tanh(coords_pca / (np.std(coords_pca) * 2)) * args.scale

    for i, e in enumerate(entries):
        e.semantic_pos = coords_pca[i]
        e.id = f"w_{e.word}"

    # 3. Discover L1/L2
    galaxies = []
    for s_name, _ in all_hypernyms.most_common(100):
        syn = wn.synset(s_name)
        if not any(syn in wn.synset(g).closure(lambda s: s.hyponyms()) for g in galaxies):
            galaxies.append(s_name)
        if len(galaxies) >= 12: break

    final_nodes: List[Node] = []
    links: List[Link] = []
    processed_word_ids = set()

    # 4. Building Hierarchy with Centroid-based Semantic Pos
    for i, g_name in enumerate(galaxies):
        g_syn = wn.synset(g_name)
        g_label = g_name.split('.')[0].capitalize()
        angle = (2 * math.pi * i) / len(galaxies)
        gx, gy, gz = math.cos(angle) * args.scale * 0.8, math.sin(angle) * args.scale * 0.8, random.uniform(-400, 400)
        g_id = f"g_{g_name.replace('.','_')}"

        # Find all words belonging to this galaxy
        g_members = [e for e in entries if g_syn in e.synset.closure(lambda s: s.hypernyms())]
        if not g_members: continue
        
        # L1 Semantic Pos = Centroid of members
        g_sem_pos = np.mean([e.semantic_pos for e in g_members], axis=0)
        
        final_nodes.append(Node(id=g_id, label=g_label, level=1, val=70, x=gx, y=gy, z=gz, sx=float(g_sem_pos[0]), sy=float(g_sem_pos[1]), sz=float(g_sem_pos[2]), fx=gx, fy=gy, fz=gz, grouping={"category": g_label}))

        # Nebulae Discovery
        descendant_counts = Counter()
        for e in g_members:
            for path in e.synset.hypernym_paths():
                if g_syn in path:
                    idx = path.index(g_syn)
                    if idx + 1 < len(path): descendant_counts[path[idx + 1].name()] += 1
        
        nebulae = [n for n, _ in descendant_counts.most_common(6)]
        for ni, n_name in enumerate(nebulae):
            n_syn = wn.synset(n_name)
            n_label = n_name.split('.')[0].capitalize()
            n_id = f"n_{n_name.replace('.','_')}"
            
            nx_off, ny_off, nz_off = get_fibonacci_sphere_pos(ni, len(nebulae), 1200)
            nx, ny, nz = gx + nx_off, gy + ny_off, gz + nz_off
            
            n_members = [e for e in g_members if e.id not in processed_word_ids and (n_syn == e.synset or n_syn in e.synset.closure(lambda s: s.hypernyms()))]
            if not n_members: continue
            
            # L2 Semantic Pos = Centroid of members
            n_sem_pos = np.mean([e.semantic_pos for e in n_members], axis=0)
            
            final_nodes.append(Node(id=n_id, label=n_label, level=2, val=40, x=nx, y=ny, z=nz, sx=float(n_sem_pos[0]), sy=float(n_sem_pos[1]), sz=float(n_sem_pos[2]), grouping={"category": n_label}))
            links.append(Link(g_id, n_id, "hierarchy"))

            for wi, e in enumerate(n_members):
                level = 3 if wi < 5 else 4
                radius = 250 if level == 3 else 450
                wx_off, wy_off, wz_off = get_fibonacci_sphere_pos(wi, len(n_members), radius)
                final_nodes.append(Node(id=e.id, label=e.word, level=level, val=12 if level == 3 else 6, 
                                       x=nx + wx_off, y=ny + wy_off, z=nz + wz_off,
                                       sx=float(e.semantic_pos[0]), sy=float(e.semantic_pos[1]), sz=float(e.semantic_pos[2]),
                                       grouping={"category": n_label, "pos": e.pos}))
                links.append(Link(n_id, e.id, "hierarchy"))
                processed_word_ids.add(e.id)

    # 5. Semantic Relatedness (Only for word nodes)
    processed_entries = [e for e in entries if e.id in processed_word_ids]
    if processed_entries:
        p_vectors = np.stack([e.vector for e in processed_entries])
        for e in processed_entries:
            sims = np.dot(p_vectors, e.vector) / (np.linalg.norm(p_vectors, axis=1) * np.linalg.norm(e.vector) + 1e-8)
            for idx in np.argsort(sims)[-3:]: # Top 3
                target = processed_entries[idx]
                if target.id != e.id:
                    links.append(Link(e.id, target.id, "related"))

    output = {"version": "5.1", "meta": {"nodeCount": len(final_nodes)},
              "nodes": [n.__dict__ for n in final_nodes], "links": [l.__dict__ for l in links]}
    for n in output['nodes']:
        for k in ['fx','fy','fz']:
            if n.get(k) is None: n.pop(k, None)
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False))
    print(f"Build v5.1 Complete. Aligned {len(final_nodes)} nodes.")

if __name__ == "__main__": main()