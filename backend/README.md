# VocNet Universe Backend

A modular, composable framework for building vocabulary universes.

## 🏗️ Architecture

```
backend/
├── core/                    # Core framework
│   ├── models.py           # Data models (WordInfo, UniverseData)
│   ├── builder.py          # Main UniverseBuilder orchestrator
│   ├── exporter.py         # V4 JSON exporter
│   ├── data_sources/       # Data source abstractions
│   │   ├── base.py         # Abstract base class
│   │   ├── wordnet.py      # WordNet hierarchy & definitions
│   │   ├── spacy.py        # Word vectors & POS
│   │   ├── llm.py          # LLM semantic associations
│   │   └── conceptnet.py   # Common-sense relations
│   └── processors/         # Data processors
│       ├── hierarchy.py    # Hierarchy level assignment
│       ├── semantic.py     # Similarity-based relations
│       ├── clustering.py   # Galaxy grouping
│       └── ranking.py      # Frequency scoring
├── builders/               # Concrete universe builders
│   ├── llm_builder.py      # LLM-driven semantic universe
│   ├── hybrid_builder.py   # Multi-source comprehensive universe
│   └── simple_builder.py   # WordNet-only clean universe
├── utils/                  # Utilities
├── cli.py                  # Unified CLI entry point
└── data/                   # Data files
    ├── wordlist.txt        # Input vocabulary
    └── llm_semantic_graph.json  # LLM associations
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Spacy model
python -m spacy download en_core_web_md
```

### 2. Build a Universe

```bash
# Build LLM semantic universe (requires llm_semantic_graph.json)
python backend/cli.py build --builder llm --limit 1000

# Build hybrid universe (WordNet + LLM + Spacy)
python backend/cli.py build --builder hybrid --limit 500

# Build simple WordNet universe
python backend/cli.py build --builder simple --wordlist backend/data/wordlist.txt
```

### 3. Use Custom Wordlist

```bash
# Build with your own wordlist
python backend/cli.py build \
  --builder hybrid \
  --wordlist path/to/your/wordlist.txt \
  --out public/data/my_universe.json \
  --galaxies 5
```

## 📦 Available Builders

### 🔮 LLM Builder
**Best for:** Rich semantic networks with human-learning-optimized relations

**Data sources:**
- LLM semantic associations (primary)
- Spacy word vectors

**Features:**
- Deep semantic relations (synonym, antonym, category, etc.)
- Thematic galaxy clustering
- Optimized for vocabulary learning

```python
from builders import build_llm_universe

universe = build_llm_universe(
    wordlist=['speak', 'talk', 'communicate', ...],
    output_path='public/data/universe_llm.json',
    num_galaxies=7
)
```

### 🌐 Hybrid Builder
**Best for:** Comprehensive, well-structured universes

**Data sources:**
- WordNet (hierarchy, definitions)
- LLM (semantic relations)
- Spacy (vectors, similarity)

**Features:**
- Solid hierarchical structure from WordNet
- Rich semantic associations from LLM
- Vector-based similarity relations
- Best overall quality

```python
from builders import build_hybrid_universe

universe = build_hybrid_universe(
    wordlist=['animal', 'dog', 'cat', ...],
    output_path='public/data/universe_hybrid.json'
)
```

### 📚 Simple Builder
**Best for:** Clean, educational hierarchies

**Data sources:**
- WordNet (hierarchy, definitions)
- Spacy (vectors for clustering)

**Features:**
- Clear parent-child relationships
- Vector-based galaxy clustering
- No noise, easy to understand

```python
from builders import build_simple_universe

universe = build_simple_universe(
    wordlist=['fruit', 'apple', 'banana', ...],
    output_path='public/data/universe_simple.json'
)
```

## 🔧 Advanced Usage

### Custom Builder

Create your own builder by combining data sources and processors:

```python
from core import UniverseBuilder
from core.data_sources import WordNetSource, SpacySource
from core.processors import HierarchyProcessor, FrequencyRankingProcessor

# Create custom builder
builder = UniverseBuilder(name="my_universe")

# Add data sources
builder.add_source(WordNetSource())
builder.add_source(SpacySource("en_core_web_md"))

# Add processors
builder.add_processor(HierarchyProcessor())
builder.add_processor(FrequencyRankingProcessor())

# Build
universe = builder.build(wordlist)

# Export
from core.exporter import V4Exporter
exporter = V4Exporter()
exporter.export(universe, "output.json")
```

### Custom Processor

Implement custom processing logic:

```python
from core.processors import Processor
from core.models import WordInfo

class MyCustomProcessor(Processor):
    def process(self, words: List[WordInfo]) -> List[WordInfo]:
        # Your custom logic here
        for word in words:
            # Modify word properties
            word.metadata['custom_field'] = some_value
        return words

# Use it
builder.add_processor(MyCustomProcessor())
```

## 📊 Data Sources

### WordNet
- **Provides:** Hierarchy, definitions, POS
- **Setup:** Auto-downloaded via NLTK
- **Best for:** Clean hierarchical relationships

### Spacy
- **Provides:** Word vectors, POS tagging
- **Setup:** `python -m spacy download en_core_web_md`
- **Best for:** Similarity computation, clustering

### LLM Semantic Graph
- **Provides:** Rich semantic associations
- **Setup:** Generate using `llm_distill.py` (see below)
- **Best for:** Human-learning-optimized relations

### ConceptNet (Optional)
- **Provides:** Common-sense relations
- **Setup:** Download conceptnet-assertions-5.7.0.csv.gz
- **Best for:** Broad common-sense knowledge

## 🤖 Generating LLM Semantic Graph

Use `llm_distill.py` to generate semantic associations:

```bash
# Using local Ollama
python backend/llm_distill.py \
  --wordlist backend/data/wordlist.txt \
  --provider ollama \
  --model llama3.1 \
  --workers 4 \
  --limit 1000

# Using OpenAI
python backend/llm_distill.py \
  --wordlist backend/data/wordlist.txt \
  --provider openai \
  --model gpt-4o-mini \
  --workers 8

# Resume from checkpoint
python backend/llm_distill.py --resume
```

## 📤 Output Format

All builders output the standard v4.0-static format:

```json
{
  "version": "v4.0-static",
  "meta": {
    "id": "universe_name",
    "name": "Universe Name",
    "generatedAt": 1707123456789,
    "wordCount": 1000
  },
  "galaxies": [
    {
      "id": "galaxy_communication",
      "name": "Communication",
      "color": "hsl(0, 70%, 60%)",
      "center": {"x": 1000, "y": 2000, "z": 500}
    }
  ],
  "words": [
    {
      "id": "word_speak",
      "word": "speak",
      "frequency": 8520,
      "firstRecordedYear": 1200,
      "hierarchyLevel": 2,
      "pos": "verb",
      "definition": "to say words orally",
      "galaxyId": "galaxy_communication",
      "relations": [
        {
          "targetId": "word_talk",
          "type": "hyponym",
          "strength": 0.8
        }
      ]
    }
  ]
}
```

## 🧪 Testing

```bash
# Test individual builders
python backend/builders/llm_builder.py
python backend/builders/hybrid_builder.py
python backend/builders/simple_builder.py

# Test with small wordlist
python backend/cli.py build --builder hybrid --limit 50
```

## 📝 Tips

1. **Start Small:** Test with `--limit 50` before processing thousands of words
2. **LLM Graph:** Pre-generate LLM semantic graph for best results with llm/hybrid builders
3. **Memory:** Large wordlists (>5000) may need 8GB+ RAM
4. **Caching:** Spacy vectors and WordNet data are cached after first load
5. **Galaxy Count:** 5-10 galaxies work well for most vocabularies

## 🐛 Troubleshooting

### "Spacy model not found"
```bash
python -m spacy download en_core_web_md
```

### "LLM graph not found"
Generate it first with `llm_distill.py` or use `simple` builder which doesn't need it.

### "Out of memory"
Reduce `--limit` or use `simple` builder which is more memory-efficient.

## 📚 Legacy Scripts

Old build scripts are archived in `backend/archive/` for reference:
- `build_universe.py` → Use `cli.py build --builder simple`
- `build_universe_v2.py` → Use `cli.py build --builder hybrid`
- `build_universe_v3.py` → Use `cli.py build --builder llm`
- `build_universe_v4.py` → Use `cli.py build --builder llm`

## 🔗 Related

- Frontend: `/src` - React + Three.js visualization
- Design Docs: `/docs/design.md`
- Universe Types: `/src/types/universe.ts`
