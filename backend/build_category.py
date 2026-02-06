#!/usr/bin/env python3
"""
Category Universe Builder - Focus on structured hierarchy and clean layout.
Output: public/data/category_graph.json
"""
import argparse
import json
import math
import random
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
from sklearn.cluster import KMeans

@dataclass
class Node:
    id: str
    label: str
    level: int
    val: float
    x: float
    y: float
    z: float
    fx: float = None
    fy: float = None
    fz: float = None
    grouping: dict = None

@dataclass
class Link:
    source: str
    target: str
    type: str

def get_fibo(i, n, r):
    if n <= 1: return (0, r, 0)
    phi = math.acos(1 - 2 * (i / (n - 1)))
    theta = math.pi * (1 + 5**0.5) * i
    return (math.cos(theta)*math.sin(phi)*r, math.sin(theta)*math.sin(phi)*r, math.cos(phi)*r)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordlist", required=True)
    parser.add_argument("--out", default="public/data/category_graph.json")
    parser.add_argument("--max-words", type=int, default=1200)
    args = parser.parse_args()

    import spacy
    import nltk
    from nltk.corpus import wordnet as wn
    nlp = spacy.load("en_core_web_md")
    try: nltk.data.find("corpora/wordnet")
    except: nltk.download("wordnet")

    # 1. Hypernym Analysis
    words = [w.strip().lower() for w in Path(args.wordlist).read_text().splitlines() if w.strip()][:args.max_words]
    entries = []
    all_hypers = Counter()
    for doc in nlp.pipe(words, batch_size=256):
        if not doc.has_vector: continue
        syns = wn.synsets(doc.text)
        if not syns: continue
        entries.append({'word': doc.text, 'syn': syns[0]})
        for p in syns[0].hypernym_paths():
            for a in p:
                if a.name() not in {'entity.n.01', 'object.n.01', 'abstraction.n.06'}:
                    all_hypers[a.name()] += 1

    # 2. Extract Galaxies (L1)
    galaxies = []
    for s_name, _ in all_hypers.most_common(50):
        syn = wn.synset(s_name)
        if not any(syn in wn.synset(g).closure(lambda s: s.hyponyms()) for g in galaxies):
            galaxies.append(s_name)
        if len(galaxies) >= 10: break

    nodes, links = [], []
    processed = set()

    for i, g_name in enumerate(galaxies):
        g_syn = wn.synset(g_name)
        g_label = g_name.split('.')[0].capitalize()
        angle = (2 * math.pi * i) / len(galaxies)
        gx, gy, gz = math.cos(angle)*3000, math.sin(angle)*3000, random.uniform(-500,500)
        gid = f"g_{g_name.replace('.','_')}"
        nodes.append(Node(gid, g_label, 1, 60, gx, gy, gz, gx, gy, gz))

        # Find Nebulae (L2)
        members = [e for e in entries if g_syn in e['syn'].closure(lambda s: s.hypernyms())]
        desc_counts = Counter()
        for e in members:
            for p in e['syn'].hypernym_paths():
                if g_syn in p:
                    idx = p.index(g_syn)
                    if idx+1 < len(p): desc_counts[p[idx+1].name()] += 1
        
        nebulae = [n for n, _ in desc_counts.most_common(6)]
        for ni, n_name in enumerate(nebulae):
            nid = f"n_{n_name.replace('.','_')}"
            nx_o, ny_o, nz_o = get_fibo(ni, len(nebulae), 1000)
            nx, ny, nz = gx+nx_o, gy+ny_o, gz+nz_o
            nodes.append(Node(nid, n_name.split('.')[0].capitalize(), 2, 35, nx, ny, nz))
            links.append(Link(gid, nid, "hierarchy"))

            # Words (L3/L4)
            n_syn = wn.synset(n_name)
            n_mems = [e for e in members if e['word'] not in processed and (n_syn == e['syn'] or n_syn in e['syn'].closure(lambda s: s.hypernyms()))]
            for wi, e in enumerate(n_mems):
                lvl = 3 if wi < 5 else 4
                r = 250 if lvl == 3 else 450
                wx_o, wy_o, wz_o = get_fibo(wi, len(n_mems), r)
                nodes.append(Node(f"w_{e['word']}", e['word'], lvl, 12 if lvl==3 else 6, nx+wx_o, ny+wy_o, nz+wz_o))
                links.append(Link(nid, f"w_{e['word']}", "hierarchy"))
                processed.add(e['word'])

    output = {"version": "category-1.0", "nodes": [n.__dict__ for n in nodes if n.id], "links": [l.__dict__ for l in links]}
    for n in output['nodes']:
        for k in ['fx','fy','fz']:
            if n.get(k) is None: n.pop(k, None)
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False))
    print(f"Generated Category Universe: {len(nodes)} nodes.")

if __name__ == "__main__": main()
