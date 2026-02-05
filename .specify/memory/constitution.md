<!--
Sync Impact Report:
Version Change: Initial → 1.0.0
Modified Principles: N/A (Initial creation)
Added Sections:
  - All sections (initial constitution creation)
  - Core Principles (6 principles defined)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md: Constitution Check section exists and will reference these principles
  ✅ spec-template.md: Requirements and user scenarios align with constitution principles
  ✅ tasks-template.md: Task structure supports principle-driven development (performance, testing, documentation)
Follow-up TODOs: None - all placeholders filled
-->

# Vocab Verse Constitution

## Core Principles

### I. Performance-First Development

**Rule**: Every feature MUST meet the following non-negotiable performance targets:
- First Load Time: < 3.0s (with gzipped assets ≤ 8MB)
- Interaction Frame Rate: 45-60 FPS on mid-range devices (2020+ laptops)
- Force Simulation Convergence: < 4s
- GPU Utilization Peak: < 70% on desktop devices

**Rationale**: Vocab Verse renders 10,000+ nodes in 3D WebGL space. Performance degradation directly impacts learning effectiveness and user retention. These metrics are derived from the technical design document and represent the minimum viable performance for an immersive learning experience.

**Implementation**: All PRs involving rendering, data structures, or interaction MUST include performance measurements. Use browser DevTools Performance tab and report metrics in PR description.

### II. 3D-First Visualization Architecture

**Rule**: The application MUST use WebGL-based 3D rendering as the primary visualization method:
- Rendering Engine: react-force-graph-3d with Three.js
- NO fallback to 2D Canvas or SVG for primary graph visualization
- Level of Detail (LOD) rendering MUST be implemented for all node types
- Physics simulation MUST use d3-force with custom force configurations

**Rationale**: The core value proposition is immersive 3D spatial learning. Traditional 2D approaches cannot support the "universe metaphor" (galaxies, nebulae, stars, planets) that makes vocabulary relationships tangible and memorable. WebGL is the only technology capable of rendering 10,000+ dynamic nodes at 60 FPS.

**LOD Requirements**:
- L0 (Root): Always visible
- L1 (Galaxy): Zoom > 0.1
- L2 (Nebula): Zoom > 0.5
- L3 (Star): Zoom > 1.0
- L4 (Planet): Zoom > 2.5

### III. Data Integrity & Static-First Architecture

**Rule**: The graph topology (nodes, links, hierarchies) MUST be:
- Pre-computed offline using Python ETL pipeline (spaCy + WordNet)
- Served as static JSON from CDN (with Brotli/Gzip compression)
- NEVER computed or modified on the client side
- Version-controlled with semantic versioning (data schema changes)

**Dynamic State Exception**: User progress (mastered_ids, current_view, filters) is the ONLY data stored server-side and merged at runtime.

**Rationale**: Computing semantic relationships and clustering for 10,000+ words requires NLP models that cannot run efficiently in browsers. Pre-computation ensures consistency, enables CDN caching, and eliminates expensive runtime computation.

**Schema Versioning**: universe_graph.json MUST include a "version" field. Breaking schema changes require MAJOR version bump.

### IV. Semantic Quality & Multi-Dimensional Classification

**Rule**: Every word node MUST include pre-computed grouping across at least three dimensions:
1. **semantic**: Pure semantic clustering (default view)
2. **category**: Anchor-based classification (Location, People, Time, Action, Emotion, Nature, Abstract)
3. **pos**: Part-of-speech tagging (Noun, Verb, Adjective, Adverb)

**Classification Pipeline** (Non-Negotiable):
- Phase 1: spaCy vector similarity (en_core_web_md minimum)
- Phase 2: WordNet validation for ambiguous cases (similarity score < 0.6)
- Phase 3: Manual sampling validation (minimum 50 random words per category)

**Rationale**: Single-dimension clustering creates "毛球效应" (hairball effect) where users cannot navigate large graphs. Multi-dimensional views enable users to explore vocabulary through different mental models (spatial, functional, grammatical), improving learning outcomes.

**Quality Gate**: Classification accuracy MUST be ≥ 85% on manual validation before data deployment.

### V. AI Integration & Cost Control

**Rule**: AI-powered features (Gemini API) MUST:
- Be proxy-routed through backend API (NEVER expose API keys to frontend)
- Implement aggressive client-side caching (localStorage + IndexedDB)
- Have fallback modes for API failures (definition-only mode using static data)
- Track and report API usage costs per session
- Implement rate limiting (max 100 requests per user per day)

**Rationale**: AI analysis enhances learning but is not core functionality. Uncontrolled API usage can lead to unpredictable costs. The architecture must gracefully degrade when AI is unavailable or over budget.

**Cost Budget**: Monthly AI API costs MUST NOT exceed $100 for MVP phase (estimated ~3,000 API calls).

### VI. Progressive Disclosure & Educational UX

**Rule**: The interface MUST implement progressive disclosure:
- **Macro View (Zoom < 1.0)**: Show only galaxies and major structures with educational labels
- **Meso View (1.0 ≤ Zoom < 2.5)**: Reveal individual stars (core vocabulary) with tooltips
- **Micro View (Zoom ≥ 2.5)**: Display planets (derived words) and detailed connections
- **HUD Elements**: Search, filters, and controls MUST be persistent but non-intrusive

**Interaction Requirements**:
- Hover: Show word label + basic definition (< 500ms latency)
- Click: Open side panel with full details + AI analysis option
- Drag: Physics-based "pull" with gravity feedback
- Search: Smooth camera transition to target node (< 1s animation)

**Rationale**: Overwhelming users with all 10,000 words simultaneously defeats the purpose of immersive learning. Progressive disclosure maps to natural human exploration patterns (overview → zoom → details) and reduces cognitive load.

## Technology Constraints

### Mandatory Stack

- **Frontend Framework**: React 18+ (Vite build system)
- **3D Rendering**: react-force-graph-3d (v1.44.5+) with Three.js
- **Physics**: d3-force (included with react-force-graph)
- **State Management**: Zustand (for filters, view state, user progress)
- **Styling**: Tailwind CSS v4+
- **Type Safety**: TypeScript 5.9+ (strict mode)

### Backend Stack (Lightweight)

- **API Server**: Node.js/Express OR Go (lightweight REST API)
- **Data Processing**: Python 3.9+ (spaCy, NLTK, scikit-learn, networkx)
- **AI Proxy**: Google Gemini API integration
- **Storage**: Simple key-value store for user progress (Redis/PostgreSQL)

### Prohibited Technologies

- **NO 2D-only graph libraries** (D3.js force layout, Cytoscape.js, Sigma.js)
  - Reason: Cannot achieve immersive 3D universe metaphor
- **NO server-side graph computation** (Neo4j, GraphQL with real-time clustering)
  - Reason: Violates static-first architecture principle
- **NO heavy frontend NLP libraries** (compromise.js, natural, wink-nlp)
  - Reason: Violates pre-computation principle and degrades performance

## Development Workflow

### Feature Development Process

1. **Specification Phase**: All features start with spec.md creation via `/speckit.specify`
   - MUST include performance impact analysis for rendering-related features
   - MUST include data schema changes (if applicable)

2. **Planning Phase**: Generate implementation plan via `/speckit.plan`
   - MUST verify Constitution Check passes (especially performance & architecture principles)
   - MUST identify affected modules (graph rendering, data pipeline, API, UI)

3. **Task Generation**: Create actionable tasks via `/speckit.tasks`
   - MUST organize tasks by user story priority (P1, P2, P3...)
   - MUST include performance validation tasks for rendering changes

4. **Implementation**: Execute via `/speckit.implement`
   - MUST commit after each logical task completion
   - MUST verify performance benchmarks before marking tasks complete

### Code Review Gates

**All PRs MUST pass**:
1. **Type Safety**: No TypeScript errors in strict mode
2. **Performance**: Metrics reported and within budget
3. **Data Schema**: Changes documented and version-bumped
4. **Constitution Compliance**: Explicitly confirmed in PR description

**Constitution Violations**:
- If a feature requires violating a principle, it MUST be justified in the Complexity Tracking table of plan.md
- Justification MUST include: why needed, why simpler alternative was rejected
- Requires explicit approval from project maintainer

### Testing Requirements

**Critical Path Testing** (Mandatory):
- 3D rendering pipeline (WebGL context creation, scene rendering)
- LOD switching logic (zoom thresholds)
- Physics simulation stability (force convergence)
- Data loading and indexing (JSON parsing, node/link validation)

**Integration Testing** (Recommended):
- User progress sync (client ↔ API)
- AI analysis flow (frontend → backend proxy → Gemini → frontend)
- View switching (semantic ↔ category ↔ POS)

**Performance Testing** (Mandatory for rendering changes):
- Frame rate measurement (browser Performance API)
- Memory profiling (heap snapshots before/after)
- Network payload size (Lighthouse audit)

### Documentation Requirements

**Code Documentation**:
- Complex force configurations MUST include comments explaining physics rationale
- LOD thresholds MUST be documented with visual examples
- Data schema fields MUST be documented in JSDoc/TypeScript interfaces

**User-Facing Documentation**:
- Quickstart guide for running locally (quickstart.md)
- Data pipeline documentation for updating vocabulary (in docs/)
- Architecture decision records for major technical choices

## Governance

### Amendment Process

1. **Propose**: Open GitHub issue with "Constitution Amendment" label
   - Describe principle change, rationale, impact analysis
2. **Discuss**: Allow minimum 7-day comment period
3. **Approve**: Requires maintainer approval + no blocking concerns
4. **Migrate**: Update constitution.md, increment version, update templates

### Version Policy

- **MAJOR (X.0.0)**: Breaking changes to core principles (e.g., removing performance-first requirement)
- **MINOR (0.X.0)**: New principles or significant expansions (e.g., adding security principle)
- **PATCH (0.0.X)**: Clarifications, examples, typo fixes

### Compliance Review

- Constitution compliance is verified during Phase 0 (Plan) via Constitution Check section
- Re-verified after Phase 1 (Design) to ensure design doesn't violate principles
- Violations logged in Complexity Tracking table with justifications

### Runtime Guidance

For day-to-day development decisions not covered by this constitution, consult:
- `docs/design.md`: Technical architecture and implementation details
- `README.md`: Quick start and development environment setup
- Project templates in `.specify/templates/`: For feature workflow guidance

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05
