import nltk
from nltk.corpus import wordnet as wn

def analyze(word):
    syns = wn.synsets(word, pos=wn.NOUN)
    if not syns: return
    s = syns[0]
    print(f"\n--- {word.upper()} ({s.name()}) ---")
    
    parts = s.part_meronyms()
    print(f"Direct parts: {[p.name().split('.')[0] for p in parts]}")
    
    print("Inheritance check:")
    for path in s.hypernym_paths():
        for ancestor in path:
            a_parts = ancestor.part_meronyms()
            if a_parts:
                print(f"  {ancestor.name()} defines: {[p.name().split('.')[0] for p in a_parts]}")

analyze('fish')
analyze('bird')
analyze('body')