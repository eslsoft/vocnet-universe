# Archived Build Scripts

These scripts are kept for reference but are **deprecated**.

Use the new modular framework instead: `python backend/cli.py build`

## Migration Guide

| Old Script | New Command |
|------------|-------------|
| `build_universe.py` | `cli.py build --builder simple` |
| `build_universe_v2.py` | `cli.py build --builder hybrid` |
| `build_universe_v3.py` | `cli.py build --builder llm` |
| `build_universe_v4.py` | `cli.py build --builder llm` |
| `build_semantic.py` | Use `SemanticProcessor` |
| `build_category.py` | Use `ThematicClusteringProcessor` |

## Why Deprecated?

1. **Code Duplication:** Each script reimplemented similar logic
2. **Hard to Maintain:** Changes had to be made in multiple places
3. **Not Composable:** Couldn't mix and match data sources
4. **No Abstraction:** Tightly coupled to specific data sources

## New Framework Benefits

1. **Modular:** Reusable data sources and processors
2. **Composable:** Mix and match components
3. **Clean:** Single responsibility principle
4. **Testable:** Each component can be tested independently
5. **Extensible:** Easy to add new sources or processors
