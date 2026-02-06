import { useEffect, useRef } from "react"
import type { ForceGraphMethods } from "react-force-graph-3d"

/**
 * Zero-React-render zoom tracking.
 * Writes directly to a DOM element via ref — never calls setState.
 */
export function useCameraZoom(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  zoomRef: React.RefObject<HTMLSpanElement | null>,
) {
  const lastValue = useRef("")

  useEffect(() => {
    let animId: number
    const tick = () => {
      const fg = graphRef.current
      if (fg) {
        const cam = fg.camera()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const controls = fg.controls() as any
        if (controls?.target) {
          const d = cam.position.distanceTo(controls.target)
          const pct = Math.max(10, Math.min(2000, Math.round((2500 / d) * 100)))
          const text = `${pct}%`
          if (text !== lastValue.current) {
            lastValue.current = text
            if (zoomRef.current) zoomRef.current.textContent = text
          }
        }
      }
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [graphRef, zoomRef])
}
