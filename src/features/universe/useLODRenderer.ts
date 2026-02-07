/**
 * LOD (Level of Detail) Renderer - SMOOTH VERSION 2.0
 * Fixes:
 * 1. Material Sharing Bug (No more global opacity interference)
 * 2. Independent Materials per Node (Correct Alpha Fading)
 * 3. Frustum Culling & Depth Sorting (No more disappearance at angles)
 */

import { useCallback, useRef, useEffect } from "react"
import * as THREE from "three"
import type { CelestialNode } from "@/types/universe"
import type { ForceGraphMethods } from "react-force-graph-3d"

// Shared geometries (High performance)
const SPHERE_GEO = new THREE.SphereGeometry(1, 16, 16)
const GLOW_GEO = new THREE.SphereGeometry(1.2, 16, 16)
const RING_GEO = new THREE.TorusGeometry(1.05, 0.02, 12, 48)

const FADE_CONFIG = {
  LABEL_START: 1200,
  LABEL_END: 2000,
  PLANET_START: 2000,
  PLANET_END: 3500,
  STAR_POINT_START: 3500,
  STAR_POINT_END: 6000,
}

export function useLODRenderer(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  selectedId: string | null,
  neighborIds: Set<string>
) {
  const groupsRef = useRef<Map<string, THREE.Group>>(new Map())
  const nodeDataRef = useRef<Map<string, CelestialNode>>(new Map())
  
  // Work slicing state
  const nodeIdsRef = useRef<string[]>([])
  const sliceIndexRef = useRef(0)
  const SLICE_SIZE = 1000

  // Label Sprite Helper
  const createLabelSprite = useCallback((text: string, scale: number) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const fontSize = 48
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    const width = ctx.measureText(text).width + 50
    canvas.width = width
    canvas.height = fontSize + 40
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)"
    ctx.roundRect(0, 0, width, canvas.height, 12)
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(text, width / 2, canvas.height / 2)
    
    const texture = new THREE.CanvasTexture(canvas)
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
      map: texture, 
      depthTest: false,
      transparent: true,
      opacity: 0
    }))
    sprite.scale.set((width / 18) * scale, (canvas.height / 18) * scale, 1)
    sprite.renderOrder = 1000
    sprite.name = "label"
    return sprite
  }, [])

  // Initialize a node's group with UNIQUE materials
  const initNodeGroup = useCallback((id: string) => {
    const n = nodeDataRef.current.get(id)
    if (!n) return null
    
    const group = new THREE.Group()
    group.frustumCulled = false

    const isStar = n.celestialType === "supergiant" || n.celestialType === "giant" || n.celestialType === "main_sequence"

    // 1. UNIQUE Body Material (Crucial for independent fading)
    const bodyMat = new THREE.MeshPhongMaterial({
      color: n.color,
      transparent: true,
      opacity: 1,
      emissive: isStar ? n.color : "#000000",
      emissiveIntensity: isStar ? 0.5 : 0,
      shininess: isStar ? 80 : 40,
    })
    
    const mesh = new THREE.Mesh(SPHERE_GEO, bodyMat)
    mesh.scale.setScalar(n.radius)
    mesh.name = "body"
    mesh.frustumCulled = false
    group.add(mesh)

    // 2. Glow (Stars only)
    if (isStar) {
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: n.color, 
        transparent: true, 
        opacity: 0, 
        blending: THREE.AdditiveBlending,
        depthWrite: false 
      })
      const glow = new THREE.Mesh(GLOW_GEO, glowMat)
      glow.scale.setScalar(n.radius)
      glow.name = "glow"
      glow.frustumCulled = false
      group.add(glow)
    }

    // 3. Selection Ring
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: "#ffffff", 
      transparent: true, 
      opacity: 0, 
      depthWrite: false 
    })
    const ring = new THREE.Mesh(RING_GEO, ringMat)
    ring.scale.setScalar(n.radius)
    ring.name = "selectionRing"
    ring.frustumCulled = false
    group.add(ring)

    // 4. Label
    const label = createLabelSprite(n.word, n.radius / 25 + 1.2)
    label.position.set(0, n.radius + 15, 0)
    group.add(label)

    groupsRef.current.set(id, group)
    return group
  }, [createLabelSprite])

  const updateNodeAttributes = useCallback((id: string, camPos: THREE.Vector3, selId: string | null, neighbors: Set<string>) => {
    const group = groupsRef.current.get(id)
    const n = nodeDataRef.current.get(id)
    if (!group || !n) return

    const dx = (n.x || 0) - camPos.x
    const dy = (n.y || 0) - camPos.y
    const dz = (n.z || 0) - camPos.z
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)

    const isSelected = selId === id
    const isNeighbor = neighbors.has(id)
    const isStar = n.celestialType === "supergiant" || n.celestialType === "giant" || n.celestialType === "main_sequence"

    // 1. Label Opacity
    let labelOpacity = 0
    if (isSelected || isNeighbor) {
      labelOpacity = 1
    } else {
      labelOpacity = THREE.MathUtils.clamp(1 - (dist - FADE_CONFIG.LABEL_START) / (FADE_CONFIG.LABEL_END - FADE_CONFIG.LABEL_START), 0, 1)
      if (dist > 800 && n.celestialType !== "supergiant" && n.celestialType !== "giant") labelOpacity = 0
    }

    // 2. Body Opacity
    let bodyOpacity = 1
    if (!isStar && !isSelected && !isNeighbor) {
      bodyOpacity = THREE.MathUtils.clamp(1 - (dist - FADE_CONFIG.PLANET_START) / (FADE_CONFIG.PLANET_END - FADE_CONFIG.PLANET_START), 0, 1)
    }

    // 3. Scale Mult (For stars distance transition)
    let scaleMult = 1
    if (isStar && dist > FADE_CONFIG.STAR_POINT_START && !isSelected) {
      scaleMult = THREE.MathUtils.lerp(1, 0.4, THREE.MathUtils.clamp((dist - FADE_CONFIG.STAR_POINT_START) / 2000, 0, 1))
    }

    group.visible = bodyOpacity > 0 || isStar || isSelected || isNeighbor
    
    // Efficient property assignment
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i] as any
      if (child.name === "body") {
        child.material.opacity = bodyOpacity
        child.scale.setScalar(n.radius * scaleMult)
      } else if (child.name === "label") {
        child.material.opacity = labelOpacity
        child.visible = labelOpacity > 0
      } else if (child.name === "glow") {
        const glowAlpha = isStar ? THREE.MathUtils.clamp(1 - dist / 2000, 0, 0.25) : 0
        child.material.opacity = glowAlpha
        child.visible = glowAlpha > 0
      } else if (child.name === "selectionRing") {
        const ringAlpha = isSelected ? 0.8 : 0
        child.material.opacity = ringAlpha
        child.visible = ringAlpha > 0
      }
    }
  }, [])

  // Optimized Loop
  useEffect(() => {
    let rafId: number
    const updateSlice = () => {
      if (!graphRef.current) { rafId = requestAnimationFrame(updateSlice); return }
      const camera = graphRef.current.camera()
      if (!camera) { rafId = requestAnimationFrame(updateSlice); return }

      const camPos = camera.position
      const ids = nodeIdsRef.current
      const start = sliceIndexRef.current
      const end = Math.min(start + SLICE_SIZE, ids.length)

      for (let i = start; i < end; i++) {
        updateNodeAttributes(ids[i], camPos, selectedId, neighborIds)
      }

      sliceIndexRef.current = end >= ids.length ? 0 : end
      rafId = requestAnimationFrame(updateSlice)
    }
    rafId = requestAnimationFrame(updateSlice)
    return () => cancelAnimationFrame(rafId)
  }, [selectedId, neighborIds, updateNodeAttributes, graphRef])

  // Selection change handling
  useEffect(() => {
    if (!graphRef.current) return
    const camera = graphRef.current.camera()
    if (!camera) return
    const camPos = camera.position
    // Force instant update for all nodes to catch neighbors
    nodeIdsRef.current.forEach(id => {
      updateNodeAttributes(id, camPos, selectedId, neighborIds)
    })
    sliceIndexRef.current = 0
  }, [selectedId, neighborIds, updateNodeAttributes, graphRef])

  const nodeThreeObject = useCallback((node: any) => {
    const n = node as CelestialNode
    if (!nodeDataRef.current.has(n.id)) {
      nodeDataRef.current.set(n.id, n)
      nodeIdsRef.current.push(n.id)
    } else {
      const existing = nodeDataRef.current.get(n.id)!
      existing.x = n.x; existing.y = n.y; existing.z = n.z
    }
    let group = groupsRef.current.get(n.id)
    if (!group) group = initNodeGroup(n.id)!
    return group
  }, [initNodeGroup])

  return nodeThreeObject
}
