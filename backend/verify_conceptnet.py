import gzip
import sys
from pathlib import Path

def verify_word(target_word, conceptnet_path):
    print("\n--- DATA VERIFICATION FOR: '" + target_word + "' ---")
    count = 0
    if not Path(conceptnet_path).exists():
        print("ConceptNet file not found at: " + conceptnet_path)
        return

    with gzip.open(conceptnet_path, 'rt', encoding='utf-8') as f:
        for line in f:
            cols = line.split('\t')
            if len(cols) < 4: continue
            
            rel = cols[1].split('/')[-1]
            source = cols[2].split('/')[3].lower() if len(cols[2].split('/')) > 3 else ""
            target = cols[3].split('/')[3].lower() if len(cols[3].split('/')) > 3 else ""
            
            if source == target_word or target == target_word:
                if cols[2].startswith('/c/en/') and cols[3].startswith('/c/en/'):
                    print("[" + rel + "] " + source + " -> " + target)
                    count += 1
                    if count >= 30:
                        break
    if count == 0:
        print("No records found.")

cn_path = "backend/data/conceptnet-assertions-5.7.0.csv.gz"
verify_word("fruit", cn_path)
verify_word("body", cn_path)
verify_word("bird", cn_path)
verify_word("hospital", cn_path)
