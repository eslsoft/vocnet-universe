import { useCallback, useRef, useEffect } from "react"
import * as THREE from "three"
import type { UniverseNode, UniverseSchema } from "@/types/universe"
import { resolveNodeColor } from "./config"

// Module-level shared geometries (never recreated)
const SPHERE_GEO = new THREE.SphereGeometry(1, 24, 24)
const HALO_GEO = new THREE.SphereGeometry(1.15, 24, 24)
const RING_GEO = new THREE.TorusGeometry(1.05, 0.02, 16, 64)

type CachedEntry = {
  group: THREE.Group
  stateKey: string
}

function makeStateKey(nodeId: string, selectedId: string | null, dist: number | undefined): string {
  const sel = selectedId === nodeId ? "S" : dist === 1 ? "N" : "O"
  return `${nodeId}:${sel}:${selectedId ?? "-"}`
}

function disposeSpriteTextures(group: THREE.Group) {
  group.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Sprite) {
      child.material.map?.dispose()
      child.material.dispose()
    }
  })
}

export function useNodeRenderer(
  schema: UniverseSchema | undefined,
  selectedId: string | null,
  distanceMap: Map<string, number> | null,
) {
  const cache = useRef<Map<string, CachedEntry>>(new Map())
  const materialCache = useRef<Map<string, THREE.MeshPhongMaterial>>(new Map())
  const prevSelectedId = useRef<string | null>(null)

  // Clear cache when selection changes
  useEffect(() => {
    if (prevSelectedId.current !== selectedId) {
      for (const [, entry] of cache.current) {
        disposeSpriteTextures(entry.group)
      }
      cache.current.clear()
      prevSelectedId.current = selectedId
    }
  }, [selectedId])

  const getMaterial = useCallback((color: string, opacity = 1) => {
    const key = `${color}:${opacity}`
    let mat = materialCache.current.get(key)
    if (!mat) {
      mat = new THREE.MeshPhongMaterial({
        color, transparent: opacity < 1, opacity,
        emissive: color, emissiveIntensity: 0.3, shininess: 50,
      })
      materialCache.current.set(key, mat)
    }
    return mat
  }, [])

  const createLabelSprite = useCallback((text: string, scale: number, isSelected: boolean) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const fontSize = 48
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    const width = ctx.measureText(text).width + 50
    canvas.width = width
    canvas.height = fontSize + 40
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    ctx.fillStyle = isSelected ? "rgba(244, 63, 94, 0.95)" : "rgba(15, 23, 42, 0.85)"
    ctx.roundRect(0, 0, width, canvas.height, 12)
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(text, width / 2, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas)
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
    sprite.scale.set(width / 18 * scale, canvas.height / 18 * scale, 1)
    sprite.renderOrder = 999
    return sprite
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeThreeObject = useCallback((node: any) => {
    const n = node as UniverseNode
    const isSelected = selectedId === n.id
    const dist = distanceMap?.get(n.id)
    const stateKey = makeStateKey(n.id, selectedId, dist)

    // Return cached group if visual state unchanged
    const cached = cache.current.get(n.id)
    if (cached && cached.stateKey === stateKey) return cached.group

    // Dispose old sprites before rebuilding
    if (cached) disposeSpriteTextures(cached.group)

    const baseRadius = Math.max(12, (n.val || 10) * 1.5)
    const radius = (isSelected && n.level <= 1) ? baseRadius * 0.6 : baseRadius
    const color = resolveNodeColor(schema, n.level)

    const mesh = new THREE.Mesh(SPHERE_GEO, getMaterial(color, 0.9))
    mesh.scale.setScalar(radius)

    const group = new THREE.Group()
    group.add(mesh)

    if (isSelected) {
      const halo = new THREE.Mesh(HALO_GEO, getMaterial("#ffffff", 0.15))
      halo.scale.setScalar(radius)
      group.add(halo)

      const ring = new THREE.Mesh(RING_GEO, getMaterial("#ffffff", 0.8))
      ring.scale.setScalar(radius)
      group.add(ring)
    }

    if (isSelected || dist === 1 || (!selectedId && n.level <= 2)) {
      const labelScale = (radius / 25 + 1.2) * (isSelected ? 1.1 : 1)
      const label = createLabelSprite(n.label, labelScale, isSelected)
      label.position.set(0, radius + 20, 0)
      group.add(label)
    }

    cache.current.set(n.id, { group, stateKey })
    return group
  }, [schema, selectedId, distanceMap, getMaterial, createLabelSprite])

  return nodeThreeObject
}
