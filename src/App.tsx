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
  Cpu,
  Github,
  Globe,
  ExternalLink,
  Wifi,
  WifiOff,
  Download
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

  // Progressive Web Application (PWA) Offline & Install States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);

  // Handle network transition states
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Web App Installation Prompts
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detect if running as standalone PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true
    ) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null);
  };

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

            {/* PWA Connection Status Badge */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-700/40">
              {isOnline ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider border ${
                  theme === 'dark' 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">ONLINE</span>
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider border animate-pulse ${
                  theme === 'dark' 
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                    : 'bg-amber-50 border-amber-200 text-amber-600 font-bold'
                }`}>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>OFFLINE</span>
                </span>
              )}
            </div>

            {/* Offline App Install Button Prompter */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Install Offline</span>
              </button>
            )}

            <a 
              href="https://fsferdows.vercel.app/" 
              target="_blank" 
              rel="noreferrer referrer"
              className={`hidden md:flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                theme === 'dark' 
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-emerald-400 hover:text-emerald-300' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-600 hover:text-emerald-500'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>FS FERDOWS</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
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
                <div className="flex flex-col gap-4">
                  <div className="border-x border-b rounded-b-2xl overflow-hidden transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0' }}>
                    <EducationalHandbook theme={theme} />
                  </div>

                  {/* Lead Architect & Developer Card */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm relative overflow-hidden ${
                    theme === 'dark' 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/30' 
                      : 'bg-white border-slate-200 hover:border-emerald-500/30 shadow-sm'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="flex gap-3.5 items-center">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-[2px] shadow-md shadow-emerald-500/10">
                          <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-sm ${
                            theme === 'dark' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-50 text-emerald-600 font-extrabold'
                          }`}>
                            FS
                          </div>
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">Lab Lead Architect</span>
                        <h3 className={`text-sm font-extrabold leading-tight mt-0.5 truncate ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          FS FERDOWS
                        </h3>
                        <p className={`text-[10px] font-sans ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          UX Engineer &amp; Full-Stack Specialist
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/10 dark:border-slate-800/65 flex items-center gap-3">
                      <a 
                        href="https://github.com/fsferdows/" 
                        target="_blank" 
                        rel="noreferrer referrer" 
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors flex-1 justify-center ${
                          theme === 'dark' 
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub
                      </a>
                      
                      <a 
                        href="https://fsferdows.vercel.app/" 
                        target="_blank" 
                        rel="noreferrer referrer" 
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-1 flex-1 justify-center"
                      >
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
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
              <AlgorithmSimulator theme={theme} />
            ) : (
              <GridSimulator theme={theme} />
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

                <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                  <EducationalHandbook theme={theme} />
                  
                  {/* Mobile Developer Card */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm relative overflow-hidden shrink-0 ${
                    theme === 'dark' 
                      ? 'bg-slate-900/60 border-slate-800' 
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="flex gap-3.5 items-center">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-[2px] shadow-md shadow-emerald-500/10">
                          <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${
                            theme === 'dark' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-50 text-emerald-600 font-extrabold'
                          }`}>
                            FS
                          </div>
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 font-bold block">Lab Author</span>
                        <h3 className={`text-xs font-bold leading-tight truncate ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          FS FERDOWS
                        </h3>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-800/10 dark:border-slate-800/65 flex items-center gap-2">
                      <a 
                        href="https://github.com/fsferdows/" 
                        target="_blank" 
                        rel="noreferrer referrer" 
                        className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg border flex items-center justify-center gap-1 cursor-pointer transition-colors flex-1 ${
                          theme === 'dark' 
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Github className="w-3 h-3 text-slate-400" /> GitHub
                      </a>
                      
                      <a 
                        href="https://fsferdows.vercel.app/" 
                        target="_blank" 
                        rel="noreferrer referrer" 
                        className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-0.5 flex-1"
                      >
                        <Globe className="w-3 h-3" /> Portfolio <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* 4. FOOTER STATUS BAR */}
      <footer className={`border-t p-5 text-center text-xs transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850 text-slate-500' : 'bg-white border-slate-200 text-slate-600 shadow-inner'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <p>© 2026 AI Search Classroom & Masterclass Lab. Powered by Open-Source React.</p>
            <p className="text-[11px] text-slate-400">
              Architectured &amp; Programmed with 💚 by{' '}
              <a 
                href="https://github.com/fsferdows/" 
                target="_blank" 
                rel="noreferrer referrer" 
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-0.5"
              >
                FS FERDOWS
              </a>{' '}
              ·{' '}
              <a 
                href="https://fsferdows.vercel.app/" 
                target="_blank" 
                rel="noreferrer referrer" 
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                Portfolio <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> BFS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> DFS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> IDS</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> UCS</span>
          </div>
        </div>
      </footer>

      {/* 5. DYNAMIC OFFLINE/ONLINE CONNECTION RESTORED TOAST */}
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 bg-slate-900 border-emerald-500/30 text-white max-w-sm"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 font-display">Cloud Status Restored</h4>
              <p className="text-[10px] text-slate-300 leading-normal mt-0.5">
                Reconnected to the server! Cached pathfinding assets and classrooms synced seamlessly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
