# 🚀 VocNet Universe Builder - Quick Start

## ⚡ 5-Minute Start

```bash
# 1. Activate virtual environment
cd backend
source .venv/bin/activate

# 2. Build your first universe (50 words, fast test)
python cli.py build --builder simple --limit 50

# 3. Check the output
ls -lh ../public/data/universe_simple_generated.json
```

## 📊 Choose Your Builder

| Builder | Speed | Quality | Data Needed | Best For |
|---------|-------|---------|-------------|----------|
| **Simple** | ⚡️ Fast | ⭐⭐⭐ Good | WordNet only | Clean hierarchies, education |
| **LLM** | 🐌 Medium | ⭐⭐⭐⭐⭐ Excellent | LLM graph | Rich semantics, vocab learning |
| **Hybrid** | 🐌 Slow | ⭐⭐⭐⭐⭐ Best | WordNet + LLM | Production, comprehensive |

## 🔧 Common Commands

```bash
# List available builders
python cli.py list

# Build with LLM (needs llm_semantic_graph.json)
python cli.py build --builder llm --limit 1000

# Build hybrid universe
python cli.py build --builder hybrid \
  --wordlist data/wordlist.txt \
  --out ../public/data/my_universe.json \
  --galaxies 5

# Test with small dataset
python cli.py build --builder simple --limit 50
```

## 📁 File Structure

```
backend/
├── cli.py              ← Main entry point
├── core/               ← Core framework (don't modify)
├── builders/           ← Pre-built universe builders
├── data/
│   ├── wordlist.txt    ← Your vocabulary (one word per line)
│   └── llm_semantic_graph.json  ← LLM associations (optional)
└── archive/            ← Old scripts (deprecated)
```

## 🎯 Next Steps

1. **Generate LLM Graph** (for best results):
   ```bash
   python llm_distill.py --limit 500 --provider ollama
   ```

2. **Create Custom Builder:**
   - Copy `builders/simple_builder.py`
   - Modify data sources and processors
   - Use with `python my_builder.py`

3. **Add Custom Data Source:**
   - See `core/data_sources/base.py`
   - Implement `get_word_info()` and `get_relations()`

## 🐛 Troubleshooting

**Error: "Spacy model not found"**
```bash
python -m spacy download en_core_web_md
```

**Error: "LLM graph not found"**
- Use `--builder simple` which doesn't need it, OR
- Generate with `python llm_distill.py`

**Out of memory?**
- Start with `--limit 50`
- Increase gradually: 100, 500, 1000, 5000

## 💡 Tips

- **Start small:** Use `--limit 50` for testing
- **Faster builds:** Use `--builder simple`
- **Best quality:** Generate LLM graph first, then use `--builder hybrid`
- **Custom galaxies:** Adjust with `--galaxies 5` (default: 7)

## 📖 Full Documentation

See [README.md](./README.md) for comprehensive documentation.
