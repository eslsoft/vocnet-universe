import type { UniverseNode, UniverseLink, LinkSourceTarget } from "@/types/universe"

/** Extract node ID from a d3-force link endpoint (string before resolve, object after) */
export function linkId(endpoint: LinkSourceTarget): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id
}

/** Build O(1) lookup map from node array */
export function buildNodeMap(nodes: UniverseNode[]): Map<string, UniverseNode> {
  const map = new Map<string, UniverseNode>()
  for (const n of nodes) map.set(n.id, n)
  return map
}

/** Build adjacency map: nodeId → Set of links touching that node */
export function buildAdjacencyMap(
  nodeMap: Map<string, UniverseNode>,
  links: UniverseLink[],
): Map<string, Set<UniverseLink>> {
  const map = new Map<string, Set<UniverseLink>>()
  for (const [id] of nodeMap) map.set(id, new Set())
  for (const l of links) {
    const s = linkId(l.source as LinkSourceTarget)
    const t = linkId(l.target as LinkSourceTarget)
    map.get(s)?.add(l)
    map.get(t)?.add(l)
  }
  return map
}
