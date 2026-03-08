
// App.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { QubitState, GateType, HistoryEntry, CalculationDetails } from './types';
import { INITIAL_STATE, applyGateWithDetails, getBlochCoordinates, formatComplex } from './services/quantumUtils';
import BlochSphere from './components/BlochSphere';
import GateControls from './components/GateControls';
import CalculationPanel from './components/CalculationPanel';
import AIChatPanel from './components/AIChatPanel';
import { Activity, History, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<QubitState>(INITIAL_STATE);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastCalc, setLastCalc] = useState<CalculationDetails | null>(null);
  const [isStateExpanded, setIsStateExpanded] = useState(false);

  const handleApplyGate = useCallback((gate: GateType, theta?: number) => {
    const gateName = gate.length > 2 ? gate : `Gate ${gate}`;
    
    setState((prev) => {
      const { newState, details } = applyGateWithDetails(prev, gate, gateName, theta);
      setLastCalc(details);
      setHistory((h) => [{ gate, timestamp: Date.now(), state: newState }, ...h].slice(0, 10));
      return newState;
    });
  }, []);

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE);
    setHistory([]);
    setLastCalc(null);
  }, []);

  const coords = useMemo(() => getBlochCoordinates(state), [state]);

  const p0 = useMemo(() => {
    const val = (Math.pow(state.alpha.re || 0, 2) + Math.pow(state.alpha.im || 0, 2)) * 100;
    return Math.max(0, Math.min(100, val));
  }, [state.alpha]);

  const p1 = useMemo(() => {
    const val = (Math.pow(state.beta.re || 0, 2) + Math.pow(state.beta.im || 0, 2)) * 100;
    return Math.max(0, Math.min(100, val));
  }, [state.beta]);

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - Controls */}
      <div className="w-80 border-r border-slate-800 bg-[#0f172a] flex flex-col p-6 z-30 shadow-2xl shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
            <Sparkles className="text-sky-400" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-white">BlochVis</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Quantum Simulator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <GateControls onApplyGate={handleApplyGate} onReset={handleReset} />
          
          <div className="mt-10 border-t border-slate-800/50 pt-8">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <History size={16} />
              <h3 className="text-sm font-semibold">Step History</h3>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No gates applied yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div key={entry.timestamp} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg border border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-sky-500/10 text-sky-400 rounded-md text-[10px] font-bold border border-sky-500/20">
                        {entry.gate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    {i === 0 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase font-bold tracking-tighter">Current</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <BookOpen size={16} className="text-indigo-400" />
             </div>
             <div className="text-[10px] text-slate-400">
                <p>Drag to rotate sphere</p>
                <p>Scroll to zoom</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col bg-[#020617]">
        {/* 3D Visualization Layer */}
        <div className="absolute inset-0 z-0 flex">
          <div className="flex-1 w-full h-full relative">
            <BlochSphere coords={coords} />
          </div>
        </div>

        {/* Overlay Layers */}
        <div className="relative z-20 w-full h-full flex flex-col pointer-events-none p-8">
          <div className="flex justify-between items-start w-full">
            <div className={`bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl pointer-events-auto min-w-[320px] transition-all duration-500 ease-in-out overflow-hidden ${isStateExpanded ? 'p-6' : 'p-4'}`}>
              <button 
                onClick={() => setIsStateExpanded(!isStateExpanded)}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">State Vector</h2>
                </div>
                {isStateExpanded ? <ChevronUp size={16} className="text-slate-500 group-hover:text-slate-300" /> : <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300" />}
              </button>
              
              <div className={`flex flex-col gap-6 transition-all duration-500 ease-in-out ${isStateExpanded ? 'mt-6 opacity-100 max-h-[1000px]' : 'mt-0 opacity-0 max-h-0'}`}>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Amplitudes</p>
                  <div className="math-font text-lg font-light text-slate-100 flex items-center gap-2">
                    <span>|ψ⟩ =</span>
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-400">{formatComplex(state.alpha)}</span>
                      <span className="text-[10px] text-slate-600 mt-1 font-bold">|0⟩</span>
                    </div>
                    <span className="text-slate-600 text-lg">+</span>
                    <div className="flex flex-col items-center">
                      <span className="text-sky-400">{formatComplex(state.beta)}</span>
                      <span className="text-[10px] text-slate-600 mt-1 font-bold">|1⟩</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 rounded bg-slate-950/40">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 opacity-70">Spherical</p>
                    <div className="flex flex-col math-font text-[10px] gap-1">
                      <div className="flex justify-between"><span className="text-slate-600">θ:</span> <span className="text-slate-100">{coords.theta.toFixed(3)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">φ:</span> <span className="text-slate-100">{coords.phi.toFixed(3)}</span></div>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 opacity-70">Cartesian</p>
                    <div className="flex flex-col math-font text-[10px] gap-1">
                      <div className="flex justify-between"><span className="text-slate-600">X:</span> <span className="text-slate-100">{coords.x.toFixed(3)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Y:</span> <span className="text-slate-100">{coords.y.toFixed(3)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Z:</span> <span className="text-slate-100">{coords.z.toFixed(3)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-tighter">
                      <span className="text-emerald-400">Pr(|0⟩)</span>
                      <span className="text-slate-400">{p0.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${p0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-tighter">
                      <span className="text-sky-400">Pr(|1⟩)</span>
                      <span className="text-slate-400">{p1.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${p1}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1" />
          </div>
        </div>
        
        {/* Floating Calculation Panel */}
        <CalculationPanel details={lastCalc} />
      </div>

      <AIChatPanel state={state} history={history} coords={coords} />
    </div>
  );
};

export default App;
