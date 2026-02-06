import json
from pathlib import Path

def audit(word):
    path = Path('public/data/semantic_graph.json')
    if not path.exists():
        print("JSON not found!")
        return
    
    data = json.loads(path.read_text())
    wid = f"w_{word}"
    print("\n--- AUDIT FOR: " + word.upper() + " ---")
    
    node = next((n for n in data['nodes'] if n['id'] == wid), None)
    if not node:
        print("Node not found!")
        return

    parents, children, parts, related = [], [], [], []
    
    for l in data['links']:
        s, t, ltype = l['source'], l['target'], l['type']
        if s == wid:
            name = t.replace('w_', '').replace('v_', '[V]')
            if ltype == 'is_a': parents.append(name)
            elif ltype == 'has_kind': children.append(name)
            elif ltype == 'has_part': parts.append(name)
            else: related.append(name)
        elif t == wid:
            name = s.replace('w_', '').replace('v_', '[V]')
            if ltype == 'is_a': children.append(name)
            elif ltype == 'has_kind': parents.append(name)
            elif ltype == 'has_part': related.append(name)
            
    print("PARENTS (Left): " + str(list(set(parents))[:15]))
    print("CHILDREN (Right): " + str(list(set(children))[:15]))
    print("PARTS (Right): " + str(list(set(parts))[:15]))
    print("RELATED: " + str(list(set(related))[:15]))

audit('fruit')
audit('body')
audit('bird')
audit('car')
audit('hospital')