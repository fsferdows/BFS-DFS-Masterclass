import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Info, Settings, HelpCircle, CheckCircle, Network, Cpu, Database, Award, ArrowUpRight } from 'lucide-react';
import { SimStep, SimType } from '../types';

// Graph Node definitions
interface NodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  complexity: string;
  role: string;
}

interface EdgeDef {
  source: string;
  target: string;
  cost: number;
  label?: string;
}

// 1. FAANG Tree/Canonical graph
const CANONICAL_NODES: NodeDef[] = [
  { id: 'A', label: 'A', x: 220, y: 55, complexity: 'O(1) Root', role: 'Main Entry Point' },
  { id: 'B', label: 'B', x: 110, y: 135, complexity: 'O(b)', role: 'Left Subtree Root' },
  { id: 'C', label: 'C', x: 330, y: 135, complexity: 'O(b)', role: 'Right Subtree Root' },
  { id: 'D', label: 'D', x: 60, y: 225, complexity: 'O(b²)', role: 'Left Leaf' },
  { id: 'E', label: 'E', x: 170, y: 225, complexity: 'O(b²)', role: 'Inner Left Node' },
  { id: 'F', label: 'F', x: 270, y: 225, complexity: 'O(b²)', role: 'Inner Right Node' },
  { id: 'G', label: 'G', x: 380, y: 225, complexity: 'O(b²)', role: 'Right Leaf' },
  { id: 'H', label: 'H', x: 220, y: 315, complexity: 'O(b³)', role: 'Merge Connector' },
];

const CANONICAL_ADJACENCY: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: ['F', 'G'],
  D: ['H'],
  E: ['H'],
  F: ['H'],
  G: [],
  H: [],
};

const CANONICAL_EDGES: EdgeDef[] = [
  { source: 'A', target: 'B', cost: 1, label: 'Unit' },
  { source: 'A', target: 'C', cost: 1, label: 'Unit' },
  { source: 'B', target: 'D', cost: 1, label: 'Unit' },
  { source: 'B', target: 'E', cost: 1, label: 'Unit' },
  { source: 'C', target: 'F', cost: 1, label: 'Unit' },
  { source: 'C', target: 'G', cost: 1, label: 'Unit' },
  { source: 'D', target: 'H', cost: 1, label: 'Unit' },
  { source: 'E', target: 'H', cost: 1, label: 'Unit' },
  { source: 'F', target: 'H', cost: 1, label: 'Unit' },
];

// 2. Specialized Cyber Neural Mesh graph (from user prompt)
const NEURAL_NODES: NodeDef[] = [
  { id: 'Core_AI', label: 'Core_AI', x: 70, y: 180, complexity: 'O(1) Source', role: 'Unified AI Core' },
  { id: 'Vision_Yolo', label: 'Vision_Yolo', x: 200, y: 80, complexity: 'O(b) High Load', role: 'Edge Object Detection' },
  { id: 'Biometric_UI', label: 'Biometric_UI', x: 200, y: 280, complexity: 'O(b) Direct', role: 'Biometric Haptic Interface' },
  { id: 'Synapse_Gate', label: 'Synapse_Gate', x: 320, y: 180, complexity: 'O(b²) Transit', role: 'Autonomous Routing Gateway' },
  { id: 'Telemetry_DB', label: 'Telemetry_DB', x: 415, y: 180, complexity: 'O(b³) Sink', role: 'Encrypted Persistence Log' },
];

const NEURAL_ADJACENCY: Record<string, string[]> = {
  Core_AI: ['Vision_Yolo', 'Biometric_UI'],
  Vision_Yolo: ['Synapse_Gate'],
  Biometric_UI: ['Synapse_Gate'],
  Synapse_Gate: ['Telemetry_DB'],
  Telemetry_DB: [],
};

const NEURAL_EDGES: EdgeDef[] = [
  { source: 'Core_AI', target: 'Vision_Yolo', cost: 2, label: 'Low Latency (2ms)' },
  { source: 'Core_AI', target: 'Biometric_UI', cost: 5, label: 'Encrypted Tunnel (5ms)' },
  { source: 'Vision_Yolo', target: 'Synapse_Gate', cost: 10, label: 'High Load (10ms)' },
  { source: 'Biometric_UI', target: 'Synapse_Gate', cost: 1, label: 'Direct Sync (1ms)' },
  { source: 'Synapse_Gate', target: 'Telemetry_DB', cost: 3, label: 'Data Stream (3ms)' },
];

// ----------------------------------------------------
// BFS Traversal Step Generator
// ----------------------------------------------------
function generateBfsSteps(
  start: string,
  target: string,
  nodes: NodeDef[],
  adjacency: Record<string, string[]>,
  edges: EdgeDef[]
): SimStep[] {
  const steps: SimStep[] = [];
  const visited: string[] = [];
  const queue: string[] = [start];
  const edgesTraversed: [string, string][] = [];
  const visitedSet = new Set<string>();
  visitedSet.add(start);

  const getEdgeCost = (s: string, t: string) => {
    const edge = edges.find(e => (e.source === s && e.target === t) || (e.source === t && e.target === s));
    return edge?.cost ?? 1;
  };

  const getPathCost = (path: string[]) => {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      cost += getEdgeCost(path[i], path[i+1]);
    }
    return cost;
  };

  const nodeParents: Record<string, string> = {};

  steps.push({
    visited: [],
    frontier: [...queue],
    activeNode: null,
    edgesTraversed: [],
    log: `Starting Breadth-First Search (BFS) from root [${start}] to target [${target}].`,
    conceptTitle: 'Queue Initialized',
    conceptExplanation: `BFS starts by inserting the root start node [${start}] into a FIFO (First-In-First-Out) Queue. The Cyan indicator highlights the start boundaries.`,
    academicProofContext: 'Completeness Proof: By verifying level d before level d+1, BFS ensures complete coverage across expanding horizontal frontiers.',
    accumulatedCost: 0,
    neuralLoadPercent: 12
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.push(current);

    // Dynamic path backtracking to calculate exact accumulated cost
    const path: string[] = [current];
    let temp = current;
    while (nodeParents[temp]) {
      path.unshift(nodeParents[temp]);
      temp = nodeParents[temp];
    }
    const currentCost = getPathCost(path);
    const mockLoad = Math.min(100, Math.round(25 + visited.length * 15));

    steps.push({
      visited: [...visited],
      frontier: [...queue],
      activeNode: current,
      edgesTraversed: [...edgesTraversed],
      log: `Dequeued current active node: [${current}]. Queue content: [${queue.join(', ')}]. Checking neighbors.`,
      conceptTitle: 'FIFO Dequeue Action',
      conceptExplanation: `The first element of the Queue is extracted. BFS prioritizes horizontal breadth before looking at deeper nodes. Path trace so far: ${path.join(' → ')}.`,
      academicProofContext: 'Optimality Proof: In unit-cost domains, BFS guarantees that the first time a state is expanded, the associated depth is strictly minimal.',
      accumulatedCost: currentCost,
      neuralLoadPercent: mockLoad
    });

    if (current === target) {
      steps.push({
        visited: [...visited],
        frontier: [...queue],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Target node [${current}] LOCATED! BFS terminated successfully. Optimal Shortest Hop Path: [${path.join(' → ')}].`,
        conceptTitle: 'Target Identified!',
        conceptExplanation: `Target [${current}] popped. Complete path: ${path.join(' → ')}. BFS finishes immediately without expanding remaining nodes.`,
        academicProofContext: `Complexity Summary: Solved at limit depth d = ${path.length - 1}. Time complexity: O(bᵈ).`,
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
      return steps;
    }

    const neighbors = adjacency[current] || [];
    const addedNeighbors: string[] = [];

    for (const neighbor of neighbors) {
      if (!visitedSet.has(neighbor)) {
        visitedSet.add(neighbor);
        queue.push(neighbor);
        nodeParents[neighbor] = current;
        addedNeighbors.push(neighbor);
        edgesTraversed.push([current, neighbor]);
      }
    }

    if (addedNeighbors.length > 0) {
      steps.push({
        visited: [...visited],
        frontier: [...queue],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Appended unvisited child nodes of [${current}] to the back of Queue: [${addedNeighbors.join(', ')}].`,
        conceptTitle: 'Frontier Extension',
        conceptExplanation: `BFS enqueues unvisited neighbors [${addedNeighbors.join(', ')}] to the rear of the Queue. They will be processed after current tier nodes are fully exhausted.`,
        academicProofContext: `Space Bound Divergence: The queue growth mirrors the exponential boundary size expansion O(bᵈ).`,
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
    } else {
      steps.push({
        visited: [...visited],
        frontier: [...queue],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Search leaf checked at [${current}]. No new unvisited neighbors detected.`,
        conceptTitle: 'Terminal Leaf Reached',
        conceptExplanation: `All outgoing edges from [${current}] lead to nodes that have already been discovered on high tiers. Checking next queue element.`,
        academicProofContext: 'Visited lookup hashes bypass redundant checks, allowing rapid O(1) membership operations.',
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
    }
  }

  steps.push({
    visited: [...visited],
    frontier: [],
    activeNode: null,
    edgesTraversed: [...edgesTraversed],
    log: `Search Queue exhausted. Target [${target}] is unreachable from root [${start}].`,
    conceptTitle: 'Search Terminated',
    conceptExplanation: 'Queue is empty. Traversal of the connected graph component is fully complete, but target wasn\'t recovered.',
    academicProofContext: 'BFS is complete on finite structures; therefore, no valid path physically exists.',
    accumulatedCost: 0,
    neuralLoadPercent: 100
  });

  return steps;
}

// ----------------------------------------------------
// DFS Traversal Step Generator
// ----------------------------------------------------
function generateDfsSteps(
  start: string,
  target: string,
  nodes: NodeDef[],
  adjacency: Record<string, string[]>,
  edges: EdgeDef[]
): SimStep[] {
  const steps: SimStep[] = [];
  const visited: string[] = [];
  const stack: string[] = [start];
  const edgesTraversed: [string, string][] = [];
  const visitedSet = new Set<string>();

  const getEdgeCost = (s: string, t: string) => {
    const edge = edges.find(e => (e.source === s && e.target === t) || (e.source === t && e.target === s));
    return edge?.cost ?? 1;
  };

  const getPathCost = (path: string[]) => {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      cost += getEdgeCost(path[i], path[i+1]);
    }
    return cost;
  };

  const nodeParents: Record<string, string> = {};

  steps.push({
    visited: [],
    frontier: [...stack],
    activeNode: null,
    edgesTraversed: [],
    log: `Starting Depth-First Search (DFS) from [${start}] to target [${target}].`,
    conceptTitle: 'Stack Initialized',
    conceptExplanation: `DFS boots with a LIFO (Last-In-First-Out) Stack. Purple highlighted nodes represent stack items. Standard DFS plunges vertically down the tree first.`,
    academicProofContext: 'Space Bounds advantages: DFS only holds nodes on the current pathway, preserving highly memory-efficient O(b * d) limits.',
    accumulatedCost: 0,
    neuralLoadPercent: 12
  });

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (visitedSet.has(current)) {
      steps.push({
        visited: [...visited],
        frontier: [...stack],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Popped node [${current}] but discarded because it was already expanded.`,
        conceptTitle: 'Self-Loop Pruning',
        conceptExplanation: `We popped [${current}], but skipped processing because we have previously visited this node. This prevents infinite cyclical trapping.`,
        academicProofContext: 'Standard Cycle Pruning: Maintaining high integrity check safeguards DFS from deadlocks on cyclic loops.',
        accumulatedCost: 0,
        neuralLoadPercent: Math.min(100, 20 + visited.length * 10)
      });
      continue;
    }

    visitedSet.add(current);
    visited.push(current);

    // Backtrack path representation
    const path: string[] = [current];
    let temp = current;
    while (nodeParents[temp]) {
      path.unshift(nodeParents[temp]);
      temp = nodeParents[temp];
    }
    const currentCost = getPathCost(path);
    const mockLoad = Math.min(100, Math.round(25 + visited.length * 15));

    steps.push({
      visited: [...visited],
      frontier: [...stack],
      activeNode: current,
      edgesTraversed: [...edgesTraversed],
      log: `Popped and processed node: [${current}]. Visited sequence: [${visited.join(' → ')}].`,
      conceptTitle: 'LIFO Stack Pop',
      conceptExplanation: `Popped active node [${current}]. Visited array is appended. DFS will instantly check neighbors and push them to the stack for deep descent.`,
      academicProofContext: 'Non-Optimality Check: Because DFS moves greedily, it can easily record exceptionally long paths while skipping shorter ones.',
      accumulatedCost: currentCost,
      neuralLoadPercent: mockLoad
    });

    if (current === target) {
      steps.push({
        visited: [...visited],
        frontier: [...stack],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Target node [${current}] LOCATED! DFS terminated. Found path cost: ${currentCost}. Trace: [${path.join(' → ')}].`,
        conceptTitle: 'Target Found!',
        conceptExplanation: `Target [${current}] recovered! Path found: ${path.join(' → ')}. Note that DFS paths are generally sub-optimal in graph setups.`,
        academicProofContext: 'Optimal = NO; Complete = YES (only on finite graph structures).',
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
      return steps;
    }

    const neighbors = adjacency[current] || [];
    const validNeighbors = neighbors.filter(n => !visitedSet.has(n));

    if (validNeighbors.length > 0) {
      // Push neighbors in reverse order so the leftmost is evaluated first
      for (let i = validNeighbors.length - 1; i >= 0; i--) {
        const neighbor = validNeighbors[i];
        stack.push(neighbor);
        nodeParents[neighbor] = current;
        edgesTraversed.push([current, neighbor]);
      }

      steps.push({
        visited: [...visited],
        frontier: [...stack],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Pushed unvisited children of [${current}] to Stack: [${validNeighbors.join(', ')}].`,
        conceptTitle: 'Stack Push Descent',
        conceptExplanation: `Unvisited elements [${validNeighbors.join(', ')}] are pushed onto the Stack. Leftmost node stays on top, guaranteeing left-to-right tree plunge.`,
        academicProofContext: 'Traversal Sequence: Reversing adjacency arrays dynamically ensures canonical left-to-right deep search.',
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
    } else {
      steps.push({
        visited: [...visited],
        frontier: [...stack],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `No unvisited neighbors at [${current}]. Backtracking to previous ancestor state.`,
        conceptTitle: 'Backtracking Engaged',
        conceptExplanation: `Node [${current}] is a dead end. DFS recedes back up the call branch to explore other pending stacks.`,
        academicProofContext: 'Backtracking occurs organically by popping the next ready node from the LIFO frame.',
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad
      });
    }
  }

  steps.push({
    visited: [...visited],
    frontier: [],
    activeNode: null,
    edgesTraversed: [...edgesTraversed],
    log: `All paths checked. Stack emptied, goal [${target}] is unreachable.`,
    conceptTitle: 'DFS Finished',
    conceptExplanation: 'Stack spent without success. DFS exploration complete.',
    academicProofContext: 'Target is completely disconnected from start root.',
    accumulatedCost: 0,
    neuralLoadPercent: 100
  });

  return steps;
}

// ----------------------------------------------------
// IDS (Iterative Deepening Search) Step Generator
// ----------------------------------------------------
function generateIdsSteps(
  start: string,
  target: string,
  nodes: NodeDef[],
  adjacency: Record<string, string[]>,
  edges: EdgeDef[]
): SimStep[] {
  const steps: SimStep[] = [];
  const overallVisited: string[] = [];
  const edgesTraversed: [string, string][] = [];

  const getEdgeCost = (s: string, t: string) => {
    const edge = edges.find(e => (e.source === s && e.target === t) || (e.source === t && e.target === s));
    return edge?.cost ?? 1;
  };

  const getPathCost = (path: string[]) => {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      cost += getEdgeCost(path[i], path[i+1]);
    }
    return cost;
  };

  steps.push({
    visited: [],
    frontier: [start],
    activeNode: null,
    edgesTraversed: [],
    log: `Booting Iterative Deepening Search (IDS) from [${start}] to [${target}].`,
    conceptTitle: 'IDS Engine Boot',
    conceptExplanation: 'IDS performs repeated depth-limited DFS searches, starting from Depth limit 0, incrementing limit by 1 on each pass.',
    academicProofContext: 'The Space-Time Compromise: Achieves BFS hop-optimality with DFS linear O(b * d) space bounds.',
    accumulatedCost: 0,
    neuralLoadPercent: 10
  });

  // Iterating through depth limits 0 to 4
  for (let limit = 0; limit <= 4; limit++) {
    const dlsVisitedSet = new Set<string>();
    const pathStack: { node: string; depth: number; path: string[] }[] = [
      { node: start, depth: 0, path: [start] }
    ];

    steps.push({
      visited: [...overallVisited],
      frontier: [start],
      activeNode: null,
      edgesTraversed: [...edgesTraversed],
      log: `Restarting Search: Executing Depth-Limited DFS (DLS) with Max Depth Limit = ${limit}.`,
      conceptTitle: `DLS Pass limit: ${limit}`,
      conceptExplanation: `IDS initiates a new depth-bounded search tree. All nodes deeper than Level ${limit} will be entirely pruned.`,
      academicProofContext: `Iterative Overhead: While roots are processed repeatedly, the massive branching leaves at bottom layers dwarf previous repeats.`,
      accumulatedCost: 0,
      neuralLoadPercent: Math.min(100, 20 + limit * 15),
      depthLimit: limit
    });

    while (pathStack.length > 0) {
      const { node: current, depth: currentDepth, path: currentPath } = pathStack.pop()!;

      if (dlsVisitedSet.has(current)) {
        continue;
      }
      dlsVisitedSet.add(current);
      if (!overallVisited.includes(current)) {
        overallVisited.push(current);
      }

      const activeCost = getPathCost(currentPath);
      const mockLoad = Math.min(100, Math.round(25 + overallVisited.length * 10));

      steps.push({
        visited: [...overallVisited],
        frontier: pathStack.map(item => item.node),
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Popped active node [${current}] at depth ${currentDepth} during Limit ${limit}.`,
        conceptTitle: `DLS exploring: ${current}`,
        conceptExplanation: `Currently inspecting [${current}] at current depth ${currentDepth}. Max depth ceiling is set to ${limit}. Current path: ${currentPath.join(' → ')}.`,
        academicProofContext: `Limiter Rule: If path length === boundary limit ${limit}, offspring creation is halted.`,
        accumulatedCost: activeCost,
        neuralLoadPercent: mockLoad,
        depthLimit: limit
      });

      if (current === target) {
        steps.push({
          visited: [...overallVisited],
          frontier: [],
          activeNode: current,
          edgesTraversed: [...edgesTraversed],
          log: `OPTIMAL GOAL LOCATED AT DEPTH ${limit}! Path: [${currentPath.join(' → ')}]. Optimal Cost = ${activeCost}.`,
          conceptTitle: `Optimal Goal Found at Depth ${limit}!`,
          conceptExplanation: `Target [${current}] identified inside the boundary threshold. Completed optimal step count path: ${currentPath.join(' → ')}.`,
          academicProofContext: 'Optimality Verified: Incremental limit expansion guarantees finding the closest (shortest count) target first.',
          accumulatedCost: activeCost,
          neuralLoadPercent: 100,
          depthLimit: limit
        });
        return steps;
      }

      if (currentDepth < limit) {
        const neighbors = adjacency[current] || [];
        // Reverse push for leftmost processing
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i];
          if (!dlsVisitedSet.has(neighbor)) {
            pathStack.push({
              node: neighbor,
              depth: currentDepth + 1,
              path: [...currentPath, neighbor]
            });
            edgesTraversed.push([current, neighbor]);
          }
        }

        if (neighbors.length > 0) {
          steps.push({
            visited: [...overallVisited],
            frontier: pathStack.map(item => item.node),
            activeNode: current,
            edgesTraversed: [...edgesTraversed],
            log: `Pushed unvisited neighbors of [${current}] to Stack (Depth ${currentDepth + 1} ≤ Limit ${limit}).`,
            conceptTitle: 'Children Expansion (DLS)',
            conceptExplanation: `Since current depth ${currentDepth} < limit ${limit}, it is safe to expand. Adjacent nodes are stacked.`,
            academicProofContext: 'Standard DLS expansion behaves similarly to recursive DFS inside bounded levels.',
            accumulatedCost: activeCost,
            neuralLoadPercent: mockLoad,
            depthLimit: limit
          });
        }
      } else {
        steps.push({
          visited: [...overallVisited],
          frontier: pathStack.map(item => item.node),
          activeNode: current,
          edgesTraversed: [...edgesTraversed],
          log: `Boundary limit reached at [${current}] (Depth of node is ${currentDepth} === Limit ${limit}). Neighbors pruned.`,
          conceptTitle: 'Depth limit Pruning',
          conceptExplanation: `We pruned neighbor branching from [${current}] because DLS restricts searching deeper than Level ${limit}. This keeps space limits O(b * limit).`,
          academicProofContext: 'Linear Space preservation: Truncating deep branches avoids exponential storage expansion.',
          accumulatedCost: activeCost,
          neuralLoadPercent: mockLoad,
          depthLimit: limit
        });
      }
    }
  }

  steps.push({
    visited: [...overallVisited],
    frontier: [],
    activeNode: null,
    edgesTraversed: [...edgesTraversed],
    log: `All DLS levels up to depth 4 finished. Goal [${target}] was not solved in the given boundary.`,
    conceptTitle: 'IDS Limit Exhausted',
    conceptExplanation: 'Traversed limit 0 to 4. Search terminates without finding target.',
    academicProofContext: 'No optimal connection exists within the configured scope.',
    accumulatedCost: 0,
    neuralLoadPercent: 100
  });

  return steps;
}

// ----------------------------------------------------
// UCS (Uniform Cost Search) Step Generator
// ----------------------------------------------------
function generateUcsSteps(
  start: string,
  target: string,
  nodes: NodeDef[],
  adjacency: Record<string, string[]>,
  edges: EdgeDef[]
): SimStep[] {
  const steps: SimStep[] = [];
  const visited: string[] = [];

  // Priority Queue initialization: [{ node, cost, path: [] }]
  let pq: { node: string; cost: number; path: string[] }[] = [
    { node: start, cost: 0, path: [start] }
  ];
  const edgesTraversed: [string, string][] = [];
  const visitedCosts: Record<string, number> = {};

  const getEdgeCost = (s: string, t: string) => {
    const edge = edges.find(e => (e.source === s && e.target === t) || (e.source === t && e.target === s));
    return edge?.cost ?? 1;
  };

  steps.push({
    visited: [],
    frontier: [start],
    activeNode: null,
    edgesTraversed: [],
    log: `Starting Uniform Cost Search (UCS) from [${start}] to target [${target}]. Priority Queue initialized.`,
    conceptTitle: 'Priority Queue Ready',
    conceptExplanation: `UCS/Dijkstra evaluates paths strictly by actual cumulative cost g(n). Start node [${start}] has cost 0.`,
    academicProofContext: 'Optimality and Completeness: Correct Priority Queue arrangement ensures Dijkstra-shortest path solutions.',
    accumulatedCost: 0,
    neuralLoadPercent: 10,
    frontierWithCosts: pq.map(e => ({ node: e.node, priority: e.cost, path: e.path }))
  });

  while (pq.length > 0) {
    // Sort Priority Queue to pop minimum path cost first
    pq.sort((a, b) => a.cost - b.cost);
    const pqContents = pq.map(item => `${item.node}(g=${item.cost})`).join(', ');

    const currentFrame = pq.shift()!;
    const { node: current, cost: currentCost, path: currentPath } = currentFrame;

    // Pruning redundant states with higher cost
    if (visited.includes(current) && visitedCosts[current] <= currentCost) {
      steps.push({
        visited: [...visited],
        frontier: pq.map(item => item.node),
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `PQ popped [${current}] with cost ${currentCost}, but skipped because a cheaper path was previously expanded (Cheaper: ${visitedCosts[current]}).`,
        conceptTitle: 'Stale State Pruned',
        conceptExplanation: `We popped [${current}] (cost: ${currentFrame.cost}) from PQ. However, we have already found a cheaper route to [${current}] previously, so we skip it.`,
        academicProofContext: 'Dijkstra Principle: Duplicate states with higher cumulative costs are discarded immediately.',
        accumulatedCost: visitedCosts[current],
        neuralLoadPercent: Math.min(100, 25 + visited.length * 15),
        frontierWithCosts: pq.map(e => ({ node: e.node, priority: e.cost, path: e.path }))
      });
      continue;
    }

    visited.push(current);
    visitedCosts[current] = currentCost;

    const mockLoad = Math.min(100, Math.round(25 + visited.length * 18));

    steps.push({
      visited: [...visited],
      frontier: pq.map(item => item.node),
      activeNode: current,
      edgesTraversed: [...edgesTraversed],
      log: `Expanded state node [${current}] with minimum cost g(${current}) = ${currentCost}. Priority Queue: [${pqContents}].`,
      conceptTitle: 'Min-Cost state Dequeue',
      conceptExplanation: `UCS pops [${current}] because it has the lowest cumulative path cost of g(n)=${currentCost} from root. Active path: ${currentPath.join(' → ')}.`,
      academicProofContext: 'Weighted Optimality: By popping nodes in cost order, UCS guarantees the first time our target is popped, the path cost is absolutely minimized.',
      accumulatedCost: currentCost,
      neuralLoadPercent: mockLoad,
      frontierWithCosts: pq.map(e => ({ node: e.node, priority: e.cost, path: e.path }))
    });

    if (current === target) {
      steps.push({
        visited: [...visited],
        frontier: [],
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `UCS WEIGHTED OPTIMAL PATH LOCATED! Route: [${currentPath.join(' → ')}] with minimum actual cost of ${currentCost}.`,
        conceptTitle: 'Optimal Target Popped!',
        conceptExplanation: `UCS successfully resolved the optimal path: ${currentPath.join(' → ')}. Path sum weight: ${currentCost}. This avoids sub-optimal hop routes!`,
        academicProofContext: 'Optimality Proof: Every other option remaining in the PQ has cost >= current target cost, validating this as global optimal shortest path.',
        accumulatedCost: currentCost,
        neuralLoadPercent: 100,
        frontierWithCosts: []
      });
      return steps;
    }

    const neighbors = adjacency[current] || [];
    const addedNeighbors: string[] = [];

    for (const neighbor of neighbors) {
      const edgeWeight = getEdgeCost(current, neighbor);
      const cumulativeCostToNeighbor = currentCost + edgeWeight;

      if (!visited.includes(neighbor) || cumulativeCostToNeighbor < visitedCosts[neighbor]) {
        pq.push({
          node: neighbor,
          cost: cumulativeCostToNeighbor,
          path: [...currentPath, neighbor]
        });
        addedNeighbors.push(`${neighbor}(g=${cumulativeCostToNeighbor})`);
        edgesTraversed.push([current, neighbor]);
      }
    }

    if (addedNeighbors.length > 0) {
      pq.sort((a, b) => a.cost - b.cost);
      steps.push({
        visited: [...visited],
        frontier: pq.map(item => item.node),
        activeNode: current,
        edgesTraversed: [...edgesTraversed],
        log: `Discovered and added neighbors of [${current}] with accumulated total cost estimates: [${addedNeighbors.join(', ')}].`,
        conceptTitle: 'PQ Insert & Sort state',
        conceptExplanation: `New potential pathways: [${addedNeighbors.join(', ')}] pushed to the Priority Queue. UCS automatically sorts them by ascending order of g(n).`,
        academicProofContext: 'Heuristics/Cost check: Dijkstra expands strictly outward in concentric contours of equal path cost.',
        accumulatedCost: currentCost,
        neuralLoadPercent: mockLoad,
        frontierWithCosts: pq.map(e => ({ node: e.node, priority: e.cost, path: e.path }))
      });
    }
  }

  steps.push({
    visited: [...visited],
    frontier: [],
    activeNode: null,
    edgesTraversed: [...edgesTraversed],
    log: `Priority Queue depleted. Goal node [${target}] was unreachable from [${start}].`,
    conceptTitle: 'Search Concluded',
    conceptExplanation: 'Queue empty; path search finished without establishing target coordinates.',
    academicProofContext: 'Disconnected network structure.',
    accumulatedCost: 0,
    neuralLoadPercent: 100,
    frontierWithCosts: []
  });

  return steps;
}

// Helper to return beautiful color values based on selected algorithm accents
const getAlgoDetails = (algo: SimType) => {
  switch (algo) {
    case 'BFS':
      return {
        name: 'BFS (Breadth-First)',
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/35',
        buttonClass: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        glowId: 'glow-cyan',
        glowColor: 'rgba(34,211,238,0.65)'
      };
    case 'DFS':
      return {
        name: 'DFS (Depth-First)',
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-500/35',
        buttonClass: 'bg-purple-500 text-slate-950 hover:bg-purple-400 shadow-purple-500/20',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        glowId: 'glow-purple',
        glowColor: 'rgba(192,132,252,0.65)'
      };
    case 'IDS':
      return {
        name: 'IDS (Iterative Deepening)',
        accentColor: 'text-amber-400',
        borderColor: 'border-amber-500/35',
        buttonClass: 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        glowId: 'glow-amber',
        glowColor: 'rgba(251,191,36,0.65)'
      };
    case 'UCS':
      return {
        name: 'UCS (Uniform Cost / Dijkstra)',
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/35',
        buttonClass: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        glowId: 'glow-emerald',
        glowColor: 'rgba(16,185,129,0.65)'
      };
  }
};

export default function AlgorithmSimulator() {
  const [algoType, setAlgoType] = useState<SimType>('UCS');
  const [graphType, setGraphType] = useState<'canonical' | 'neural'>('neural');
  
  // Set default start/target nodes base on chosen graph type
  const [startNode, setStartNode] = useState<string>('Core_AI');
  const [targetNode, setTargetNode] = useState<string>('Telemetry_DB');

  const [steps, setSteps] = useState<SimStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update starting and target nodes when graphType changes
  useEffect(() => {
    if (graphType === 'canonical') {
      setStartNode('A');
      setTargetNode('H');
    } else {
      setStartNode('Core_AI');
      setTargetNode('Telemetry_DB');
    }
  }, [graphType]);

  // Read active graph definitions
  const activeNodes = graphType === 'canonical' ? CANONICAL_NODES : NEURAL_NODES;
  const activeAdjacency = graphType === 'canonical' ? CANONICAL_ADJACENCY : NEURAL_ADJACENCY;
  const activeEdges = graphType === 'canonical' ? CANONICAL_EDGES : NEURAL_EDGES;

  // Generate steps whenever algorithm, startNode, targetNode, or graph bounds change
  useEffect(() => {
    let newSteps: SimStep[] = [];
    if (algoType === 'BFS') {
      newSteps = generateBfsSteps(startNode, targetNode, activeNodes, activeAdjacency, activeEdges);
    } else if (algoType === 'DFS') {
      newSteps = generateDfsSteps(startNode, targetNode, activeNodes, activeAdjacency, activeEdges);
    } else if (algoType === 'IDS') {
      newSteps = generateIdsSteps(startNode, targetNode, activeNodes, activeAdjacency, activeEdges);
    } else if (algoType === 'UCS') {
      newSteps = generateUcsSteps(startNode, targetNode, activeNodes, activeAdjacency, activeEdges);
    }
    setSteps(newSteps);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [algoType, startNode, targetNode, graphType]);

  // Auto Playback logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, steps, playbackSpeed]);

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const currentStep = steps[currentStepIdx] || {
    visited: [],
    frontier: [],
    activeNode: null,
    edgesTraversed: [],
    log: 'Initializing simulation...',
    accumulatedCost: 0,
    neuralLoadPercent: 10
  };

  const details = getAlgoDetails(algoType);

  // Checks if edge is traversed inside steps sequence
  const isEdgeVisited = (source: string, target: string) => {
    return currentStep.edgesTraversed.some(
      ([s, t]) => (s === source && t === target)
    );
  };

  const isEdgeHovered = (source: string, target: string) => {
    return hoveredNodeId === source || hoveredNodeId === target;
  };

  // Node Color state mapper base on exploration classification
  const getNodeColor = (nodeId: string) => {
    const isHovered = hoveredNodeId === nodeId;
    const isVisited = currentStep.visited.includes(nodeId);
    const isFrontier = currentStep.frontier.includes(nodeId);
    const isActive = currentStep.activeNode === nodeId;

    if (isActive) {
      return 'fill-orange-500 stroke-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]';
    }

    switch (algoType) {
      case 'BFS':
        if (isVisited) return isHovered ? 'fill-cyan-400 stroke-white scale-110' : 'fill-cyan-500/95 stroke-cyan-400';
        if (isFrontier) return isHovered ? 'fill-cyan-600 stroke-white scale-105' : 'fill-cyan-700/80 stroke-cyan-500 border-dashed';
        break;
      case 'DFS':
        if (isVisited) return isHovered ? 'fill-purple-400 stroke-white scale-110' : 'fill-purple-500/95 stroke-purple-400';
        if (isFrontier) return isHovered ? 'fill-purple-600 stroke-white scale-105' : 'fill-purple-700/80 stroke-purple-500';
        break;
      case 'IDS':
        if (isVisited) return isHovered ? 'fill-amber-400 stroke-white scale-110' : 'fill-amber-500/95 stroke-amber-400';
        if (isFrontier) return isHovered ? 'fill-amber-600 stroke-white scale-105' : 'fill-amber-700/80 stroke-amber-500';
        break;
      case 'UCS':
        if (isVisited) return isHovered ? 'fill-emerald-400 stroke-white scale-110' : 'fill-emerald-500/95 stroke-emerald-400';
        if (isFrontier) return isHovered ? 'fill-emerald-600 stroke-white scale-105' : 'fill-emerald-700/80 stroke-emerald-500';
        break;
    }

    return isHovered 
      ? 'fill-slate-700 stroke-slate-350 scale-105' 
      : 'fill-slate-800/90 stroke-slate-700';
  };

  const getHoveredNodeStatus = () => {
    if (!hoveredNodeId) return null;
    const targetNodeDef = activeNodes.find(n => n.id === hoveredNodeId);
    if (!targetNodeDef) return null;

    const isVisited = currentStep.visited.includes(hoveredNodeId);
    const isFrontier = currentStep.frontier.includes(hoveredNodeId);
    const isActive = currentStep.activeNode === hoveredNodeId;
    const neighbors = activeAdjacency[hoveredNodeId] || [];

    let statusString = 'Unvisited State';
    let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

    if (isActive) {
      statusString = 'Currently Expanding (Active)';
      badgeStyle = 'bg-orange-505/20 text-orange-400 border-orange-500/30';
    } else if (isVisited) {
      statusString = 'Fully Explored';
      badgeStyle = `${details.badgeColor}`;
    } else if (isFrontier) {
      statusString = 'In Search Frontier';
      badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }

    return {
      status: statusString,
      badgeColor: badgeStyle,
      neighbors,
      role: targetNodeDef.role,
      complexity: targetNodeDef.complexity
    };
  };

  const hoveredStatusObj = getHoveredNodeStatus();

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-full gap-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Background Cyber Glow effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none -z-15" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none -z-15" />

      {/* Top Controller Panel - Cyber Glassmorphic Titlebar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">Neural Fidelity Algorithm Lab</h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/25">v2.0.0-PRO</span>
            </div>
            <p className="text-[11px] text-slate-400">FAANG Trees Syllabus vs Space-Complexity Optimization</p>
          </div>
        </div>

        {/* Graph Mesh Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">Topology Mode:</span>
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                setGraphType('neural');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                graphType === 'neural' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Cyber Neural Mesh
            </button>
            <button
              onClick={() => {
                setGraphType('canonical');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                graphType === 'canonical' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Canonical Tree Graph
            </button>
          </div>
        </div>
      </div>

      {/* Primary Simulator Config Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
        
        {/* Toggle Algorithm Type (6 cols) */}
        <div className="md:col-span-6 space-y-1.5">
          <span className="text-[11px] text-slate-405 font-mono uppercase tracking-wider block">1. Select Traversal Model</span>
          <div className="grid grid-cols-4 bg-slate-900/90 p-1 rounded-lg border border-slate-800 divide-x divide-slate-800 text-xs">
            <button
              onClick={() => {
                setAlgoType('BFS');
                setIsPlaying(false);
              }}
              className={`py-1.5 text-center font-bold font-mono transition-all cursor-pointer rounded-l-md ${
                algoType === 'BFS' ? 'bg-cyan-500 text-slate-955' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              BFS
            </button>
            <button
              onClick={() => {
                setAlgoType('DFS');
                setIsPlaying(false);
              }}
              className={`py-1.5 text-center font-bold font-mono transition-all cursor-pointer ${
                algoType === 'DFS' ? 'bg-purple-500 text-slate-955' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              DFS
            </button>
            <button
              onClick={() => {
                setAlgoType('IDS');
                setIsPlaying(false);
              }}
              className={`py-1.5 text-center font-bold font-mono transition-all cursor-pointer ${
                algoType === 'IDS' ? 'bg-amber-500 text-slate-955' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              IDS
            </button>
            <button
              onClick={() => {
                setAlgoType('UCS');
                setIsPlaying(false);
              }}
              className={`py-1.5 text-center font-bold font-mono transition-all cursor-pointer rounded-r-md ${
                algoType === 'UCS' ? 'bg-emerald-500 text-slate-955' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              UCS
            </button>
          </div>
        </div>

        {/* Start / Target selector dropdowns (6 cols) */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-405 font-mono uppercase tracking-wider block">2. Root Start Node</span>
            <select
              value={startNode}
              onChange={(e) => {
                setStartNode(e.target.value);
                setIsPlaying(false);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 cursor-pointer focus:outline-none focus:border-slate-700 font-mono text-[11px]"
            >
              {activeNodes.map(node => (
                <option key={node.id} value={node.id}>{node.id} ({node.role.slice(0, 20)})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-405 font-mono uppercase tracking-wider block">3. Target Goal Node</span>
            <select
              value={targetNode}
              onChange={(e) => {
                setTargetNode(e.target.value);
                setIsPlaying(false);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 cursor-pointer focus:outline-none focus:border-slate-700 font-mono text-[11px]"
            >
              {activeNodes.map(node => (
                <option key={node.id} value={node.id}>{node.id} ({node.role.slice(0, 20)})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Sandbox Layout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[440px]">
        
        {/* SVG Graph Visualization Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800/95 p-4 relative flex flex-col justify-between overflow-hidden shadow-inner group/graph">
          
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
            <span className="font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> 
              Active Graph: <strong className="text-slate-200 font-semibold">{graphType === 'neural' ? 'Neural Network Mesh' : 'FAANG Tree Network'}</strong>
            </span>
            <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Pass State: Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>

          {/* CUSTOM INTERACTIVE HOVER NODE TOOLTIP HUD */}
          {hoveredStatusObj && hoveredNodeId && (
            <div className="absolute top-12 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-xl p-3.5 shadow-2x max-w-xs transition-all pointer-events-none animate-fadeIn">
              <div className="flex justify-between items-center gap-3.5 mb-1.5">
                <span className="font-mono text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-white font-mono">{hoveredNodeId}</span>
                  Node Blueprint
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${hoveredStatusObj.badgeColor}`}>
                  {hoveredStatusObj.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 space-y-1.5 font-mono">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Role Assignment:</span>
                  <p className="text-slate-200 font-sans text-[11px] leading-tight font-medium">{hoveredStatusObj.role}</p>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-1">
                  <span>Asymptotic Growth:</span>
                  <strong className="text-amber-400 font-bold">{hoveredStatusObj.complexity}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Adjacent Conns:</span>
                  <span className="font-semibold text-slate-300">
                    {hoveredStatusObj.neighbors.length > 0 ? hoveredStatusObj.neighbors.join(', ') : 'Dead End'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Visited Index:</span>
                  <span className="font-semibold text-emerald-400 font-bold">
                    {currentStep.visited.includes(hoveredNodeId) 
                      ? `#${currentStep.visited.indexOf(hoveredNodeId) + 1} expanded` 
                      : 'Unreached'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SVG Canvas stage */}
          <div className="flex-1 flex justify-center items-center relative py-4">
            <svg viewBox="0 0 490 350" className="w-full max-w-[460px] h-auto overflow-visible select-none">
              <defs>
                {/* SVG neon filtering markers */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Markers to represent directional graph flows */}
                <marker id="arrow" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#334155" />
                </marker>
                <marker id="arrow-visited" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                <marker id="arrow-cyan" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#06b6d4" />
                </marker>
                <marker id="arrow-purple" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#a855f7" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Edge Links render bounds */}
              {activeEdges.map((edge) => {
                const srcNode = activeNodes.find(n => n.id === edge.source)!;
                const destNode = activeNodes.find(n => n.id === edge.target)!;
                const active = isEdgeVisited(edge.source, edge.target);
                const hovered = isEdgeHovered(edge.source, edge.target);

                // Math to align cost weights tags neatly in the center of edges
                const textX = (srcNode.x + destNode.x) / 2;
                const textY = (srcNode.y + destNode.y) / 2 - 8;

                // Pick appropriate direction marker ID based on chosen algorithm
                let markerId = 'url(#arrow)';
                if (active) {
                  if (algoType === 'BFS') markerId = 'url(#arrow-cyan)';
                  else if (algoType === 'DFS') markerId = 'url(#arrow-purple)';
                  else if (algoType === 'IDS') markerId = 'url(#arrow-amber)';
                  else markerId = 'url(#arrow-visited)';
                }

                // Pick edge stroke color
                let edgeColorClass = 'stroke-slate-800';
                if (hovered) {
                  edgeColorClass = 'stroke-sky-400 stroke-[3px] drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]';
                } else if (active) {
                  if (algoType === 'BFS') edgeColorClass = 'stroke-cyan-500 stroke-[2px.5]';
                  else if (algoType === 'DFS') edgeColorClass = 'stroke-purple-500 stroke-[2.5px]';
                  else if (algoType === 'IDS') edgeColorClass = 'stroke-amber-400 stroke-[2.5px]';
                  else edgeColorClass = 'stroke-emerald-400 stroke-[2.5px]';
                }

                return (
                  <g key={`${edge.source}-${edge.target}`}>
                    {/* Interactive thick transparent overlay for easy hovering */}
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={destNode.x}
                      y2={destNode.y}
                      className="stroke-transparent stroke-[15] cursor-pointer"
                      onMouseEnter={() => setHoveredNodeId(edge.source)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    />
                    
                    {/* Glowing structural edge line */}
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={destNode.x}
                      y2={destNode.y}
                      className={`transition-all duration-300 ${edgeColorClass}`}
                      strokeDasharray={hovered || (active && currentStep.activeNode === edge.source) ? "5,5" : undefined}
                      style={{
                        animation: hovered || (active && currentStep.activeNode === edge.source) ? 'dash 15s linear infinite' : undefined
                      }}
                      markerEnd={markerId}
                    />

                    {/* Weight cost logs - display only if cost > 1 or in Neural mesh */}
                    {(edge.cost > 1 || graphType === 'neural') && (
                      <g className="font-mono text-[9px] font-bold">
                        <rect
                          x={textX - 16}
                          y={textY - 6}
                          width="32"
                          height="12"
                          rx="4"
                          className="fill-slate-950/90 stroke-slate-800/80 stroke"
                        />
                        <text
                          x={textX}
                          y={textY + 3}
                          textAnchor="middle"
                          className="fill-slate-300 pointer-events-none font-bold"
                        >
                          g={edge.cost}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Node items render bounds */}
              {activeNodes.map((node) => {
                const isVisited = currentStep.visited.includes(node.id);
                const isActive = currentStep.activeNode === node.id;
                const isFrontier = currentStep.frontier.includes(node.id);
                const isHovered = hoveredNodeId === node.id;
                const isStart = node.id === startNode;
                const isTarget = node.id === targetNode;

                // Determine nodes glowing identifier filter
                let filterGlow: string | undefined = undefined;
                if (isHovered || isActive) {
                  if (algoType === 'BFS') filterGlow = 'url(#glow-cyan)';
                  else if (algoType === 'DFS') filterGlow = 'url(#glow-purple)';
                  else if (algoType === 'IDS') filterGlow = 'url(#glow-amber)';
                  else filterGlow = 'url(#glow-emerald)';
                }

                // Customize circle size on hover or start/target status
                const radiusSize = isHovered ? 20 : 17;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => {
                      // Click defaults toggling Start vs Target nodes sequentially
                      if (node.id === startNode) {
                        return; // already start
                      }
                      if (node.id === targetNode) {
                        setTargetNode(startNode);
                        setStartNode(node.id);
                      } else {
                        setTargetNode(node.id);
                      }
                      setIsPlaying(false);
                    }}
                  >
                    {/* Interactive glowing halo indicator rings */}
                    {(isHovered || isActive) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radiusSize + 8}
                        className={`fill-transparent stroke-dashed stroke-2 animate-spin-slow opacity-60 ${
                          isActive 
                            ? 'stroke-orange-400' 
                            : algoType === 'BFS'
                              ? 'stroke-cyan-400'
                              : algoType === 'DFS'
                                ? 'stroke-purple-400'
                                : algoType === 'IDS'
                                  ? 'stroke-amber-400'
                                  : 'stroke-emerald-400'
                        }`}
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Standard internal node base bubble */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radiusSize}
                      className={`stroke-2 transition-all duration-300 ${getNodeColor(node.id)}`}
                      filter={filterGlow}
                    />

                    {/* Label identifiers */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      className="fill-white font-mono text-[10px] font-bold pointer-events-none select-none"
                    >
                      {node.id.length > 5 ? node.id.slice(0, 4) + '..' : node.id}
                    </text>

                    {/* Role Tags representation flag */}
                    {isStart && (
                      <g transform={`translate(${node.x - 22}, ${node.y - 28})`}>
                        <rect width="44" height="11" rx="4" className="fill-blue-500/90 text-[7px]" />
                        <text x="22" y="8" textAnchor="middle" className="fill-white font-mono text-[7px] font-bold">START</text>
                      </g>
                    )}
                    {isTarget && (
                      <g transform={`translate(${node.x - 22}, ${node.y - 28})`}>
                        <rect width="44" height="11" rx="4" className="fill-rose-500/90 text-[7px]" />
                        <text x="22" y="8" textAnchor="middle" className="fill-white font-mono text-[7px] font-bold">TARGET</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Graphical Legend Footer Section */}
          <div className="flex flex-wrap gap-2.5 border-t border-slate-900 pt-3 text-[9px] text-slate-400 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              <span>Unvisited</span>
            </div>
            <div className={`flex items-center gap-1`}>
              <span className={`w-2.5 h-2.5 rounded-full ${details.accentColor} bg-current opacity-80`} />
              <span>{algoType} Frontier</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-400 animate-pulse" />
              <span>Active pop expansion</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
              <span>Fully Visited</span>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry & Memory Buffer sidebar (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Cybernetic Telemetry Metrics Panel */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/95 p-4 flex flex-col gap-3.5 relative overflow-hidden backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Live Laboratory Telemetry
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">CYBER-ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850/70">
                <span className="text-slate-500 text-[9px] block uppercase">Accumulated Path cost g(n):</span>
                <span className="text-white text-sm font-bold block mt-1">
                  {currentStep.accumulatedCost ?? 0} ms delay
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Sum of weights from root</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850/70">
                <span className="text-slate-500 text-[9px] block uppercase">Estimate Neural Load %:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-bold ${currentStep.neuralLoadPercent && currentStep.neuralLoadPercent > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currentStep.neuralLoadPercent ?? 10}%
                  </span>
                  <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        currentStep.neuralLoadPercent && currentStep.neuralLoadPercent > 80 ? 'bg-red-505 bg-red-450' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${currentStep.neuralLoadPercent ?? 10}%` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">Computational stress bar</span>
              </div>
            </div>

            {/* IDS Depth Limiter Flag */}
            {algoType === 'IDS' && (
              <div className="p-2 sm:p-2.5 bg-amber-500/10 text-[10.5px] border border-amber-500/25 rounded-lg text-slate-300 leading-relaxed font-mono flex items-center justify-between">
                <span>📍 Current Depth-Ceiling check:</span>
                <strong className="text-amber-400 text-xs font-bold font-mono">Level {currentStep.depthLimit ?? 0} maximum</strong>
              </div>
            )}
          </div>

          {/* ACTIVE SEARCH FRONTIER CONTAINER PANEL */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/95 p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                🗂️ Search Fringe / Active Container Stack
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${details.badgeColor}`}>
                {algoType === 'BFS' ? 'Queue (FIFO)' : algoType === 'DFS' ? 'Stack (LIFO)' : algoType === 'IDS' ? 'Depth stack (LIFO)' : 'Priority Queue (Sorted)'}
              </span>
            </div>

            {/* Interactive Visual Fringe Element Block */}
            <div className="flex-1 bg-slate-900/50 border border-slate-850/80 rounded-lg p-3.5 flex flex-col justify-center items-center relative overflow-hidden min-h-[140px]">
              {currentStep.frontier.length === 0 ? (
                <div className="text-center p-3 text-slate-500 font-mono">
                  <span className="text-2xl block mb-1">📭</span>
                  <span className="text-xs">Container is currently empty</span>
                  <p className="text-[9px] text-slate-400 mt-1">Start step simulation to index frontier states</p>
                </div>
              ) : (
                <div className={`w-full flex ${algoType === 'BFS' ? 'flex-row gap-2 overflow-x-auto justify-start' : 'flex-col-reverse gap-1.5 overflow-y-auto justify-end'} items-stretch items-center p-1 h-full`}>
                  {currentStep.frontier.map((nodeId, idx) => {
                    const isNextOut = algoType === 'BFS' ? idx === 0 : algoType === 'DFS' || algoType === 'IDS' ? idx === currentStep.frontier.length - 1 : false;
                    const isNodeHovered = hoveredNodeId === nodeId;
                    
                    // Recover priority queue weight if UCS selected
                    const ucsCost = currentStep.frontierWithCosts?.find(item => item.node === nodeId)?.priority;

                    return (
                      <div
                        key={`${nodeId}-${idx}`}
                        onMouseEnter={() => setHoveredNodeId(nodeId)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={`px-3 py-2 rounded-lg text-center font-mono text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer dynamic-fringe-card ${
                          isNodeHovered
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 scale-105'
                            : isNextOut 
                              ? 'bg-orange-500/20 border-orange-400 text-orange-300 border-2' 
                              : `bg-slate-900 border border-slate-800 ${details.accentColor}`
                        } ${algoType === 'BFS' ? 'min-w-[56px] shrink-0' : 'w-full'}`}
                      >
                        <span className="text-[8px] text-slate-500 select-none block tracking-tighter uppercase font-mono mb-0.5">
                          {isNextOut ? 'Next Pop' : algoType === 'UCS' ? `PQ Cost` : 'Fringe'}
                        </span>
                        <span className="text-[12px] text-slate-200">{nodeId}</span>
                        {algoType === 'UCS' && typeof ucsCost === 'number' && (
                          <span className="text-[9px] bg-slate-950/80 px-1 py-0.5 rounded text-emerald-400 border border-slate-800 mt-1">
                            g={ucsCost}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Visited Path List Timeline log */}
            <div className="mt-3.5 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono tracking-wider block">👣 Travel Trace History:</span>
              <div className="bg-slate-900 border border-slate-800/80 px-3 py-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 text-slate-300 overflow-x-auto">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
                  {currentStep.visited.length === 0 ? (
                    <span className="text-slate-500 italic font-sans text-[11px]">No node expanded yet...</span>
                  ) : (
                    currentStep.visited.map((v, idx) => {
                      const isHovered = hoveredNodeId === v;
                      return (
                        <React.Fragment key={`${v}-${idx}`}>
                          {idx > 0 && <span className="text-slate-600 font-sans mx-0.5">→</span>}
                          <span
                            onMouseEnter={() => setHoveredNodeId(v)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            className={`px-1 rounded cursor-pointer transition-all ${
                              isHovered 
                              ? `${details.badgeColor} font-bold scale-105 shadow-sm` 
                              : 'text-slate-200 hover:text-white bg-slate-950/20'
                            }`}
                          >
                            {v}
                          </span>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE CONTROL PANEL */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-4 space-y-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-all gap-1.5 ${details.buttonClass}`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIdx === steps.length - 1}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Reset simulation step"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback pacing Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">PACING RATIO:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-300 cursor-pointer focus:outline-none"
              >
                <option value={2000}>Lazy (2s)</option>
                <option value={1200}>Standard (1.2s)</option>
                <option value={600}>Hyper (0.6s)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Academic Explanations Panel with dynamic proof and model diagnostics */}
      <div className="bg-slate-950/80 p-5 border border-slate-800 rounded-2xl leading-relaxed text-slate-300 text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-505 bg-emerald-400"></span>
              </span>
            </span>
            <span className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-widest leading-none">
              🎓 Real-Time Analytical breakdown & Core Theory Verification
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
            FRAME {currentStepIdx + 1} OF {steps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main concept explanation (7 cols) */}
          <div className="md:col-span-7 space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${details.badgeColor}`}>
                {currentStep.conceptTitle || 'Step Transition'}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                Active Node: <strong className="text-white font-bold">{currentStep.activeNode || 'None'}</strong>
              </span>
            </div>
            
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              {currentStep.conceptExplanation || 'Initializing graph routing parameters. Ready to explore nodes systematically based on model principles.'}
            </p>
          </div>

          {/* Academic Proof context and complexity (5 cols) */}
          <div className="md:col-span-5 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase mb-1">📑 Algorithmic Axioms & Proofs</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans italic">
                "{currentStep.academicProofContext || 'BFS expands level-by-level, ensuring minimum cumulative edge path costs.'}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/70 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Time Bounds: <strong className="text-slate-200">O(bᵈ)</strong></span>
              <span>Space Bounds: <strong className="text-slate-200 font-bold">{algoType === 'BFS' ? 'O(bᵈ)' : algoType === 'DFS' ? 'O(b * d)' : algoType === 'IDS' ? 'O(b * d)' : 'O(bᵈ)'}</strong></span>
            </div>
          </div>
        </div>

        {/* Debug Console Log Tracer info line */}
        <div className="bg-slate-900/35 p-2.5 rounded border border-slate-900 flex items-start gap-2 text-[10px]">
          <span className="font-mono text-slate-500 select-none bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60 font-bold shrink-0">DIAGNOSTICS TRACE:</span>
          <code className="text-slate-400 font-mono flex-1 leading-snug">{currentStep.log}</code>
        </div>
      </div>

    </div>
  );
}
