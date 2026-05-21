import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Info, MousePointerClick, ShieldAlert, CheckCircle } from 'lucide-react';
import { GridCell, SimType } from '../types';

const ROWS = 6;
const COLS = 10;

// Helper to check if two coordinate sets are matching
const coordsEqual = (r1: number, c1: number, r2: number, c2: number) => r1 === r2 && c1 === c2;

interface PathStep {
  visited: [number, number][]; // absolute visitation order leading up to this step
  frontier: [number, number][]; // active state containers in the queue/stack
  active: [number, number] | null;
  path: [number, number][]; // backtracked solution path if finished
  log: string;
}

export default function GridSimulator() {
  const [start, setStart] = useState<[number, number]>([1, 1]);
  const [target, setTarget] = useState<[number, number]>([4, 8]);
  // Preset some walls to block standard linear routes
  const [walls, setWalls] = useState<[number, number][]>([
    [1, 4], [2, 4], [3, 4], [4, 4],
    [3, 7], [4, 7], [2, 7]
  ]);
  const [drawMode, setDrawMode] = useState<'wall' | 'start' | 'target'>('wall');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  
  const [algoType, setAlgoType] = useState<SimType>('BFS');
  const [steps, setSteps] = useState<PathStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(300); // ms for fast grid animations

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate grid search step outcomes based on settings
  const runPathfinding = () => {
    const isWallSet = new Set<string>();
    walls.forEach(([r, c]) => isWallSet.add(`${r},${c}`));

    const stepsList: PathStep[] = [];
    const visitedList: [number, number][] = [];
    const parentsMap: Record<string, string> = {};

    stepsList.push({
      visited: [],
      frontier: [start],
      active: null,
      path: [],
      log: `Initialized grid search from start coord (${start[0]}, ${start[1]}).`
    });

    const isInside = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
    const DIRECTIONS = [
      [-1, 0], // North
      [0, 1],  // East
      [1, 0],  // South
      [0, -1]  // West
    ];

    if (algoType === 'BFS') {
      const queue: [number, number][] = [start];
      const visitedSet = new Set<string>();
      visitedSet.add(`${start[0]},${start[1]}`);

      let found = false;

      while (queue.length > 0) {
        const active = queue.shift()!;
        visitedList.push(active);

        stepsList.push({
          visited: [...visitedList],
          frontier: [...queue],
          active: active,
          path: [],
          log: `BFS dequeued (${active[0]}, ${active[1]}). Evaluating immediate level neighbors.`
        });

        if (coordsEqual(active[0], active[1], target[0], target[1])) {
          found = true;
          break;
        }

        for (const [dr, dc] of DIRECTIONS) {
          const nr = active[0] + dr;
          const nc = active[1] + dc;
          const key = `${nr},${nc}`;

          if (isInside(nr, nc) && !isWallSet.has(key) && !visitedSet.has(key)) {
            visitedSet.add(key);
            parentsMap[key] = `${active[0]},${active[1]}`;
            queue.push([nr, nc]);
          }
        }

        stepsList.push({
          visited: [...visitedList],
          frontier: [...queue],
          active: active,
          path: [],
          log: `Enqueued unvisited cardinal neighbors. Frontier holds ${queue.length} coordinates.`
        });
      }

      if (found) {
        // Backtrack path
        const finalPath: [number, number][] = [];
        let currKey = `${target[0]},${target[1]}`;
        while (currKey) {
          const [r, c] = currKey.split(',').map(Number);
          finalPath.unshift([r, c]);
          currKey = parentsMap[currKey];
        }

        stepsList.push({
          visited: [...visitedList],
          frontier: [],
          active: null,
          path: finalPath,
          log: `BFS found TARGET node successfully! Traced back shortest-path of ${finalPath.length} steps. BFS guarantees optimum distance.`
        });
      } else {
        stepsList.push({
          visited: [...visitedList],
          frontier: [],
          active: null,
          path: [],
          log: 'Pathfinding complete. Target node is completely unreachable from the start.'
        });
      }

    } else {
      // DFS Pathfinding
      const stack: [number, number][] = [start];
      const visitedSet = new Set<string>();
      let found = false;

      while (stack.length > 0) {
        const active = stack.pop()!;
        const activeKey = `${active[0]},${active[1]}`;

        if (visitedSet.has(activeKey)) {
          continue;
        }

        visitedSet.add(activeKey);
        visitedList.push(active);

        stepsList.push({
          visited: [...visitedList],
          frontier: [...stack],
          active: active,
          path: [],
          log: `DFS popped coord (${active[0]}, ${active[1]}). Marked as visited. Venturing down absolute branch depths.`
        });

        if (coordsEqual(active[0], active[1], target[0], target[1])) {
          found = true;
          break;
        }

        // Push neighbors (Reverse order of directions to maintain traditional exploration priorities)
        for (let i = DIRECTIONS.length - 1; i >= 0; i--) {
          const [dr, dc] = DIRECTIONS[i];
          const nr = active[0] + dr;
          const nc = active[1] + dc;
          const key = `${nr},${nc}`;

          if (isInside(nr, nc) && !isWallSet.has(key) && !visitedSet.has(key)) {
            parentsMap[key] = `${active[0]},${active[1]}`;
            stack.push([nr, nc]);
          }
        }

        stepsList.push({
          visited: [...visitedList],
          frontier: [...stack],
          active: active,
          path: [],
          log: `Pushed unvisited neighboring directions onto DFS stack. Frontier elements: [${stack.map(s => `(${s[0]},${s[1]})`).slice(-3).join(', ')}...]`
        });
      }

      if (found) {
        // Backtrack path
        const finalPath: [number, number][] = [];
        let currKey = `${target[0]},${target[1]}`;
        while (currKey) {
          const [r, c] = currKey.split(',').map(Number);
          finalPath.unshift([r, c]);
          currKey = parentsMap[currKey];
        }

        stepsList.push({
          visited: [...visitedList],
          frontier: [],
          active: null,
          path: finalPath,
          log: `DFS found TARGET node! Traced back path of ${finalPath.length} steps. Note: DFS depth-first path exploration is NOT guaranteed to be optimal.`
        });
      } else {
        stepsList.push({
          visited: [...visitedList],
          frontier: [],
          active: null,
          path: [],
          log: 'DFS completed. Target node is completely unreachable.'
        });
      }
    }

    setSteps(stepsList);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  // Re-run pathfinding when parameters adjust
  useEffect(() => {
    runPathfinding();
  }, [algoType, start, target, walls]);

  // Handle auto-playback
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
    active: null,
    path: [],
    log: 'Loading...'
  };

  const isCellInPath = (r: number, c: number) => {
    return currentStep.path.some(([pr, pc]) => pr === r && pr === r && pc === c);
  };

  const isCellVisited = (r: number, c: number) => {
    return currentStep.visited.some(([vr, vc]) => vr === r && vc === c);
  };

  const isCellInFrontier = (r: number, c: number) => {
    return currentStep.frontier.some(([fr, fc]) => fr === r && fc === c);
  };

  const isCellWall = (r: number, c: number) => {
    return walls.some(([wr, wc]) => wr === r && wc === c);
  };

  // Handlers for cell interactions
  const handleCellClick = (r: number, c: number) => {
    if (coordsEqual(r, c, start[0], start[1]) || coordsEqual(r, c, target[0], target[1])) {
      return; // Can't draw walls on start or target nodes
    }

    if (drawMode === 'wall') {
      const isWall = isCellWall(r, c);
      if (isWall) {
        setWalls(walls.filter(([wr, wc]) => !(wr === r && wc === c)));
      } else {
        setWalls([...walls, [r, c]]);
      }
    } else if (drawMode === 'start') {
      setStart([r, c]);
      setDrawMode('wall');
    } else if (drawMode === 'target') {
      setTarget([r, c]);
      setDrawMode('wall');
    }
  };

  const clearWalls = () => {
    setWalls([]);
  };

  const loadComplexMaze = () => {
    setWalls([
      [0, 3], [1, 3], [2, 3], [3, 3],
      [2, 6], [3, 6], [4, 6], [5, 6],
      [3, 1], [3, 2], [3, 7], [3, 8],
    ]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full gap-5">
      
      {/* Configuration Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <MousePointerClick className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Grid Board Sandbox</h3>
            <p className="text-[11px] text-slate-400">Tap cells to toggle solid physical barriers</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Action modes */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setDrawMode('wall')}
              className={`px-3 py-1 rounded-md transition-colors font-semibold cursor-pointer ${
                drawMode === 'wall' ? 'bg-slate-800 text-white font-bold' : ''
              }`}
            >
              🧱 Wall Brush
            </button>
            <button
              onClick={() => setDrawMode('start')}
              className={`px-3 py-1 rounded-md transition-colors font-semibold cursor-pointer ${
                drawMode === 'start' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : ''
              }`}
            >
              🟢 Set Start
            </button>
            <button
              onClick={() => setDrawMode('target')}
              className={`px-3 py-1 rounded-md transition-colors font-semibold cursor-pointer ${
                drawMode === 'target' ? 'bg-red-500/20 text-red-400 font-bold' : ''
              }`}
            >
              🎯 Set Target
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearWalls}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-xs cursor-pointer text-slate-300 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={loadComplexMaze}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-xs cursor-pointer text-slate-300 hover:text-white"
            >
              Load Preset
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid and side data cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[400px]">
        
        {/* The 2D Chess Block matrix grid board: (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-x-auto">
          
          <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
            <span className="font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Step {currentStepIdx + 1} ({algoType})
            </span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
              {ROWS}x{COLS} Coordinates Space
            </span>
          </div>

          <div className="flex-1 flex justify-center items-center py-2">
            <div className="inline-grid grid-cols-10 gap-1.5 p-2.5 bg-slate-900/60 border border-slate-800/60 rounded-xl">
              {Array.from({ length: ROWS }).map((_, rIndex) =>
                Array.from({ length: COLS }).map((_, cIndex) => {
                  const isStart = coordsEqual(rIndex, cIndex, start[0], start[1]);
                  const isTarget = coordsEqual(rIndex, cIndex, target[0], target[1]);
                  const isWallCell = isCellWall(rIndex, cIndex);
                  const isVisited = isCellVisited(rIndex, cIndex);
                  const isFrontier = isCellInFrontier(rIndex, cIndex);
                  const isActive = currentStep.active && coordsEqual(rIndex, cIndex, currentStep.active[0], currentStep.active[1]);
                  const isSolution = isCellInPath(rIndex, cIndex);

                  let cellClass = 'bg-slate-800 border-slate-700/60';
                  let content = '';

                  if (isStart) {
                    cellClass = 'bg-emerald-500 text-slate-950 font-black border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20';
                    content = 'S';
                  } else if (isTarget) {
                    cellClass = 'bg-red-500 text-slate-100 font-black border-red-400 scale-105 shadow-lg shadow-red-500/20 animate-pulse';
                    content = 'T';
                  } else if (isWallCell) {
                    cellClass = 'bg-slate-700 border-slate-900 shadow-inner';
                  } else if (isActive) {
                    cellClass = 'bg-orange-500 text-white font-bold border-orange-400 animate-ping';
                  } else if (isSolution && currentStep.path.length > 0) {
                    cellClass = 'bg-yellow-400 border-yellow-300 text-slate-950 font-bold scale-105';
                    content = '•';
                  } else if (isVisited) {
                    cellClass = 'bg-teal-500/40 border-teal-500/60 text-slate-100';
                  } else if (isFrontier) {
                    cellClass = 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse';
                  }

                  return (
                    <button
                      key={`${rIndex}-${cIndex}`}
                      onClick={() => handleCellClick(rIndex, cIndex)}
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center text-xs font-mono transition-all duration-200 cursor-pointer select-none outline-none ${cellClass} hover:border-emerald-500/80 hover:brightness-105`}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Graphical Legends */}
          <div className="flex flex-wrap gap-3.5 border-t border-slate-900 pt-3 text-[10px] text-slate-400 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500 flex items-center justify-center text-[8px] text-slate-950 font-bold">S</span>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">T</span>
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-700" />
              <span>Barrier Wall</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-teal-500/40 border border-teal-500/60" />
              <span>Visited Cell</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-400" />
              <span>Backtracked Solution Path</span>
            </div>
          </div>
        </div>

        {/* Path metrics and controller board (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Controls Card */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">🛠️ Playback Settings</span>
            
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400">Search Paradigm:</label>
              <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setAlgoType('BFS')}
                  className={`flex-1 py-1.5 rounded-md font-semibold cursor-pointer transition-colors text-center ${
                    algoType === 'BFS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  BFS (Shortest Path)
                </button>
                <button
                  onClick={() => setAlgoType('DFS')}
                  className={`flex-1 py-1.5 rounded-md font-semibold cursor-pointer transition-colors text-center ${
                    algoType === 'DFS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  DFS (Deep Scan)
                </button>
              </div>
            </div>

            {/* Play controls */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
              <div className="flex gap-1">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold cursor-pointer flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStepIdx === steps.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 font-mono">
                <span className="text-[10px] text-slate-400">Pacing:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value={800}>0.8s</option>
                  <option value={300}>0.3s</option>
                  <option value={100}>0.1s</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnostics and statistics */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3.5 flex-1 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">📊 Engine Performance</span>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Nodes Explored:</span>
                <span className="font-mono text-white font-semibold">{currentStep.visited.length} cells</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Queue/Stack Size:</span>
                <span className="font-mono text-white font-semibold">{currentStep.frontier.length} elements</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2.5">
                <span className="text-slate-400">Total Path Distance:</span>
                <span className="font-mono text-yellow-400 font-bold">
                  {currentStep.path.length > 0 ? `${currentStep.path.length} steps` : 'Active...'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed text-slate-400 flex items-start gap-1.5 mt-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {algoType === 'BFS' 
                  ? 'BFS spans outwards symmetrically to record the shortest length path.' 
                  : 'DFS wanders deep towards local barriers, occasionally giving suboptimal paths.'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid narrative message */}
      <div className="bg-slate-950/80 p-4 border border-slate-800 rounded-xl leading-relaxed text-slate-200 text-xs flex flex-col md:flex-row gap-4 min-h-[74px] justify-between items-start md:items-center">
        <div className="flex gap-3 items-center">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Grid Search Trace:</span>
            <p className="mt-0.5 text-slate-200 font-mono text-[11px] font-semibold">{currentStep.log}</p>
          </div>
        </div>
        <div className="shrink-0 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono">
          <span>Active Logic: </span>
          <span className={algoType === 'BFS' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{algoType}</span>
        </div>
      </div>

    </div>
  );
}
