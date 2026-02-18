
import React, { useState, useCallback, useMemo } from 'react';
import { QubitState, GateType, HistoryEntry, CalculationDetails } from './types';
import { INITIAL_STATE, applyGateWithDetails, getBlochCoordinates, formatComplex } from './services/quantumUtils';
import BlochSphere from './components/BlochSphere';
import GateControls from './components/GateControls';
import CalculationPanel from './components/CalculationPanel';
import { Activity, History, Settings2, Sparkles, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<QubitState>(INITIAL_STATE);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastCalc, setLastCalc] = useState<CalculationDetails | null>(null);

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
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Sidebar - Controls */}
      <div className="w-80 border-r border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
            <Sparkles className="text-sky-400" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">BlochVis</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Quantum Simulator</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <GateControls onApplyGate={handleApplyGate} onReset={handleReset} />
          
          {/* History */}
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
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* State Display Header */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Qubit State</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Bra-Ket Notation</p>
                <div className="math-font text-2xl font-light text-slate-100 flex items-center gap-2">
                  <span>|ψ⟩ =</span>
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-400">({formatComplex(state.alpha)})</span>
                    <span className="text-xs text-slate-600 mt-1">|0⟩</span>
                  </div>
                  <span>+</span>
                  <div className="flex flex-col items-center">
                    <span className="text-sky-400">({formatComplex(state.beta)})</span>
                    <span className="text-xs text-slate-600 mt-1">|1⟩</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Spherical Coordinates</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 math-font text-xs">
                    <span className="text-slate-400">θ (alt):</span>
                    <span className="text-slate-100">{coords.theta.toFixed(3)} rad</span>
                    <span className="text-slate-400">φ (az):</span>
                    <span className="text-slate-100">{coords.phi.toFixed(3)} rad</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Cartesian Vector</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 math-font text-xs">
                    <span className="text-slate-400">X:</span>
                    <span className="text-slate-100">{coords.x.toFixed(3)}</span>
                    <span className="text-slate-400">Y:</span>
                    <span className="text-slate-100">{coords.y.toFixed(3)}</span>
                    <span className="text-slate-400">Z:</span>
                    <span className="text-slate-100">{coords.z.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 mb-4">
               <Settings2 size={18} className="text-sky-400" />
               <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Probabilities</h2>
            </div>
            <div className="space-y-4">
              <div className="w-48">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400">P(|0⟩)</span>
                  <span className="text-emerald-400 font-bold">{p0.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${p0}%` }}
                  />
                </div>
              </div>
              <div className="w-48">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400">P(|1⟩)</span>
                  <span className="text-sky-400 font-bold">{p1.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
                    style={{ width: `${p1}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 p-8 pt-64 pb-24">
          <BlochSphere coords={coords} />
        </div>

        {/* Calculation Details Overlay */}
        <CalculationPanel details={lastCalc} />

        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default App;
