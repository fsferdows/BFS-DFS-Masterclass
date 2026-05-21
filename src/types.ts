/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface SimStep {
  visited: string[];
  frontier: string[];
  activeNode: string | null;
  edgesTraversed: [string, string][]; // Edges in the current forest/tree
  log: string;
  conceptTitle?: string;
  conceptExplanation?: string;
  academicProofContext?: string;
  accumulatedCost?: number;
  neuralLoadPercent?: number;
  depthLimit?: number;
  frontierWithCosts?: { node: string; priority: number; path: string[] }[];
  activePath?: string[];
}

export type SimType = 'BFS' | 'DFS' | 'IDS' | 'UCS';

export interface GridCell {
  row: number;
  col: number;
  type: 'empty' | 'wall' | 'start' | 'target' | 'visited' | 'frontier' | 'path';
}
