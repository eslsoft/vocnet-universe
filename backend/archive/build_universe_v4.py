#!/usr/bin/env python3
"""
VocNet Universe Builder V4.11 - "The Galaxy Fix"
- Correctly uses 'galaxyId' and 'solarSystemId' keys in the output JSON.
- Ensures galaxy centers are correctly mapped to node attributes.
"""
import json
import time
import random
import argparse
import math
import numpy as np
from pathlib import Path
from collections import Counter

def download_nltk_data():
    import nltk
    try:
        from nltk.corpus import wordnet as wn
        wn.ensure_loaded()
    except:
        nltk.download('wordnet')
        nltk.download('omw-1.4')

def get_wordnet_info(word):
    from nltk.corpus import wordnet as wn
    synsets = wn.synsets(word)
    if not synsets: return None, f"The concept of {word}", 10
    syn = synsets[0]
    return syn, syn.definition(), syn.min_depth()

def main():
    download_nltk_data()
    from nltk.corpus import wordnet as wn
    import spacy
    
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    default_out = project_root / "public" / "data" / "universe_v4_generated.json"

    parser = argparse.ArgumentParser()
    parser.add_argument("--llm_data", default=str(project_root / "backend" / "data" / "llm_semantic_graph.json"))
    parser.add_argument("--out", default=str(default_out))
    parser.add_argument("--limit", type=int, default=2000)
    args = parser.parse_args()

    nlp = spacy.load("en_core_web_md")
    llm_data = json.loads(Path(args.llm_data).read_text())
    all_words = list(llm_data.keys())
    
    in_degrees = Counter()
    for word, assocs in llm_data.items():
        for a in assocs: in_degrees[a['target']] += 1
    
    sorted_words = sorted(all_words, key=lambda w: in_degrees[w], reverse=True)
    if args.limit: sorted_words = sorted_words[:args.limit]
    
    hubs = [w for w in sorted_words if in_degrees[w] > 15]
    hub_vectors = {h: nlp(h).vector for h in hubs if nlp(h).has_vector}

    # Galaxies Setup
    GALAXY_NAMES = ["communication", "education", "technology", "science", "emotion", "action", "abstract"]
    galaxies_config = []
    radius = 4000
    for i, g_name in enumerate(GALAXY_NAMES):
        phi = math.acos(-1 + 2 * i / len(GALAXY_NAMES))
        theta = math.sqrt(len(GALAXY_NAMES) * math.pi) * phi
        galaxies_config.append({
            "id": f"galaxy_{g_name}",
            "name": g_name.capitalize(),
            "color": f"hsl({(i * 137.5) % 360}, 70%, 60%)",
            "center": {
                "x": radius * math.sin(phi) * math.cos(theta),
                "y": radius * math.sin(phi) * math.sin(theta),
                "z": radius * math.cos(phi)
            }
        })

    vocab_words = []
    word_to_node = {}

    for word in sorted_words:
        deg = in_degrees[word]
        if deg > 40: level = 1; freq = 9000
        elif deg > 15: level = 2; freq = 7500
        else: level = 4; freq = 3000
            
        syn, definition, depth = get_wordnet_info(word)
        doc = nlp(word)
        
        node = {
            "id": f"word_{word}", "word": word, "frequency": freq, "firstRecordedYear": 1000 + (depth * 50),
            "hierarchyLevel": level, "pos": doc[0].pos_.lower() if len(doc) > 0 else "noun", 
            "definition": definition, "galaxyId": "galaxy_abstract", "relations": []
        }
        vocab_words.append(node)
        word_to_node[word] = node

    for vw in vocab_words:
        word = vw['word']
        if vw['hierarchyLevel'] <= 2: continue
        
        parent_name = None
        if word in llm_data:
            for assoc in llm_data[word]:
                if assoc['type'] == 'category' and assoc['target'] in word_to_node:
                    parent_name = assoc['target']; break
        
        if not parent_name:
            word_vec = nlp(word).vector if nlp(word).has_vector else None
            if word_vec is not None and hub_vectors:
                best_hub = None; max_sim = -1
                for h_name, h_vec in hub_vectors.items():
                    sim = np.dot(word_vec, h_vec) / (np.linalg.norm(word_vec) * np.linalg.norm(h_vec))
                    if sim > max_sim: max_sim = sim; best_hub = h_name
                parent_name = best_hub
        
        if not parent_name and hubs: parent_name = hubs[0]

        if parent_name:
            parent = word_to_node[parent_name]
            if parent['hierarchyLevel'] >= 4:
                vw['hierarchyLevel'] = 6
                vw['frequency'] = 800
            else:
                vw['hierarchyLevel'] = 4
                vw['frequency'] = 2500
            
            vw['galaxyId'] = parent['galaxyId']
            vw['solarSystemId'] = parent.get('solarSystemId', parent['id'])
            vw['relations'].append({"targetId": parent['id'], "type": "hypernym", "strength": 1.0})

    # Distribute hubs into GALAXY_NAMES
    for i, hub_name in enumerate(hubs):
        word_to_node[hub_name]['galaxyId'] = f"galaxy_{GALAXY_NAMES[i % len(GALAXY_NAMES)]}"
    
    # Propagate galaxyId
    for _ in range(3):
        for vw in vocab_words:
            for rel in vw['relations']:
                if rel['type'] == "hypernym":
                    p = word_to_node.get(rel['targetId'].replace("word_", ""))
                    if p: vw['galaxyId'] = p['galaxyId']

    data_to_save = {
        "version": "v4.0-static",
        "meta": {
            "id": "generated", "name": "AI Dynamic Universe",
            "generatedAt": int(time.time() * 1000), "wordCount": len(vocab_words)
        },
        "galaxies": galaxies_config,
        "words": vocab_words
    }
    
    print(f"Saving to {args.out}...")
    Path(args.out).write_text(json.dumps(data_to_save, indent=2, ensure_ascii=False))
    print(f"✅ Generated {len(vocab_words)} nodes with correct galaxyId schema.")

if __name__ == "__main__":
    main()