import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Network, 
  Grid3X3, 
  HelpCircle, 
  GraduationCap, 
  X, 
  Columns, 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Layers,
  Award,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EducationalHandbook from './components/EducationalHandbook';
import AlgorithmSimulator from './components/AlgorithmSimulator';
import GridSimulator from './components/GridSimulator';

type WorkspaceTab = 'graph' | 'grid';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('graph');
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Tracks screen dimensions for responsive layout shifts
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // run initially
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP HEADER BAR */}
      <header className={`sticky top-0 z-40 px-4 md:px-6 py-4 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md shadow-sm'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger to bring drawer for Educational Handbook */}
            {isMobile && (
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Toggle Syllabus Guide Index"
                className={`p-2 rounded-lg border transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}

            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/15 text-slate-950">
              <Network className="w-5.5 h-5.5 stroke-[2.5px]" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold font-display tracking-tight leading-none flex items-center gap-2">
                Responsive AI Search Lab
              </h1>
              <p className={`text-[10px] md:text-xs font-semibold mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Interactive BFS, DFS, IDS & UCS Visualization Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700/80 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Tutorial toggle */}
            <button
              onClick={() => setShowTutorial(prev => !prev)}
              aria-label="Toggle Tutorial Quick Guide"
              className={`hidden sm:flex px-3 py-1.5 border text-xs font-semibold rounded-lg items-center gap-1.5 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-250 text-slate-700 hover:bg-slate-200'}`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" /> Quick Guide
            </button>

            <span className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-700/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`text-[10px] uppercase font-mono tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-550'}`}>Live Preview v2.0</span>
            </span>
          </div>

        </div>
      </header>

      {/* 2. DYNAMIC DISMISSIBLE TUTORIAL BOARD BANNER */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`border-b px-4 md:px-6 py-4 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800/80' : 'bg-emerald-50/50 border-slate-200'}`}
          >
            <div className="max-w-7xl mx-auto flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-5xl">
                  <h2 className="text-xs md:text-sm font-semibold text-emerald-500 flex items-center gap-1.5">
                    Dual-Pane Interactive Classroom Layout
                  </h2>
                  <p className={`text-[11px] md:text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-650'}`}>
                    Welcome! Designed for frontend engineers and computer science studies, this system dynamically couples an <strong>Academic Theory Handbook (Left Pane)</strong> with a <strong>Live Pathfinding Simulator Sandbox (Right Pane)</strong>. Review theoretical proofs, step run cycles, and customize graph meshes or 2D barrier grids dynamically.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                aria-label="Dismiss tutorial guide"
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN ADAPTIVE WORKSPACE GRID */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLLAPSIBLE SIDEBAR: Academic Handbook (Col span depends on state) */}
        {!isMobile && (
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-5'} flex flex-col min-h-0`}>
            
            {/* Header with Collapsible Trigger Button */}
            <div className={`p-3.5 border rounded-t-2xl flex justify-between items-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-2 select-none overflow-hidden">
                <BookOpen className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-xs font-bold uppercase tracking-wider truncate">
                    📘 Course Syllabus Index
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                aria-label={isSidebarCollapsed ? "Expand Handbook Sidebar" : "Collapse Handbook Sidebar"}
                className={`p-1 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-slate-850' : 'hover:bg-slate-200'}`}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-emerald-400" /> : <ChevronLeft className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Render internal state based on collapse bounds */}
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'h-0 opacity-0 pointer-events-none lg:h-auto lg:opacity-100' : 'h-auto opacity-100'}`}>
              {!isSidebarCollapsed ? (
                <div className="border-x border-b rounded-b-2xl overflow-hidden transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0' }}>
                  <EducationalHandbook />
                </div>
              ) : (
                <div className={`p-4 border rounded-b-2xl flex flex-col items-center gap-4 text-xs text-center border-t-0 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <GraduationCap className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <span className="writing-vertical text-slate-500 font-mono tracking-widest text-[9px] uppercase pt-2">Theory Inactive</span>
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded mt-2 cursor-pointer border border-emerald-500/20 text-[10px]"
                  >
                    Open
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* INTERACTIVE WORKSPACE RIGHT COLUMN (Col width scales up when Left side collapses) */}
        <div className={`transition-all duration-300 flex flex-col gap-5 ${isMobile ? 'col-span-1' : isSidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-7'}`}>
          
          {/* CONTROL SWITCH PANEL - Choose between structural path routers */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-2xl gap-3 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-2">
              <Columns className="w-4.5 h-4.5 text-emerald-405" />
              <span className="text-xs font-bold uppercase tracking-wider">🔬 Interactive Sandbox Core</span>
            </div>

            {/* Navigation tab bar */}
            <div className={`flex p-0.5 rounded-lg text-xs w-full sm:w-auto border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-250'}`}>
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-md font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'graph' 
                    ? theme === 'dark' 
                      ? 'bg-slate-800 text-white font-bold' 
                      : 'bg-white text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> Graph Router
              </button>
              <button
                onClick={() => setActiveTab('grid')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-md font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'grid' 
                    ? theme === 'dark'
                      ? 'bg-slate-800 text-white font-bold' 
                      : 'bg-white text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" /> Grid Mesh
              </button>
            </div>
          </div>

          {/* SIMULATOR RENDERING SPACE */}
          <div className="flex-1">
            {activeTab === 'graph' ? (
              <AlgorithmSimulator />
            ) : (
              <GridSimulator />
            )}
          </div>

        </div>

      </main>

      {/* MOBILE COLLAPSIBLE CURRICULUM DRAWER OVERLAY */}
      {isMobile && (
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              {/* Back backdrop layer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black z-50 pointer-events-auto"
              />

              {/* Sidebar content container slider */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-50 p-4 overflow-y-auto shadow-2xl flex flex-col gap-4 ${theme === 'dark' ? 'bg-slate-950 text-slate-100 border-r border-slate-800' : 'bg-slate-50 text-slate-900'}`}
              >
                <div className="flex justify-between items-center border-b pb-3 border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-450" />
                    <span className="text-sm font-bold uppercase tracking-wider font-display">Syllabus Curriculum</span>
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`p-1 rounded-lg border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <EducationalHandbook />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* 4. FOOTER STATUS BAR */}
      <footer className={`border-t p-5 text-center text-xs transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850 text-slate-500' : 'bg-white border-slate-200 text-slate-600 shadow-inner'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 AI Search Classroom & Masterclass Lab. Powered by Open-Source React.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> BFS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> DFS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> IDS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> UCS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
