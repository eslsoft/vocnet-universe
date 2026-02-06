# Backend Data Builder

This folder contains the offline data pipeline described in `docs/design.md`.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m spacy download en_core_web_md
```

WordNet will be downloaded automatically on first run.

## Word List

Provide a plain text word list, one word per line (e.g. Oxford 3000/5000). Example:

```bash
cp /path/to/wordlist.txt backend/data/wordlist.txt
```

## Build

```bash
python backend/build_universe.py \
  --wordlist backend/data/wordlist.txt \
  --out public/data/universe_graph.json
```

## Notes

- Output schema follows `docs/design.md` section 4.2.
- Semantic links come from ConceptNet offline dump and are capped via `--max-semantic-links`.
- Word categories come from WordNet hypernyms.
- K-means clusters per category via `--k-per-galaxy`.
- ConceptNet dump default: `backend/data/conceptnet-assertions-5.7.0.csv.gz`.
- ConceptNet cache stored in `backend/data/conceptnet_cache.jsonl`.
