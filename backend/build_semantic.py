#!/usr/bin/env python3
"""
Vocab Universe Builder v20.1 - "The Perfect Sync"
- RESTORED: Multi-dimensional links (action, context, property, synonym).
- MAINTAINED: Bulletproof logic (junk roots isolation, embedding check).
- SYNCED: All link types now match the frontend legend.
"""
import argparse
import json
import math
import gzip
from dataclasses import dataclass
from pathlib import Path
from collections import Counter
import numpy as np

JUNK_ROOTS = {"university", "college", "organisation", "organization", "jury", "membership", "administration"}

@dataclass
class Node:
    id: str; label: str; level: int; val: float; rank: float; x: float; y: float; z: float; color: str

@dataclass
class Link:
    source: str; target: str; type: str; distance: float

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordlist", required=True)
    parser.add_argument("--out", default="public/data/semantic_graph.json")
    parser.add_argument("--conceptnet", default="backend/data/conceptnet-assertions-5.7.0.csv.gz")
    parser.add_argument("--max-words", type=int, default=10000)
    args = parser.parse_args()

    import spacy
    import nltk
    from nltk.corpus import wordnet as wn
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler

    print("Initializing Synchronized Engine...")
    nlp = spacy.load("en_core_web_md")
    raw_lines = [w.strip().lower() for w in Path(args.wordlist).read_text().splitlines() if w.strip()][:args.max_words]
    
    entries, seen = [], set()
    for doc in nlp.pipe(raw_lines, batch_size=512):
        if not doc.has_vector or doc.text in seen or "_" in doc.text: continue
        seen.add(doc.text)
        entries.append({'word': doc.text, 'vec': doc.vector, 'rank': len(entries)/args.max_words})

    word_to_id = {e['word']: f"w_{e['word']}" for e in entries}
    word_set = set(word_to_id.keys())
    links, link_seen = [], set()

    def add_link(s, t, ltype, dist):
        if s == t: return
        sw, tw = s.replace('w_',''), t.replace('w_','')
        if (sw == "body" or tw == "body") and (sw in JUNK_ROOTS or tw in JUNK_ROOTS): return
        pair = (s, t, ltype)
        if pair not in link_seen: links.append(Link(s, t, ltype, dist)); link_seen.add(pair)

    print("Phase 1: Building Logical Skeleton (WordNet)...")
    for e in entries:
        w, nid, vec = e['word'], word_to_id[e['word']], e['vec']
        syns = wn.synsets(w, pos=wn.NOUN)
        if not syns: continue
        s = syns[0]

        # 1. UP/DOWN Logic
        def link_up(current_s, d=0):
            if d > 8: return
            for h in current_s.hypernyms():
                found = False
                for l in h.lemmas():
                    pw = l.name().lower().replace('_', ' ')
                    if pw in word_set and cosine(vec, nlp(pw).vector) > 0.15:
                        add_link(nid, word_to_id[pw], "is_a", 150); found = True
                if not found: link_up(h, d + 1)
        link_up(s)

        def link_down(current_s, d=0):
            if d > 2: return
            for h in current_s.hyponyms():
                found = False
                for l in h.lemmas():
                    cw = l.name().lower().replace('_', ' ')
                    if cw in word_set and cosine(vec, nlp(cw).vector) > 0.15:
                        add_link(nid, word_to_id[cw], "has_kind", 120); found = True
                if not found: link_down(h, d + 1)
        link_down(s)

        # 2. Synonym Logic
        for l in s.lemmas():
            sw = l.name().lower().replace('_', ' ')
            if sw in word_set and sw != w: add_link(nid, word_to_id[sw], "synonym", 30)

    print("Phase 2: Injecting ConceptNet Common Sense...")
    if Path(args.conceptnet).exists():
        with gzip.open(args.conceptnet, 'rt', encoding='utf-8') as f:
            for line in f:
                cols = line.split('\t')
                if len(cols) < 5: continue
                try:
                    meta = json.loads(cols[4])
                    if meta.get('weight', 1.0) < 1.5: continue
                except: continue

                rel = cols[1].split('/')[-1]
                ltype = ""
                if rel == "IsA": ltype = "is_a"
                elif rel in ["HasA", "PartOf"]: ltype = "has_part"
                elif rel in ["UsedFor", "CapableOf"]: ltype = "action"
                elif rel in ["AtLocation"]: ltype = "context"
                elif rel in ["HasProperty"]: ltype = "property"
                elif rel == "Synonym": ltype = "synonym"
                
                if not ltype: continue
                
                def clean(s): return s.split('/')[3].lower().replace('_', ' ') if len(s.split('/')) > 3 else ""
                s_w, t_w = clean(cols[2]), clean(cols[3])
                
                if s_w in word_set and t_w in word_set:
                    add_link(word_to_id[s_w], word_to_id[t_w], ltype, 150)

    # Finalize
    coverage = Counter()
    for l in links: coverage[l.source.replace('w_','')] += 1
    
    vecs = np.stack([e['vec'] for e in entries])
    pca = PCA(n_components=3).fit_transform(StandardScaler().fit_transform(vecs))
    pca = np.tanh(pca / (np.std(pca) * 2)) * 2500.0
    level_colors = {1: "#a855f7", 2: "#38bdf8", 3: "#f59e0b", 4: "#22c55e"}

    nodes = [Node(id=word_to_id[e['word']], label=e['word'], 
                  level=(1 if coverage[e['word']] > 100 else (2 if coverage[e['word']] > 25 else (3 if coverage[e['word']] > 5 else 4))), 
                  val=6 + (1-e['rank'])*8 + (math.log(coverage[e['word']]+1)*5), 
                  rank=e['rank'], x=float(pca[i,0]), y=float(pca[i,1]), z=float(pca[i,2]), 
                  color=level_colors[1 if coverage[e['word']] > 100 else (2 if coverage[e['word']] > 25 else (3 if coverage[e['word']] > 5 else 4))]) 
             for i, e in enumerate(entries)]

    output = {"v": "20.1", "nodes": [n.__dict__ for n in nodes], "links": [l.__dict__ for l in links]}
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False))
    print(f"Build v20.1 Complete with all relation types.")

if __name__ == "__main__": main()
