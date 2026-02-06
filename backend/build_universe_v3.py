#!/usr/bin/env python3
"""
VocNet Universe Builder V3.0 - "THEMATIC CONSTELLATIONS"
- Integrates LLM Semantic Distillation data.
- Implements Phase 2: Thematic Groups.
- Adds LLM-based semantic links.
"""
import argparse
import json
import math
import random
import time
from collections import Counter
from pathlib import Path
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Reduced stop synsets to allow more words in
STOP_SYNSETS = {'entity.n.01', 'physical_entity.n.01'}

# LLM Link Types
LLM_LINK_TYPES = {
    "synonym": {"label": "Synonym", "color": "#10b981"},
    "antonym": {"label": "Antonym", "color": "#ef4444"},
    "category": {"label": "Category", "color": "#6366f1"},
    "attribute": {"label": "Attribute", "color": "#f59e0b"},
    "action": {"label": "Action", "color": "#8b5cf6"},
    "context": {"label": "Context", "color": "#ec4899"},
    "component": {"label": "Component", "color": "#06b6d4"},
    "consequence": {"label": "Consequence", "color": "#f97316"}
}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordlist", default="backend/data/wordlist.txt")
    parser.add_argument("--llm_data", default="backend/data/llm_semantic_graph.json")
    parser.add_argument("--out", default="public/data/universe_v2.json")
    parser.add_argument("--limit", type=int, default=10000)
    args = parser.parse_args()

    import spacy
    from nltk.corpus import wordnet as wn
    
    print(f"🚀 Initializing Universe V3 Engine...")
    nlp = spacy.load("en_core_web_md")
    
    raw_words = Path(args.wordlist).read_text().splitlines()
    words_to_process = [w.strip().lower() for w in raw_words if w.strip()][:args.limit]
    
    # Load LLM Data
    llm_data = {}
    if Path(args.llm_data).exists():
        print(f"Loading LLM Semantic Data from {args.llm_data}...")
        llm_data = json.loads(Path(args.llm_data).read_text())
    
    # Filter words: ONLY those present in LLM data
    processed_llm_words = set(llm_data.keys())
    words_to_process = [w for w in words_to_process if w in processed_llm_words]
    
    print(f"Filtered to {len(words_to_process)} words with LLM data.")
    
    entries = []
    seen = set()
    docs = list(nlp.pipe(words_to_process, batch_size=512))
    
    all_hypernyms = Counter()
    print("Extracting semantic hierarchies...")
    for doc in docs:
        word = doc.text
        if not doc.has_vector or word in seen or "_" in word or len(word) < 2: continue
        seen.add(word)
        
        synsets = wn.synsets(word)
        if not synsets:
            entries.append({'word': word, 'vec': doc.vector, 'synset': None, 'pos': doc[0].pos_})
            continue
        
        syn = synsets[0]
        for path in syn.hypernym_paths():
            for ancestor in path:
                if ancestor.name() not in STOP_SYNSETS:
                    all_hypernyms[ancestor.name()] += 1
        
        entries.append({'word': word, 'vec': doc.vector, 'synset': syn, 'pos': doc[0].pos_})

    # PCA Space
    print(f"Computing 3D Coordinates...")
    vecs = np.stack([e['vec'] for e in entries])
    pca_coords = PCA(n_components=3).fit_transform(StandardScaler().fit_transform(vecs))
    pca_coords = np.tanh(pca_coords / (np.std(pca_coords) * 2)) * 4000.0

    # Identify 40 Galaxies
    print("Identifying Galaxies...")
    galaxies = []
    for s_name, _ in all_hypernyms.most_common(200):
        syn = wn.synset(s_name)
        if not any(syn in wn.synset(g).closure(lambda s: s.hyponyms()) for g in galaxies):
            galaxies.append(s_name)
        if len(galaxies) >= 40: break

    nodes, links = [], []
    processed_ids = set()
    word_to_node_id = {}

    # Define Themes (Phase 2)
    # We'll use the most common LLM categories as themes
    theme_counts = Counter()
    for word, associations in llm_data.items():
        for assoc in associations:
            if assoc['type'] == 'category':
                theme_counts[assoc['target'].capitalize()] += 1
    
    top_themes = [t for t, _ in theme_counts.most_common(25)]
    if not top_themes: # Fallback if no LLM data
        top_themes = ["Science", "Art", "Society", "Nature", "Technology", "Health", "Business", "Daily Life"]
    
    groups = []
    theme_to_id = {}
    for i, theme in enumerate(top_themes):
        t_id = f"theme_{theme.lower().replace(' ', '_')}"
        theme_to_id[theme] = t_id
        # Distribute theme centers in a large sphere
        phi = math.acos(-1 + 2 * i / len(top_themes))
        theta = math.sqrt(len(top_themes) * math.pi) * phi
        groups.append({
            "id": t_id,
            "label": theme,
            "color": f"hsl({(i * 137.5) % 360}, 60%, 55%)",
            "center": {
                "x": 2000 * math.sin(phi) * math.cos(theta),
                "y": 2000 * math.sin(phi) * math.sin(theta),
                "z": 2000 * math.cos(phi)
            }
        })

    def get_best_theme(word, entry):
        # 1. Try LLM category
        if word in llm_data:
            for assoc in llm_data[word]:
                if assoc['type'] == 'category' and assoc['target'].capitalize() in theme_to_id:
                    return theme_to_id[assoc['target'].capitalize()]
        
        # 2. Random but stable fallback based on word hash
        return groups[hash(word) % len(groups)]['id']

    # Special "Outer Rim" Galaxy
    outer_rim_id = "g_outer_rim"
    nodes.append({
        "id": outer_rim_id, "label": "Unknown Domains", 
        "level": 1, "val": 80, "x": 0, "y": 0, "z": 5000,
        "groupId": groups[0]['id']
    })

    # Building Hierarchy
    for i, g_name in enumerate(galaxies):
        g_syn = wn.synset(g_name)
        g_id = f"g_{g_name.replace('.','_')}"
        g_members = [e for e in entries if e['synset'] and g_syn in e['synset'].closure(lambda s: s.hypernyms())]
        if not g_members: continue
        
        g_pos = np.mean([pca_coords[entries.index(e)] for e in g_members], axis=0)
        
        # Galaxy theme is the majority theme of its members
        member_themes = [get_best_theme(e['word'], e) for e in g_members]
        g_theme = Counter(member_themes).most_common(1)[0][0]

        nodes.append({
            "id": g_id, "label": g_name.split('.')[0].replace('_',' ').capitalize(), 
            "level": 1, "val": 70,
            "x": float(g_pos[0]), "y": float(g_pos[1]), "z": float(g_pos[2]),
            "groupId": g_theme
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
                "x": float(n_pos[0]), "y": float(n_pos[1]), "z": float(n_pos[2]),
                "groupId": g_theme
            })
            links.append({"source": g_id, "target": n_id, "kind": "hierarchy", "type": "has_part"})

            for e in n_members:
                idx = entries.index(e)
                pos = pca_coords[idx]
                w_id = f"w_{e['word']}"
                w_theme = get_best_theme(e['word'], e)
                node_data = {"pos": e['pos']}
                if e['word'] in llm_data:
                    node_data["associations"] = llm_data[e['word']]
                
                nodes.append({
                    "id": w_id, "label": e['word'],
                    "level": 3 if len(n_members) < 30 else 4,
                    "val": 12 if len(n_members) < 30 else 6,
                    "x": float(pos[0]), "y": float(pos[1]), "z": float(pos[2]),
                    "groupId": w_theme,
                    "data": node_data
                })
                links.append({"source": n_id, "target": w_id, "kind": "hierarchy", "type": "is_a"})
                processed_ids.add(e['word'])
                word_to_node_id[e['word']] = w_id

    # Handle Orphans
    orphans = [e for e in entries if e['word'] not in processed_ids]
    for e in orphans:
        idx = entries.index(e)
        pos = pca_coords[idx]
        w_id = f"w_{e['word']}"
        w_theme = get_best_theme(e['word'], e)
        node_data = {"pos": e['pos']}
        if e['word'] in llm_data:
            node_data["associations"] = llm_data[e['word']]
            
        nodes.append({
            "id": w_id, "label": e['word'], "level": 4, "val": 5,
            "x": float(pos[0]), "y": float(pos[1]), "z": float(pos[2]),
            "groupId": w_theme,
            "data": node_data
        })
        links.append({"source": outer_rim_id, "target": w_id, "kind": "hierarchy", "type": "is_a"})
        word_to_node_id[e['word']] = w_id

    # --- ADD LLM SEMANTIC LINKS ---
    print("Injecting LLM semantic links...")
    for word, associations in llm_data.items():
        if word not in word_to_node_id: continue
        src_id = word_to_node_id[word]
        
        for assoc in associations:
            target_word = assoc['target']
            if target_word in word_to_node_id:
                links.append({
                    "source": src_id,
                    "target": word_to_node_id[target_word],
                    "kind": "semantic",
                    "type": assoc['type']
                })

    # Create Theme Nodes (Level 0)
    for g in groups:
        nodes.append({
            "id": g['id'],
            "label": g['label'].upper(),
            "level": 0,
            "val": 150,
            "x": g['center']['x'],
            "y": g['center']['y'],
            "z": g['center']['z'],
            "color": g['color'],
            "groupId": g['id']
        })

    # Schema
    schema = {
        "levels": {
            "0": {"name": "Theme", "color": "#ffffff"},
            "1": {"name": "Galaxy", "color": "#a855f7"},
            "2": {"name": "Nebula", "color": "#38bdf8"},
            "3": {"name": "Star", "color": "#f59e0b"},
            "4": {"name": "Planet", "color": "#22c55e"}
        },
        "linkTypes": {
            "is_a": {"label": "Is a...", "color": "#f472b6"},
            "has_part": {"label": "Part of", "color": "#f97316"},
            **LLM_LINK_TYPES
        }
    }

    output = {
        "version": "v3.0-themes",
        "meta": {
            "generatedAt": int(time.time() * 1000), 
            "nodeCount": len(nodes), 
            "linkCount": len(links)
        },
        "schema": schema,
        "groups": groups,
        "nodes": nodes,
        "links": links
    }
    
    print(f"Saving to {args.out}...")
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False))
    print(f"✅ Build Complete! Total Nodes: {len(nodes)}, Links: {len(links)}")

if __name__ == "__main__": main()
