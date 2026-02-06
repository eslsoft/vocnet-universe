#!/usr/bin/env python3
"""
VocNet Universe Builder V2.5 - "MAXIMUM UNIVERSE"
- Support for ALL parts of speech.
- High Galaxy count (40+) to prevent orphans.
- Processes the entire wordlist.
"""
import argparse
import json
import math
import random
from collections import Counter
from pathlib import Path
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Reduced stop synsets to allow more words in
STOP_SYNSETS = {'entity.n.01', 'physical_entity.n.01'}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordlist", default="backend/data/wordlist.txt")
    parser.add_argument("--out", default="public/data/universe_v2.json")
    parser.add_argument("--limit", type=int, default=10000)
    args = parser.parse_args()

    import spacy
    from nltk.corpus import wordnet as wn
    
    print(f"🚀 Initializing MAX Universe Engine for {args.limit} words...")
    nlp = spacy.load("en_core_web_md")
    
    raw_words = Path(args.wordlist).read_text().splitlines()
    words_to_process = [w.strip().lower() for w in raw_words if w.strip()][:args.limit]
    
    entries = []
    seen = set()
    docs = list(nlp.pipe(words_to_process, batch_size=512))
    
    all_hypernyms = Counter()
    print("Extracting semantic hierarchies...")
    for doc in docs:
        word = doc.text
        if not doc.has_vector or word in seen or "_" in word or len(word) < 2: continue
        seen.add(word)
        
        # Try all POS: Noun, Verb, Adj, Adv
        synsets = wn.synsets(word)
        if not synsets:
            # Keep the word even if no WordNet data (will be an orphan)
            entries.append({'word': word, 'vec': doc.vector, 'synset': None, 'pos': doc[0].pos_})
            continue
        
        syn = synsets[0]
        for path in syn.hypernym_paths():
            for ancestor in path:
                if ancestor.name() not in STOP_SYNSETS:
                    all_hypernyms[ancestor.name()] += 1
        
        entries.append({'word': word, 'vec': doc.vector, 'synset': syn, 'pos': doc[0].pos_})

    # PCA Space
    print(f"Computing 3D Coordinates for {len(entries)} words...")
    vecs = np.stack([e['vec'] for e in entries])
    pca_coords = PCA(n_components=3).fit_transform(StandardScaler().fit_transform(vecs))
    pca_coords = np.tanh(pca_coords / (np.std(pca_coords) * 2)) * 4000.0

    # Identify 40 Galaxies
    print("Identifying 40 major Galaxies...")
    galaxies = []
    for s_name, _ in all_hypernyms.most_common(200):
        syn = wn.synset(s_name)
        if not any(syn in wn.synset(g).closure(lambda s: s.hyponyms()) for g in galaxies):
            galaxies.append(s_name)
        if len(galaxies) >= 40: break

    nodes, links = [], []
    processed_ids = set()

    # Special "Outer Rim" Galaxy for orphans
    outer_rim_id = "g_outer_rim"
    nodes.append({
        "id": outer_rim_id, "label": "Unknown Domains", 
        "level": 1, "val": 80, "x": 0, "y": 0, "z": 5000
    })

    # Building Hierarchy
    for i, g_name in enumerate(galaxies):
        g_syn = wn.synset(g_name)
        g_id = f"g_{g_name.replace('.','_')}"
        g_members = [e for e in entries if e['synset'] and g_syn in e['synset'].closure(lambda s: s.hypernyms())]
        if not g_members: continue
        
        g_pos = np.mean([pca_coords[entries.index(e)] for e in g_members], axis=0)
        nodes.append({
            "id": g_id, "label": g_name.split('.')[0].replace('_',' ').capitalize(), 
            "level": 1, "val": 70,
            "x": float(g_pos[0]), "y": float(g_pos[1]), "z": float(g_pos[2])
        })

        # Nebula (Level 2)
        nebula_counts = Counter()
        for e in g_members:
            for path in e['synset'].hypernym_paths():
                if g_syn in path:
                    idx = path.index(g_syn)
                    if idx + 1 < len(path): nebula_counts[path[idx+1].name()] += 1
        
        top_nebulae = [n for n, _ in nebula_counts.most_common(8)]
        for n_name in top_nebulae:
            n_syn = wn.synset(n_name)
            n_id = f"n_{n_name.replace('.','_')}"
            n_members = [e for e in g_members if e['word'] not in processed_ids and (n_syn == e['synset'] or n_syn in e['synset'].closure(lambda s: s.hypernyms()))]
            if not n_members: continue
            
            n_pos = np.mean([pca_coords[entries.index(e)] for e in n_members], axis=0)
            nodes.append({
                "id": n_id, "label": n_name.split('.')[0].replace('_',' ').capitalize(), 
                "level": 2, "val": 40,
                "x": float(n_pos[0]), "y": float(n_pos[1]), "z": float(n_pos[2])
            })
            links.append({"source": g_id, "target": n_id, "kind": "hierarchy", "type": "has_part"})

            for e in n_members:
                idx = entries.index(e)
                pos = pca_coords[idx]
                nodes.append({
                    "id": f"w_{e['word']}", "label": e['word'],
                    "level": 3 if len(n_members) < 30 else 4,
                    "val": 12 if len(n_members) < 30 else 6,
                    "x": float(pos[0]), "y": float(pos[1]), "z": float(pos[2]),
                    "data": {"pos": e['pos']}
                })
                links.append({"source": n_id, "target": f"w_{e['word']}", "kind": "hierarchy", "type": "is_a"})
                processed_ids.add(e['word'])

    # Handle Orphans
    orphans = [e for e in entries if e['word'] not in processed_ids]
    for e in orphans:
        idx = entries.index(e)
        pos = pca_coords[idx]
        nodes.append({
            "id": f"w_{e['word']}", "label": e['word'], "level": 4, "val": 5,
            "x": float(pos[0]), "y": float(pos[1]), "z": float(pos[2]),
            "data": {"pos": e['pos']}
        })
        links.append({"source": outer_rim_id, "target": f"w_{e['word']}", "kind": "hierarchy", "type": "is_a"})

    # --- NEW: Add Semantic Relatedness Links ---
    print("Injecting semantic links based on NLP distance...")
    # To avoid 10k * 10k, we only do this for the most frequent 2000 words
    top_entries = entries[:2000]
    top_vectors = np.stack([e['vec'] for e in top_entries])
    
    # Normalize vectors for cosine similarity
    norms = np.linalg.norm(top_vectors, axis=1, keepdims=True) + 1e-8
    norm_vecs = top_vectors / norms

    for i, e in enumerate(top_entries):
        if i % 500 == 0: print(f"Processing links for {i}...")
        
        # Calculate cosine similarity
        sims = np.dot(norm_vecs, norm_vecs[i])
        # Get top 4 neighbors (excluding self)
        top_idx = np.argsort(sims)[-5:-1]
        
        for idx in top_idx:
            if sims[idx] > 0.4: # Only if they are reasonably similar
                links.append({
                    "source": f"w_{e['word']}", 
                    "target": f"w_{top_entries[idx]['word']}", 
                    "kind": "semantic", 
                    "type": "related"
                })

    output = {
        "version": "v2.5-max",
        "meta": {"generatedAt": 0, "nodeCount": len(nodes), "linkCount": len(links)},
        "nodes": nodes,
        "links": links
    }
    
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False))
    print(f"✅ Build Complete! Total Nodes: {len(nodes)} (Processed from {args.limit} words)")

if __name__ == "__main__": main()