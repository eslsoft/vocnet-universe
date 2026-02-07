import * as d3 from 'd3-force';

declare module 'd3-force-3d' {
  export interface SimulationNodeDatum extends d3.SimulationNodeDatum {
    z?: number;
    vz?: number;
    fz?: number;
  }

  export interface SimulationLinkDatum<Node extends SimulationNodeDatum> extends d3.SimulationLinkDatum<Node> {}

  // 必须包含调用签名以符合 react-force-graph 的 ForceFn 要求
  export interface ForceZ<Node extends SimulationNodeDatum> {
    (alpha: number): void;
    initialize?(nodes: Node[]): void;
    strength(strength: number | ((node: Node) => number)): this;
    z(z: number | ((node: Node) => number)): this;
  }

  // 确保所有 3D 工厂函数返回的类型都包含必要的调用签名
  export function forceLink<Node extends SimulationNodeDatum, Link extends SimulationLinkDatum<Node>>(links?: Link[]): d3.ForceLink<Node, Link>;
  export function forceManyBody<Node extends SimulationNodeDatum>(): d3.ForceManyBody<Node>;
  export function forceX<Node extends SimulationNodeDatum>(x?: number | ((node: Node) => number)): d3.ForceX<Node>;
  export function forceY<Node extends SimulationNodeDatum>(y?: number | ((node: Node) => number)): d3.ForceY<Node>;
  export function forceCollide<Node extends SimulationNodeDatum>(radius?: number | ((node: Node) => number)): d3.ForceCollide<Node>;
  export function forceZ<Node extends SimulationNodeDatum>(z?: number | ((node: Node) => number)): ForceZ<Node>;
}
