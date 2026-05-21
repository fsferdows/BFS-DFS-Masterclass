import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  BookOpen, 
  BookCheck, 
  Cpu, 
  Code, 
  HelpCircle, 
  GraduationCap, 
  ArrowRight, 
  Table, 
  Layers, 
  Target, 
  Coins, 
  ShieldAlert, 
  Award, 
  Star, 
  Lightbulb
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const ALGO_DATA = {
  BFS: {
    definition: "Breadth-First Search systematically explores a graph layer-by-layer. It expands the shallowest unexpanded node first, maintaining an active frontier using a First-In-First-Out (FIFO) queue queueing strategy. It acts as an optimal explorer for trees where all transition step-weights are identical.",
    pseudocode: `function breadth_first_search(root_node, goal):
  frontier = Queue([root_node]) 
  visited = Set([root_node])
  
  while not frontier.is_empty():
    node = frontier.dequeue()
    if node.state == goal:
      return path_to(node)
      
    for child in node.get_children():
      if child.state not in visited:
        visited.add(child.state)
        frontier.enqueue(child)
  return failure`
  },
  DFS: {
    definition: "Depth-First Search explores the deepest unexpanded branch first. It operates with a Last-In-First-Out (LIFO) stack layout. DFS plunges deep down a candidate path until a leaf vertex is hit, then backtracks to recursive branches. This keeps its memory utilization extremely compact.",
    pseudocode: `function depth_first_search(root_node, goal):
  frontier = Stack([root_node]) 
  visited = Set()
  
  while not frontier.is_empty():
    node = frontier.pop()
    if node.state == goal:
      return path_to(node)
      
    if node.state not in visited:
      visited.add(node.state)
      for child in node.get_children_reversed():
        if child.state not in visited:
          frontier.push(child)
  return failure`
  },
  IDS: {
    definition: "Iterative Deepening Search balances the completeness of BFS with the space-saving benefit of DFS. It carries out successive DFS iterations capped by an incrementally larger depth-limit (0, 1, 2, ..., d). It re-generates shallow layers but guarantees the optimal route finder in uniform graphs.",
    pseudocode: `function iterative_deepening_search(root_node, goal):
  for depth = 0 to infinity:
    result = depth_limited_search(root_node, goal, depth)
    if result != cutoff then return result

function depth_limited_search(node, goal, limit):
  if node.state == goal then return path_to(node)
  if limit == 0 then return cutoff
  
  cutoff_occurred = false
  for child in node.get_children():
    result = depth_limited_search(child, goal, limit - 1)
    if result == cutoff then cutoff_occurred = true
    else if result != failure then return result
    
  return cutoff_occurred ? cutoff : failure`
  },
  UCS: {
    definition: "Uniform Cost Search generalizes BFS to find the optimal path in graphs with non-uniform transition costs. It uses a Priority Queue (ordered by accumulated path cost g(n)) to expand nodes in order of non-decreasing total cost, finding optimal solutions safely with non-negative edge costs.",
    pseudocode: `function uniform_cost_search(root_node, goal):
  frontier = PriorityQueue(ordered_by: g(n))
  frontier.insert(root_node, priority = 0)
  visited = Set() # tracks explored states
  
  while not frontier.is_empty():
    node, cost = frontier.pop_min()
    if node.state == goal:
      return path_to(node)
      
    if node.state not in visited:
      visited.add(node.state)
      for child, step_cost in node.get_children_with_costs():
        if child.state not in visited:
          g_cost = cost + step_cost
          frontier.insert_or_update(child, priority = g_cost)
  return failure`
  }
};

export default function EducationalHandbook({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState<string>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Complexity Sandbox parameters
  const [b, setB] = useState<number>(3);
  const [d, setD] = useState<number>(4);
  const [stepCostEpsilon, setStepCostEpsilon] = useState<number>(1.5);
  const [optimalPathCostC, setOptimalPathCostC] = useState<number>(6.0);

  // Quiz State
  const [quizScore, setQuizScore] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Selector for the Interactive Explanation Panel
  const [selectedExposAlgo, setSelectedExposAlgo] = useState<'BFS' | 'DFS' | 'IDS' | 'UCS'>('BFS');

  const sections: Section[] = [
    { id: '1', title: '1. Conceptual Foundations', icon: <BookOpen className="w-4 h-4" /> },
    { id: '2', title: '2. Breadth-First Search (BFS)', icon: <Layers className="w-4 h-4" /> },
    { id: '3', title: '3. Depth-First Search (DFS)', icon: <ArrowRight className="w-4 h-4" /> },
    { id: '4', title: '4. Iterative Deepening Search (IDS)', icon: <Target className="w-4 h-4 text-cyan-400" /> },
    { id: '5', title: '5. Uniform Cost Search (UCS)', icon: <Coins className="w-4 h-4 text-amber-400" /> },
    { id: '5a', title: '5a. Dynamic Technical Explanation Panel', icon: <Lightbulb className="w-4 h-4 text-amber-450 text-amber-400" /> },
    { id: '6', title: '6. Side-by-Side Comparison Matrix', icon: <Table className="w-4 h-4 text-pink-400" /> },
    { id: '7', title: '7. Complexity Sandbox Calculator', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { id: '8', title: '8. Code Implementations Reference', icon: <Code className="w-4 h-4" /> },
    { id: '9', title: '9. Educational Mini Quiz', icon: <Award className="w-4 h-4 text-amber-500 animate-pulse" /> },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const QuizQuestions = [
    {
      question: "Which data structure is utilized in Iterative Deepening Search (IDS), and what is its maximum space complexity relative to tree-depth?",
      options: [
        "A FIFO Queue, yielding high space complexity of O(b^d).",
        "A Min-Heap Priority Queue, yielding O(b^(1 + C*/ε)) space complexity.",
        "A Stack or LIFO recursion context, yielding O(b * d) space complexity.",
        "A double-ended dequeue, yielding O(b * m^2) space complexity."
      ],
      correctIndex: 2,
      explanation: "Iterative Deepening Search executes a sequence of Depth-Limited Searches (DLS), which utilize stack-allocated recursive memory frames. Because it only keeps current paths and sibling branches in memory at any point, its space requirements remain O(b * d), mimicking DFS, yet finding the optimal shallow path like BFS."
    },
    {
      question: "Why does BFS fail to guarantee the shortest path on weighted graph topologies?",
      options: [
        "BFS assumes uniform step costs (unit weight). It evaluates paths strictly by hop count, ignoring cumulative edge costs.",
        "BFS fringe data structures are unstable in memory.",
        "BFS automatically falls into infinite depth branches when weights are present.",
        "BFS cannot process cycle checks on undirected paths."
      ],
      correctIndex: 0,
      explanation: "BFS expands nodes strictly level-by-level, mimicking a hop-count calculation. If a longer path has 2 expensive edges (e.g., cost 50+50=100) and a shorter path has 3 cheap ones (e.g., cost 2+2+2=6), BFS selects the expensive 2-edge path, violating optimal path cost rules."
    },
    {
      question: "Under what conditions is Uniform Cost Search (UCS) mathematically guaranteed to be complete and optimal?",
      options: [
        "As long as the graph has at least one negative cycle.",
        "When the branching factor is infinite and all costs are zero.",
        "When all step costs are strictly positive (c(u, v) >= ε > 0) and the branching factor b is finite.",
        "Only on flat grids where all rows hold identical weights."
      ],
      correctIndex: 2,
      explanation: "For UCS to be optimal and complete, all edge costs must be positively bounded away from zero (c(u,v) >= ε > 0). If negative or zero-cost cycles existed, UCS could explore infinitely without progressing closer to the goal because node costs would not strictly increase."
    },
    {
      question: "In Iterative Deepening Search, does re-expanding nodes at earlier depths lead to severe runtime overhead relative to BFS?",
      options: [
        "Yes, it increases the asymptotic time complexity exponent to O(b^(d+2)).",
        "No, because the majority of nodes in an exponential branching tree reside on the deepest level, making the overhead of re-expanding shallower levels minimal (typically only 10-15% on deep target trees).",
        "Yes, it causes the system memory to crash due to LIFO buffer collisions.",
        "No, because it compiles down to assembly-level pointers."
      ],
      correctIndex: 1,
      explanation: "In an exponential search tree, the leaf nodes (deepest level) dominate. The sum of all shallower levels is small compared to the leaves. Thus, repeatedly checking the root levels only introduces marginal overhead (around b/(b-1) times the work), while retaining the immense safety profile of O(b * d) stack space."
    },
    {
      question: "At what micro-step cycle does Uniform Cost Search guarantee that the optimal path to a node is discovered?",
      options: [
        "The moment the node is first generated and added to the frontier.",
        "The moment the node is popped/dequeued from the Priority Queue.",
        "When the node's neighbors are first randomized.",
        "Whenever the linter completes compilation successfully."
      ],
      correctIndex: 1,
      explanation: "Critical UCS Rule: The path cost to a node is NOT guaranteed to be optimal when it is first generated (seen in the fringe) because a longer, cheaper alternative path might be discovered later. The guarantee is ONLY established when the node is dequeued / popped from the Priority Queue, signaling that all candidate paths of lower cost have been fully evaluated."
    }
  ];

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
    setShowExplanation(true);
    if (optionIndex === QuizQuestions[currentQuestionIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < QuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const codeBFS = `from collections import deque

def breadth_first_search(graph, start, target):
    # Fringe: FIFO Queue
    queue = deque([(start, [start])])
    # Closed list for Graph Search pathing completeness
    visited = {start}
    
    while queue:
        node, path = queue.popleft() # O(1) front extraction
        
        if node == target:
            return path # Shortest path in unweighted graph!
            
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
                
    return None`;

  const codeDFS = `def depth_first_search_iterative(graph, start, target):
    # Fringe: LIFO Stack
    stack = [(start, [start])]
    visited = set()
    
    while stack:
        node, path = stack.pop() # O(1) back extraction (last-in)
        
        if node == target:
            return path
            
        if node not in visited:
            visited.add(node)
            # Reversing neighbors guarantees left-to-right exploration sequence
            for neighbor in reversed(graph.get(node, [])):
                if neighbor not in visited:
                    stack.append((neighbor, path + [neighbor]))
                    
    return None`;

  const codeIDS = `def depth_limited_search(graph, node, target, limit, visited_path):
    if node == target:
        return visited_path
    if limit <= 0:
        return None
        
    for neighbor in graph.get(node, []):
        if neighbor not in visited_path: # Prevent cycles in current search path
            result = depth_limited_search(
                graph, neighbor, target, limit - 1, visited_path + [neighbor]
            )
            if result is not None:
                return result
    return None

def iterative_deepening_search(graph, start, target, max_depth=100):
    # Increment depth limits recursively from 0 to max_depth
    for limit in range(max_depth + 1):
        result = depth_limited_search(graph, start, target, limit, [start])
        if result is not None:
            return result, limit
    return None, -1`;

  const codeUCS = `import heapq

def uniform_cost_search(graph, start, target):
    # Fringe: Priority Queue (Min-Heap)
    # Holds tuples of: (cumulative_cost, node, path_history)
    pq = [(0, start, [start])]
    visited = set() # Closed list
    
    while pq:
        cost, node, path = heapq.heappop(pq) # Safely pops lease cost node
        
        if node == target:
            return path, cost # Guaranteed optimal path cost!
            
        if node not in visited:
            visited.add(node)
            for neighbor, weight in graph.get(node, []):
                if neighbor not in visited:
                    heapq.heappush(pq, (cost + weight, neighbor, path + [neighbor]))
                    
    return None, float('inf')`;

  return (
    <div className={`flex flex-col lg:flex-row gap-6 border rounded-2xl overflow-hidden h-full transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {/* Sidebar Table of Contents */}
      <div className={`w-full lg:w-72 p-4 border-b lg:border-b-0 lg:border-r flex flex-col gap-1.5 shrink-0 max-h-[350px] lg:max-h-full overflow-y-auto scrollbar-thin transition-colors duration-300 ${isDark ? 'bg-slate-950/60 border-slate-850 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <BookOpen className="w-4 h-4 text-emerald-500" /> ACADEMIC CURRICULUM
        </div>
        
        <button
          onClick={() => setActiveSection('all')}
          className={`text-left text-xs py-2.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-2.5 font-medium ${
            activeSection === 'all'
              ? isDark 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-500/30'
              : isDark
                ? 'text-slate-300 hover:bg-slate-805 hover:bg-slate-800/40 border border-transparent'
                : 'text-slate-700 hover:bg-slate-200/50 border border-transparent'
          }`}
        >
          <span>🌐 Show All Sections</span>
        </button>

        <div className={`h-px my-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />

        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`text-left text-xs py-2 px-3 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSection === sec.id
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-emerald-500/30 pl-3.5 shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 font-bold border-emerald-250 pl-3.5 shadow-sm'
                : isDark
                  ? 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {sec.icon}
            <span className="truncate">{sec.title}</span>
          </button>
        ))}
      </div>

      {/* Main Study Guide Content */}
      <div id="handbook-content-container" className={`flex-1 p-5 md:p-8 overflow-y-auto max-h-[750px] lg:max-h-[920px] scroll-smooth transition-colors duration-300 ${isDark ? 'text-slate-100 bg-slate-900/10' : 'text-slate-800 bg-slate-100/10'}`}>
        <div className="max-w-4xl space-y-12">
          
          {/* Header */}
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-mono rounded-full mb-3 uppercase tracking-wider ${
              isDark 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <GraduationCap className="w-3.5 h-3.5" /> Core AI Research & Algorithms Handbook
            </div>
            <h1 className={`text-3xl font-extrabold tracking-tight mb-2 font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Uninformed Search Algorithms Masterclass
            </h1>
            <p className={`text-sm max-w-2xl leading-relaxed font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              An advanced, production-grade reference manual analyzing <strong>Breadth-First Search (BFS)</strong>, 
              <strong> Depth-First Search (DFS)</strong>, <strong>Iterative Deepening Search (IDS)</strong>, and 
              <strong> Uniform Cost Search (UCS)</strong>, blending rigorous theoretical models with practical implementation sandboxes.
            </p>
          </div>

          {/* Section 1: Conceptual Foundations */}
          {(activeSection === 'all' || activeSection === '1') && (
            <section id="ref-section-1" className={`space-y-4 border-t pt-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-emerald-500 font-mono">1.</span> Conceptual Foundations & Terminology
              </h2>
              
              <div className={`p-4 rounded-xl border text-xs space-y-3 leading-relaxed transition-colors duration-300 ${isDark ? 'p-4 bg-slate-950/40 border-slate-800 text-slate-305 text-slate-300' : 'p-4 bg-slate-50 border-slate-200 text-slate-700'}`}>
                <p>
                  A <strong>search problem</strong> is formalised by five core components: a <em>start state</em>, 
                  a set of <em>actions</em>, a <em>transition model</em>, a <em>goal test function</em>, and a 
                  <em> path cost function</em>. The sequence of actions leading from start to goal constitutes the <strong>state space trajectory</strong>.
                </p>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2 ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                  <div className={`p-3 border rounded-lg transition-colors ${isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="block font-bold text-emerald-500 text-[11px] mb-1">Branching Factor (b)</span>
                    The maximum number of successors generated by any expanded node in the graph.
                  </div>
                  <div className={`p-3 border rounded-lg transition-colors ${isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="block font-bold text-cyan-550 text-cyan-600 text-[11px] mb-1">Shallowest Solution (d)</span>
                    The optimal depth from the root state to the closest goal state meeting requirements.
                  </div>
                  <div className={`p-3 border rounded-lg transition-colors ${isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="block font-bold text-amber-550 text-amber-600 text-[11px] mb-1">Maximum Depth (m)</span>
                    The theoretical limit or absolute maximum path length inside the search tree (can be infinity).
                  </div>
                </div>

                <div className={`border p-4 rounded-xl mt-3 space-y-2 transition-colors duration-300 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <h3 className={`font-bold flex items-center gap-1.5 text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Tree Search vs. Graph Search Distinction
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    The difference between <strong>Tree Search</strong> and <strong>Graph Search</strong> is the management of visited nodes.
                  </p>
                  <ul className={`list-disc pl-5 text-[11px] space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <li><strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Tree Search:</strong> Does not store visited states in a closed list. Safely navigates cycle-free trees, but falls into infinite loop catastrophes on cyclic graphs.</li>
                    <li><strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Graph Search:</strong> Implements a <strong>Closed List</strong> / Visited set to store expanded states. Guarantees safety on cyclic graph structures because it rejects duplicate state expansions, though it requires {"O(V)"} additional space.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Section 2: BFS Deep Dive */}
          {(activeSection === 'all' || activeSection === '2') && (
            <section id="ref-section-2" className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="text-emerald-400 font-mono">2.</span> Breadth-First Search (BFS) Module
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded">FIFO Queue</span>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-350 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-slate-200">Formal Definition & Strategy</h3>
                  <p className="text-slate-400">
                    Breadth-First Search is an uninformed strategy that expands nodes systematically level-by-level. Starting from the root node, it explores every vertex at depth l before moving deeper to explore nodes at level l + 1.
                  </p>
                </div>

                <p>
                  <strong>Fringe Structure:</strong> FIFO Queue. Elements are inserted at the back and pulled from the front, ensuring a level-by-level progression.
                </p>

                {/* Step-by-Step Example (b=2, d=3) */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-white block text-[11px]">Execution Walkthrough (b=2, d=3 Tree Search)</span>
                  <p className="text-[11px] text-slate-400">
                    Let root be A. We search for target G at depth 3. Branching yields child nodes left-to-right.
                  </p>
                  <pre className="p-3 bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto">
{`            [A]             <-- Level 0
           /   \\
         [B]   [C]          <-- Level 1
        /   \\ /   \\
       D     E F   G        <-- Level 2 (G discovered here!)`}
                  </pre>
                  <ol className="list-decimal pl-4 text-[11px] text-slate-400 space-y-1">
                    <li>Initialize Fringe Queue: <code className="font-mono text-slate-300">[A]</code></li>
                    <li>Pop front <strong className="text-slate-200">A</strong>. Expand A. Neighbors enqueued. Queue: <code className="font-mono text-slate-300">[B, C]</code>.</li>
                    <li>Pop front <strong className="text-slate-200">B</strong>. Expand B. Neighbors enqueued. Queue: <code className="font-mono text-slate-300">[C, D, E]</code>.</li>
                    <li>Pop front <strong className="text-slate-200">C</strong>. Expand C. Neighbors enqueued. Queue: <code className="font-mono text-slate-300">[D, E, F, G]</code>.</li>
                    <li>Step through D and E. Target G is generated and subsequently popped, terminating the search with path A to C to G.</li>
                  </ol>
                </div>

                {/* Mathematical Derivations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950/30 border border-slate-800 rounded-lg space-y-1.5">
                    <span className="font-semibold text-white block text-[11px]">Time Complexity Derivation</span>
                    <p className="text-[11px] text-slate-400">
                      In the worst case, BFS must generate all nodes up to depth d+1:
                      <code className="font-mono text-emerald-400 block mt-1">{"T(b,d) = 1 + b + b^2 + ... + b^d + (b^(d+1)-b) = O(b^(d+1))"}</code>
                      BFS visits all ancestors and sibling nodes on the way.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-950/30 border border-slate-800 rounded-lg space-y-1.5">
                    <span className="font-semibold text-white block text-[11px]">Space Complexity Derivation</span>
                    <p className="text-[11px] text-slate-400">
                      BFS must store the raw fringe leaves. At depth d, the last layer holds b^d elements. Including visited storage, space is strictly:
                      <code className="font-mono text-emerald-400 block mt-1">{"S(b,d) = O(b^d)"}</code>
                      This severe memory demand is the largest limitation of BFS.
                    </p>
                  </div>
                </div>

                {/* Proofs */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-[11px]">Formal BFS Proofs</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Completeness:</strong> Complete if branching factor b is finite. Since all parent-wise levels contain finite node sums, the search eventually reaches depth d and finds the target vertex.</li>
                    <li><strong className="text-slate-200">Optimality:</strong> BFS is mathematically optimal <strong>only</strong> when edge costs are uniform (unit weight). Because hop-count strictly mirrors depth, the first goal node popped from the queue is verified to have the absolute shortest possible depth.</li>
                  </ul>
                  <p className="text-[10px] text-slate-500">
                    <strong>Failure Conditions:</strong> Infinite graphs with infinite branching factors, or structures whose memory size exceeds total physical RAM bandwidth limits.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: DFS Deep Dive */}
          {(activeSection === 'all' || activeSection === '3') && (
            <section id="ref-section-3" className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="text-emerald-400 font-mono">3.</span> Depth-First Search (DFS) Module
                </h2>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono rounded">LIFO Stack</span>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-350 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-slate-200">Formal Definition & Strategy</h3>
                  <p className="text-slate-400">
                    Depth-First Search explores path branches sequentially. Starting from root, DFS drives downward on the first generated successor until hitting maximum depth m (or a dead-end), then backtracks to the most recent unexploded pivot node.
                  </p>
                </div>

                <p>
                  <strong>Fringe Structure:</strong> LIFO Stack (implicit recursion sequence or explicit stack list).
                </p>

                {/* Step-by-Step Example */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-white block text-[11px]">Execution Walkthrough (b=2, d=3 DFS Left-Preference)</span>
                  <pre className="p-3 bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-amber-500 overflow-x-auto">
{`            [A]
           /   \\
         [B]   [C]
        /   \\
       D     E      <-- Left preference focuses on left subtree first`}
                  </pre>
                  <ol className="list-decimal pl-4 text-[11px], text-slate-400 space-y-1">
                    <li>Initialize Fringe Stack: <code className="font-mono text-slate-300">[A]</code></li>
                    <li>Pop <strong className="text-slate-200">A</strong>. Push neighbors. Stack: <code className="font-mono text-slate-300">[C, B]</code></li>
                    <li>Pop <strong className="text-slate-200">B</strong>. Push neighbors. Stack: <code className="font-mono text-slate-300">[C, E, D]</code> (assuming left prioritized, so D is on top)</li>
                    <li>Pop <strong className="text-slate-200">D</strong> (target depth limit reached). Backtrack.</li>
                    <li>Pop <strong className="text-slate-200">E</strong>. Backtrack.</li>
                    <li>Pop <strong className="text-slate-200">C</strong>. Explore right subtree.</li>
                  </ol>
                </div>

                {/* Mathematical Derivations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950/30 border border-slate-800 rounded-lg space-y-1.5">
                    <span className="font-semibold text-white block text-[11px]">Time Complexity Derivation</span>
                    <p className="text-[11px] text-slate-400">
                      In the worst case, DFS explores the entire search tree. For branching factor b and max depth m:
                      <code className="font-mono text-amber-450 block mt-1">{"T(b,m) = O(b^m)"}</code>
                      If m is much larger than d, DFS performs a great deal of redundant work.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-950/30 border border-slate-800 rounded-lg space-y-1.5">
                    <span className="font-semibold text-white block text-[11px]">Space Complexity Derivation</span>
                    <p className="text-[11px] text-slate-400">
                      DFS is highly space-efficient. It only needs to store the path from the root to the current node, plus siblings of nodes on the path:
                      <code className="font-mono text-amber-450 block mt-1">{"S(b,m) = O(b * m)"}</code>
                      This linear space requirement is DFS's primary advantage.
                    </p>
                  </div>
                </div>

                {/* Proofs */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-[11px]">Formal DFS Proofs</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Completeness:</strong> <strong>Not Complete</strong> on infinite-depth state spaces (tree search) or graphs with loops when no visited list is kept. DFS can easily wander down an infinite branch without ever backtracking. Correcting this with graph search (keeping a closed list) ensures completeness in finite graphs.</li>
                    <li><strong className="text-slate-200">Optimality:</strong> <strong>Non-optimal</strong>. DFS terminates when it first finds a pathway to a target node. Since path evaluation does not prioritize shallow nodes, it can easily return a deep solution on the left before searching a shallow, optimal path on the right.</li>
                  </ul>
                  <p className="text-[10px] text-slate-500">
                    <strong>Real-World Applications:</strong> Detecting deadlocks in multithreaded systems, topological sorting inside compilers, and maze routing.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: IDS Deep Dive */}
          {(activeSection === 'all' || activeSection === '4') && (
            <section id="ref-section-4" className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="text-cyan-400 font-mono">4.</span> Iterative Deepening Search (IDS)
                </h2>
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono rounded">DFS with Depth Caps</span>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-355 leading-relaxed">
                <div className="p-4 bg-slate-950/65 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-white">Combining BFS Optimality with DFS Space Efficiency</h3>
                  <p className="text-slate-400 leading-relaxed">
                    IDS elegantly solves the main drawbacks of BFS and DFS. By executing a sequence of Depth-Limited Searches (DLS) with increasing depth limits (L = 0, 1, 2, ...), 
                    IDS guarantees finding the shallowest optimal target (like BFS) while keeping stack space strictly linear (like DFS). This makes it highly effective for large search spaces.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-200">Step-by-Step limit execution sequence</h3>
                  <p className="text-slate-400">
                     Imagine a target node resides at level 2. IDS implements DLS recursively:
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-slate-400 space-y-1">
                    <li><span className="text-cyan-400">Limit L = 0:</span> Explores root only. Goal check fails.</li>
                    <li><span className="text-cyan-400">Limit L = 1:</span> Performs DFS starting at root with maximum depth 1. Explores nodes up to level 1.</li>
                    <li><span className="text-cyan-400">Limit L = 2:</span> Performs DFS up to level 2. Target node located and retrieved successfully!</li>
                  </ul>
                </div>

                {/* Mathematical Derivation */}
                <div className="p-4 bg-cyan-950/10 border border-cyan-900/25 rounded-xl space-y-2">
                  <span className="font-mono text-cyan-400 font-bold block text-[11px]">The Mathematical Trade-off: Re-expanding Nodes</span>
                  <p className="text-slate-400">
                    It might seem highly inefficient to repeat search expansions at root levels. However, let us calculate the node generation sums:
                  </p>
                  <p className="font-mono bg-slate-950 p-2 border border-slate-850 rounded text-center text-slate-300 text-xs">
                    {"Node expansion count N(IDS) = (d + 1) * 1 + d * b + (d - 1) * b^2 + ... + 1 * b^d"}
                  </p>
                  <p className="text-slate-400">
                    Compare this to BFS node generation: <code className="font-mono text-slate-300">{"N(BFS) = 1 + b + b^2 + ... + b^d"}</code>. 
                    Because the number of nodes increases exponentially with depth, the deepest level holds the vast majority of the nodes.
                  </p>
                  <p className="text-cyan-300 font-semibold text-[11px]">
                    Example: At b = 10, d = 5, BFS generates 111,111 nodes. IDS generates 123,456 nodes—only an 11% overhead!
                  </p>
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="text-white block font-bold text-[10px]">Time Complexity</span>
                      <code className="text-slate-400 font-mono">{"O(b^d)"}</code>
                    </div>
                    <div>
                      <span className="text-white block font-bold text-[10px]">Space Complexity</span>
                      <code className="text-slate-400 font-mono">{"O(b * d)"}</code>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 5: UCS Deep Dive */}
          {(activeSection === 'all' || activeSection === '5') && (
            <section id="ref-section-5" className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="text-amber-400 font-mono">5.</span> Uniform Cost Search (UCS) Module
                </h2>
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-mono rounded">Min-PQ Heap</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-350 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-slate-200">Formal Definition & Strategy</h3>
                  <p className="text-slate-400">
                    Uniform Cost Search is an optimal strategy for searching weighted graph grids. Nodes are expanded strictly in order of increasing cumulative path cost from the root:
                    <code className="font-mono text-purple-400 block mt-1">{"g(n) = sum(weight(e_i))"}</code>
                    Rather than exploring level-wise, UCS expands states by following the direction of least cumulative weight.
                  </p>
                </div>

                <div className="p-4 bg-purple-950/10 border border-purple-900/20 rounded-xl space-y-2">
                  <h4 className="font-bold text-purple-300">Priority Queue Behavior & Min-Heap mechanics</h4>
                  <p className="text-slate-400">
                    The fringe is managed using a <strong>Priority Queue (typically a binary Min-Heap)</strong>, where nodes are keyed by their cumulative cost g(n).
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-slate-400 space-y-1">
                    <li><strong className="text-slate-200">Generation vs. Expansion:</strong> The cost to reach a node is not guaranteed to be optimal when it is first generated. An alternative, cheaper path might exist and be discovered later.</li>
                    <li><strong className="text-slate-200">Optimality Guarantee:</strong> The path cost to a node is only guaranteed to be optimal once that node is popped (dequeued) from the Priority Queue. This ensures that no other cheaper path to the node can exist.</li>
                  </ul>
                </div>

                {/* Differences from BFS */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="text-white font-bold">Key Differences: UCS vs. BFS</h4>
                  <p className="text-slate-400">
                    While BFS can be viewed as UCS with uniform step costs (c=1), UCS handles arbitrary positive edge weights and handles them differently:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400">
                    <div className="p-2.5 bg-slate-900 rounded font-sans border border-slate-850">
                      <span className="text-emerald-400 font-semibold block text-[10px]">BFS (Hop-count driven)</span>
                      Goal test occurs during neighbor generation. Terminates immediately when goal is seen.
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded font-sans border border-slate-850">
                      <span className="text-indigo-400 font-semibold block text-[10px]">UCS (Cost-driven)</span>
                      Goal test is deferred until the goal node is dequeued from the priority queue.
                    </div>
                  </div>
                </div>

                {/* Mathematical Proof of Optimality */}
                <div className="border border-slate-800 p-4 rounded-xl space-y-3 bg-slate-950/70">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <GraduationCap className="w-4 h-4" />
                    <span>Mathematical Proof of Optimality</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Let C* be the cost of the optimal solution. Assume all edge costs are bounded below by a positive constant: {"c(u, v) >= \u03B5 > 0"}.
                  </p>
                  <ol className="list-decimal pl-4 text-[11px] text-slate-450 space-y-1.5 align-middle">
                    <li>Assume UCS dequeues a suboptimal goal node G2 with path cost {"g(G2) > C*"}.</li>
                    <li>Because there is an optimal solution branch, there must exist some unexpanded node n on the optimal path to goal G_opt.</li>
                    <li>The cost path to this unexpanded node must be less than or equal to the optimal path: {"g(n) <= C*"}.</li>
                    <li>Since {"g(G2) > C*"} and {"g(n) <= C*"}, we must have {"g(n) < g(G2)"}.</li>
                    <li>This implies that node n must have a smaller cost than G2, so it should have been dequeued before G2. This contradicts the assumption that G2 was dequeued first, proving UCS's optimality on positive edge costs.</li>
                  </ol>
                </div>

                {/* Complexity Analysis */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-200 block font-semibold mb-1">Worst-Case UCS Complexity</span>
                  <p className="text-slate-400 font-sans">
                    Since UCS expands nodes based on cost boundaries, its search space depends directly on the ratio of the optimal cost C* to the minimum possible step cost {"\u03B5"}:
                    <code className="block mt-1 font-mono text-amber-400">{"Time / Space Complexity = O(b^(1 + floor(C* / \u03B5)))"}</code>
                    This worst-case scenario occurs when the search expands many cheap branches before visiting the goal node on a more expensive branch.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 5a: Dynamic Technical Explanation Panel */}
          {(activeSection === 'all' || activeSection === '5a') && (
            <section id="ref-section-5a" className="space-y-4 border-t border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <span className="text-amber-400 font-mono">5a.</span> Dynamic Technical Explanation Panel
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toggle through primary traversal paradigms to inspect formal derivations, specialized pseudocode implementations, and asymptotic correctness bounds dynamically.
              </p>

              {/* Dynamic Algorithm Selector Bar */}
              <div className="grid grid-cols-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold max-w-lg">
                {(['BFS', 'DFS', 'IDS', 'UCS'] as const).map((algo) => (
                  <button
                    key={algo}
                    onClick={() => setSelectedExposAlgo(algo)}
                    className={`py-2 text-center rounded-lg cursor-pointer transition-all ${
                      selectedExposAlgo === algo
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-boldScale font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>

              {/* Interactive Dynamic Explanation Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                
                {/* Formal Definitions & Core Pseudocode */}
                <div className="space-y-4 border border-slate-800/80 rounded-xl bg-slate-950/70 p-4 font-mono text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wider">
                      📋 Formal Definition: {selectedExposAlgo}
                    </span>
                    <p className="text-slate-300 leading-relaxed mt-2 text-[11px] font-sans">
                      {ALGO_DATA[selectedExposAlgo].definition}
                    </p>
                  </div>

                  <div>
                    <span className="text-amber-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wider">
                      💻 Core Algorithmic Pseudocode
                    </span>
                    <pre className="text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap mt-2.5 p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      {ALGO_DATA[selectedExposAlgo].pseudocode}
                    </pre>
                  </div>
                </div>

                {/* Mathematical Derivations & Analytical Correctness */}
                <div className="space-y-4 border border-slate-800/80 rounded-xl bg-slate-950/70 p-4 text-xs font-mono">
                  <div>
                    <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wider">
                      📐 Mathematical Correctness & Complexity Derivation
                    </span>
                    <div className="text-[11px] text-slate-300 leading-relaxed space-y-3 font-sans mt-2.5">
                      {selectedExposAlgo === 'BFS' && (
                        <>
                          <div>
                            <strong className="text-slate-200 block mb-0.5">Completeness proof:</strong> If the branch factor b is finite and a solution exists at depth d, BFS will visit every node above depth d. Thus, it will eventually find the shallowest target in finite steps.
                          </div>
                          <div className="border-t border-slate-800/50 pt-1.5 mt-1.5">
                            <strong className="text-slate-200 block mb-0.5">Derivation of space requirements:</strong> At depth d, the frontier queue occupies the entire bottom-most tier of width <code className="text-amber-450 text-amber-400 font-mono">O(b^d)</code>. It also retains parent nodes, leading to a maximal space consumption of <code className="text-amber-450 text-amber-400 font-mono">O(b^d)</code> bytes.
                          </div>
                        </>
                      )}
                      {selectedExposAlgo === 'DFS' && (
                        <>
                          <div>
                            <strong className="text-slate-200 block mb-0.5">Completeness constraints:</strong> DFS is incomplete in infinite-depth trees or graphs with state cycles, as it might plunge along an endless path and miss solutions. Cyclic guardians are required.
                          </div>
                          <div className="border-t border-slate-800/50 pt-1.5 mt-1.5">
                            <strong className="text-slate-200 block mb-0.5">Derivation of space requirements:</strong> DFS stack only retains the path from root to node, along with unvisited sibling branches. For max depth m, space complexity scales to a linear <code className="text-amber-450 text-amber-400 font-mono">O(b · m)</code>.
                          </div>
                        </>
                      )}
                      {selectedExposAlgo === 'IDS' && (
                        <>
                          <div>
                            <strong className="text-slate-200 block mb-0.5">Optimality and Completeness:</strong> IDS achieves the complete and optimal pathfinding of standard BFS in uniform cost graphs while bypassing memory limitations.
                          </div>
                          <div className="border-t border-slate-800/50 pt-1.5 mt-1.5">
                            <strong className="text-slate-200 block mb-0.5">Asymptotic Bounds:</strong> Time complexity is identical to depth-d BFS, <code className="text-amber-450 text-amber-400 font-mono">O(b^d)</code>, while space is constrained to a linear scale of <code className="text-amber-450 text-amber-400 font-mono">O(b · d)</code>.
                          </div>
                        </>
                      )}
                      {selectedExposAlgo === 'UCS' && (
                        <>
                          <div>
                            <strong className="text-slate-200 block mb-0.5">Optimality proof bounds:</strong> Let C* be the cost of the optimal solution. Because step weights are bounded lower by positive constant <code className="text-amber-450 text-amber-405 font-mono">ε &gt; 0</code>, total cost increases monotonically. Since UCS expands vertices in strict order of non-decreasing path cost, it is guaranteed to visit the optimal goal first.
                          </div>
                          <div className="border-t border-slate-800/50 pt-1.5 mt-1.5">
                            <strong className="text-slate-200 block mb-0.5">Asymptotic Limits:</strong> UCS expands nodes based on total cost limits instead of simple depth:
                            <code className="block mt-1 text-center bg-slate-900 border border-slate-800 py-1 rounded text-emerald-400 font-mono text-[10.5px]">{"Time / Space = O(b^(1 + floor(C* / \u03B5)))"}</code>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] leading-relaxed text-slate-400">
                    <span className="text-slate-200 font-bold block mb-1">💡 Professor's Paradigm Note</span>
                    {selectedExposAlgo === 'BFS' && "Use BFS when step-costs are uniform and physical memory capacity is not a constraint."}
                    {selectedExposAlgo === 'DFS' && "Use DFS when searching deep graphs where solution density is high or memory scale is limited."}
                    {selectedExposAlgo === 'IDS' && "Use IDS as the optimal complete choice under limited storage constraints."}
                    {selectedExposAlgo === 'UCS' && "Use UCS (Dijkstra) when edge weights describe real physical impedances (latency, fuel, distance)."}
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* Section 6: Side-by-Side Comparison Matrix */}
          {(activeSection === 'all' || activeSection === '6') && (
            <section id="ref-section-6" className="space-y-4 border-t border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <span className="text-pink-400 font-mono">6.</span> Side-by-Side Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                This table provides a comprehensive, multi-dimensional comparison of the four algorithms.
              </p>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-mono">
                      <th className="p-2.5 font-bold border-r border-slate-850">Dimension</th>
                      <th className="p-2.5 font-bold text-emerald-400 border-r border-slate-850">BFS</th>
                      <th className="p-2.5 font-bold text-amber-400 border-r border-slate-850">DFS</th>
                      <th className="p-2.5 font-bold text-cyan-400 border-r border-slate-850">IDS</th>
                      <th className="p-2.5 font-bold text-purple-400">UCS (Dijkstra)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400 leading-relaxed">
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Expansion Order</td>
                      <td className="p-2.5 border-r border-slate-850">Level-by-level based on depth hops</td>
                      <td className="p-2.5 border-r border-slate-850">Maximum depth first along current branch</td>
                      <td className="p-2.5 border-r border-slate-850">Depth-limited sequence incremental rounds</td>
                      <td className="p-2.5">Lowest cumulative path cost first g(n)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Fringe Data Structure</td>
                      <td className="p-2.5 border-r border-slate-850 font-semibold text-cyan-400">FIFO Queue (First-In-First-Out)</td>
                      <td className="p-2.5 border-r border-slate-850 font-semibold text-purple-400">LIFO Stack (Last-In-First-Out)</td>
                      <td className="p-2.5 border-r border-slate-850 font-semibold text-amber-400">LIFO Stack with limit checkpoints</td>
                      <td className="p-2.5 font-semibold text-emerald-400">Priority Queue (ordered by path cost g)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Time Complexity</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b^(d+1))"} or {"O(V+E)"}</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b^m)"} or {"O(V+E)"}</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b^d)"}</td>
                      <td className="p-2.5">{"O(b^(1 + floor(C* / \u03B5)))"}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Space Complexity</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b^d)"} or {"O(V)"}</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b * m)"} or {"O(V)"}</td>
                      <td className="p-2.5 border-r border-slate-850">{"O(b * d)"}</td>
                      <td className="p-2.5">{"O(b^(1 + floor(C* / \u03B5)))"}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Completeness</td>
                      <td className="p-2.5 border-r border-slate-850">Yes (if finite b)</td>
                      <td className="p-2.5 border-r border-slate-850">No (loops down infinite depths unless closed list used)</td>
                      <td className="p-2.5 border-r border-slate-850">Yes (if finite b)</td>
                      <td className="p-2.5 font-semibold text-emerald-400">Yes (if edge costs {"\u2265 \u03B5 > 0"})</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Optimality</td>
                      <td className="p-2.5 border-r border-slate-850">Yes (under uniform step weight costs)</td>
                      <td className="p-2.5 border-r border-slate-850">No</td>
                      <td className="p-2.5 border-r border-slate-850">Yes (under uniform step weight costs)</td>
                      <td className="p-2.5 font-semibold text-emerald-400">Optimal under arbitrary positive weights!</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Memory Footprint</td>
                      <td className="p-2.5 border-r border-slate-850">Vast - must cache entire tree boundary layers</td>
                      <td className="p-2.5 border-r border-slate-850">Highly efficient - stores active branch path nodes</td>
                      <td className="p-2.5 border-r border-slate-850">Highly efficient - matches DFS Stack bounds</td>
                      <td className="p-2.5">High - caches the entire active PQ search space frontier</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Best Use Case</td>
                      <td className="p-2.5 border-r border-slate-850">Shortest path in unweighted structures & grids</td>
                      <td className="p-2.5 border-r border-slate-850">Cycle detection, dependency mappings</td>
                      <td className="p-2.5 border-r border-slate-850">Large states with unknown depth limits & limited memory</td>
                      <td className="p-2.5">GPS routing, weighted maps, graph path planning</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-white bg-slate-950/35 border-r border-slate-850">Worst-Case Behavior</td>
                      <td className="p-2.5 border-r border-slate-850">Runs out of RAM quickly on high branching factors</td>
                      <td className="p-2.5 border-r border-slate-850">Trapped down an infinite branch or recursion depth limits</td>
                      <td className="p-2.5 border-r border-slate-850">Slight search overhead from re-expanding root levels</td>
                      <td className="p-2.5">Many low-cost path expansions before discovering goal path</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 7: Depth & Branch Complexity Sandbox Calculator */}
          {(activeSection === 'all' || activeSection === '7') && (() => {
            const totalNodesGenerated = Math.round((Math.pow(b, d + 1) - 1) / (b - 1));
            const fringeNodes = Math.pow(b, d);
            const totalMemoryBytes = (totalNodesGenerated + fringeNodes) * 128;
            const dfsSpaceElements = b * d;
            const dfsMemoryBytes = dfsSpaceElements * 128;
            
            const numNodesUcsApprox = Math.round(Math.pow(b, 1 + (optimalPathCostC / stepCostEpsilon)));
            const ucsMemoryBytes = numNodesUcsApprox * 160;

            const bfsPercent = Math.min(100, Math.max(2, (Math.log10(totalMemoryBytes) / 10) * 100));
            const dfsPercent = Math.min(100, Math.max(2, (Math.log10(dfsMemoryBytes) / 10) * 100));
            const ucsPercent = Math.min(100, Math.max(2, (Math.log10(ucsMemoryBytes) / 10) * 100));

            const formattedMemory = (bytes: number) => {
              if (bytes < 1024) return `${bytes} Bytes`;
              if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
              if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
              return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
            };

            return (
              <section id="ref-section-7" className="space-y-4 border-t border-slate-800 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                      <span className="text-emerald-400 font-mono">7.</span> Technical Complexity Sandbox Calculator
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans">Simulate variations in branching factors and costs to witness tree expansions in real-time.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  {/* Parameter Controller inputs */}
                  <div className="md:col-span-5 space-y-4 md:border-r border-slate-800/60 pr-0 md:pr-5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-2">⚙️ Parameter Matrix</span>
                    
                    {/* Branching Factor slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Branching Factor (b):</span>
                        <span className="text-emerald-400 font-bold bg-slate-900 border border-slate-805 px-1.5 py-0.5 rounded">{b} siblings</span>
                      </div>
                      <input 
                        type="range" min="2" max="10" value={b} 
                        onChange={(e) => setB(Number(e.target.value))} 
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Depth Level slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Shallowest Goal (d):</span>
                        <span className="text-cyan-400 font-bold bg-slate-900 border border-slate-805 px-1.5 py-0.5 rounded">Level {d}</span>
                      </div>
                      <input 
                        type="range" min="1" max="8" value={d} 
                        onChange={(e) => setD(Number(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    {/* Step Cost slider for UCS */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Min Edge Cost (ε):</span>
                        <span className="text-amber-400 font-bold bg-slate-900 border border-slate-805 px-1.5 py-0.5 rounded">{stepCostEpsilon.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0.2" max="3.0" step="0.1" value={stepCostEpsilon} 
                        onChange={(e) => setStepCostEpsilon(Number(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Optimal Path Cost */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">Optimal Path Cost (C*):</span>
                        <span className="text-purple-400 font-bold bg-slate-900 border border-slate-805 px-1.5 py-0.5 rounded">{optimalPathCostC.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="1.0" max="10.0" step="0.5" value={optimalPathCostC} 
                        onChange={(e) => setOptimalPathCostC(Number(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Calculated Sandbox result tracks */}
                  <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">📈 Dynamic Memory Footprint Comparison</span>
                    
                    {/* BFS Memory tracking bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 text-xs">UCS Space: <code className="font-mono text-emerald-400">{"O(b^d)"}</code></span>
                        <span className="font-mono text-emerald-400 font-bold">{formattedMemory(totalMemoryBytes)}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${bfsPercent}%` }} />
                      </div>
                    </div>

                    {/* DFS Memory tracking bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 text-xs">DFS Space: <code className="font-mono text-amber-400">{"O(b * d)"}</code></span>
                        <span className="font-mono text-amber-400 font-bold">{formattedMemory(dfsMemoryBytes)}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${dfsPercent}%` }} />
                      </div>
                    </div>

                    {/* UCS Space memory tracking bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 text-xs">UCS Space: <code className="font-mono text-purple-400">{"O(b^(1 + floor(C* / \u03B5)))"}</code></span>
                        <span className="font-mono text-purple-400 font-bold">{formattedMemory(ucsMemoryBytes)}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${ucsPercent}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-500/5 text-[10px] border border-emerald-500/10 rounded-lg text-slate-400 leading-relaxed font-sans">
                      💡 <strong>Asymptotic Insight:</strong> At branching factor b = {b} and depth d = {d}, the BFS fringe contains <strong className="text-emerald-400">{fringeNodes.toLocaleString()}</strong> leaf nodes, requiring substantial memory overhead. In contrast, IDS only requires <strong className="text-cyan-400">{dfsSpaceElements}</strong> nodes in recursion stack.
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Section 8: Python Reference Implementations */}
          {(activeSection === 'all' || activeSection === '8') && (
            <section id="ref-section-8" className="space-y-4 border-t border-slate-800 pt-6 font-sans">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <span className="text-emerald-400 font-mono">8.</span> Production-Grade Python Reference Code
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click the copy icon to copy production-grade, well-commented implementations for each algorithm.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* BFS Code Block */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800/80">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">breadth_first_search.py</span>
                    <button onClick={() => handleCopy(codeBFS, 'bfs_code')} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer">
                      {copiedText === 'bfs_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3.5 text-[10px] font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[220px]">
                    <code>{codeBFS}</code>
                  </pre>
                </div>

                {/* DFS Code Block */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800/80">
                    <span className="text-xs font-mono text-amber-400 font-semibold">depth_first_search.py</span>
                    <button onClick={() => handleCopy(codeDFS, 'dfs_code')} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer">
                      {copiedText === 'dfs_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3.5 text-[10px] font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[220px]">
                    <code>{codeDFS}</code>
                  </pre>
                </div>

                {/* IDS Code Block */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800/80">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">iterative_deepening.py</span>
                    <button onClick={() => handleCopy(codeIDS, 'ids_code')} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer">
                      {copiedText === 'ids_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3.5 text-[10px] font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[220px]">
                    <code>{codeIDS}</code>
                  </pre>
                </div>

                {/* UCS Code Block */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800/80">
                    <span className="text-xs font-mono text-purple-400 font-semibold">uniform_cost_search.py</span>
                    <button onClick={() => handleCopy(codeUCS, 'ucs_code')} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer">
                      {copiedText === 'ucs_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3.5 text-[10px] font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[220px]">
                    <code>{codeUCS}</code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Section 9: Interactive Learning Quiz */}
          {(activeSection === 'all' || activeSection === '9') && (
            <section id="ref-section-9" className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="text-amber-400 font-mono">9.</span> Interactive Learning Quiz
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 animate-spin" /> PRACTICE PANEL
                </span>
              </div>

              {!quizCompleted ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  {/* Progress Header */}
                  <div className="flex justify-between items-center text-xs font-mono border-b border-slate-850 pb-3">
                    <span className="text-slate-400">Question {currentQuestionIndex + 1} of {QuizQuestions.length}</span>
                    <span className="text-emerald-400 font-bold">Accuracy: {quizScore} / {QuizQuestions.length}</span>
                  </div>

                  {/* Question Prompt */}
                  <h3 className="text-sm font-semibold text-white leading-relaxed font-sans">
                    {QuizQuestions[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {QuizQuestions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      const isCorrectAnswer = idx === QuizQuestions[currentQuestionIndex].correctIndex;
                      
                      let optionStyle = "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-850/65";
                      if (showExplanation) {
                        if (isCorrectAnswer) {
                          optionStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold";
                        } else if (isSelected) {
                          optionStyle = "bg-red-500/10 text-red-400 border-red-500/40";
                        } else {
                          optionStyle = "border-slate-850 text-slate-500 bg-slate-950/20";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-400";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showExplanation}
                          onClick={() => handleSelectAnswer(idx)}
                          className={`w-full text-left text-xs p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-slate-750 flex items-center justify-center font-mono text-[10px] shrink-0 bg-slate-950">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 pt-0.5">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {showExplanation && (
                    <div className="p-4 bg-slate-900/90 border border-slate-855 rounded-xl space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Lightbulb className="w-4 h-4 text-emerald-400" />
                        <span>Explanation</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {QuizQuestions[currentQuestionIndex].explanation}
                      </p>
                      
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleNextQuestion}
                          className="px-4.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10 align-middle"
                        >
                          <span>{currentQuestionIndex === QuizQuestions.length - 1 ? 'Finish' : 'Next Question'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-xl font-sans">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/35 rounded-full flex items-center justify-center mx-auto text-amber-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Quiz Completed Successfully!</h3>
                    <p className="text-xs text-slate-450 mt-1">Fantastic job wrapping up this theoretical evaluation round.</p>
                  </div>
                  
                  <div className="max-w-xs mx-auto bg-slate-900 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block font-mono">Your Score</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block font-mono">
                      {Math.round((quizScore / QuizQuestions.length) * 100)}%
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">({quizScore} of {QuizQuestions.length} answered correctly)</span>
                  </div>

                  <button
                    onClick={resetQuiz}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-500/10 font-mono"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
