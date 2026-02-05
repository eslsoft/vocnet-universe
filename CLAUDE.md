# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VocNet Universe is a React + TypeScript + Vite application that visualizes vocabulary relationships using a 3D force-directed graph. The application presents a hierarchical "universe" metaphor where vocabulary items are organized from roots → galaxies → nebulae → stars → planets, with visual relationships shown through 3D nodes and links.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Tech Stack
- **Build Tool**: Vite with SWC for fast React refresh
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 (using @tailwindcss/vite plugin)
- **3D Visualization**: react-force-graph-3d + Three.js
- **UI Components**: Radix UI primitives with custom wrappers
- **Utilities**: class-variance-authority, clsx, tailwind-merge for class composition

### Project Structure

```
src/
├── features/          # Feature-based modules
│   ├── ui/           # UI shell components (Topbar, Sidebar, Inspector)
│   └── universe/     # 3D graph visualization logic
├── components/ui/    # Reusable UI primitives (shadcn-style)
└── lib/              # Shared utilities (cn helper)
```

### Key Architectural Patterns

**Feature-based Organization**: The codebase uses a feature-driven structure. The `features/` directory contains self-contained modules with their own components, logic, and styles. Each feature (e.g., `universe`, `ui`) owns its domain.

**Universe Graph Data Model**: The 3D visualization uses a hierarchical node system:
- Level 0: Root nodes (white, largest)
- Level 1: Galaxy nodes (purple)
- Level 2: Nebula nodes (cyan)
- Level 3: Star nodes (amber)
- Level 4: Planet nodes (green)

Each node has metadata including `id`, `label`, `level`, `val` (size), position (`x`, `y`, `z`), and `grouping` (semantic/category/POS data). Links connect nodes with types: `hierarchy` (parent-child) or `semantic` (related concepts).

**Performance Optimizations**: The UniverseView component caches Three.js geometries and materials using useRef Maps to avoid recreating objects on every render (see src/features/universe/UniverseView.tsx:15-43).

**Component Composition**: UI components follow the shadcn/ui pattern - components in `src/components/ui/` are self-contained primitives built on Radix UI, using CVA (class-variance-authority) for variant styling and the `cn()` utility for class merging.

### Development Guidelines

**Use Existing UI Components**: When adding new UI elements, always check if a suitable component exists in `src/components/ui/` or can be added from the shadcn/ui library first. Do not reinvent common UI patterns (buttons, cards, dialogs, forms, etc.) - leverage the existing component system built on Radix UI primitives. Add new shadcn/ui components as needed rather than creating custom implementations.

### Path Aliases

The project uses `@/*` aliases that resolve to `./src/*`:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

### Styling Approach

- **Tailwind v4**: This project uses Tailwind CSS v4 with the new Vite plugin
- **CSS Files**: Feature-specific styles live alongside components (e.g., `universe.css`, `ui.css`)
- **Class Helper**: Use `cn()` from `@/lib/utils` to merge Tailwind classes with proper precedence

### Current State

The application is in early development with:
- Mock data generation in `src/features/universe/mock.ts`
- Basic UI shell with Topbar, Sidebar, and Inspector panels
- Interactive 3D graph with node selection and stats display
- No backend integration yet (all data is client-side generated)
