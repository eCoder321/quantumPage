
import React, { useState } from 'react';
import { GateType, GateInfo } from '../types';
import { RotateCw, RefreshCcw, Info, Box, AlertCircle } from 'lucide-react';

const GATE_LIST: GateInfo[] = [
  { id: 'I', name: 'Identity', description: 'The "No-Change" gate.', simpleExplanation: "Does nothing at all! It's the same as waiting for 1 second without moving.", matrixLabel: '[1 0; 0 1]' },
  { id: 'X', name: 'Pauli-X', description: 'Flips the qubit over the X-axis.', simpleExplanation: "The 'Flip-Over' gate. It turns the qubit upside down! If it was at the top (|0⟩), it goes to the bottom (|1⟩).", matrixLabel: '[0 1; 1 0]' },
  { id: 'Y', name: 'Pauli-Y', description: 'Flips and twists the qubit.', simpleExplanation: "Similar to flipping, but it takes a 'sideways' path. It moves $|0\rangle$ to $|1\rangle$, but also changes the phase (the 'twirl').", matrixLabel: '[0 -i; i 0]' },
  { id: 'Z', name: 'Pauli-Z', description: 'Twirls the qubit around the vertical pole.', simpleExplanation: "The 'Twirl' gate. It spins the qubit around the vertical axis. Note: If the qubit is exactly at the top or bottom, you won't see it move!", matrixLabel: '[1 0; 0 -1]' },
  { id: 'H', name: 'Hadamard', description: 'Creates a 50/50 state.', simpleExplanation: "The 'Coin-Toss' gate. It puts the qubit exactly in the middle (the equator), halfway between top and bottom!", matrixLabel: '1/√2[1 1; 1 -1]' },
  { id: 'S', name: 'Phase (S)', description: 'Quarter-twirl (90°) around Z.', simpleExplanation: "A small twirl! Like a quarter-turn for a dancing qubit. (Only visible if not at the poles!)", matrixLabel: '[1 0; 0 i]' },
  { id: 'T', name: 'T-gate', description: 'Tiny-twirl (45°) around Z.', simpleExplanation: "An even smaller twirl! Just an eighth-turn around the center pole.", matrixLabel: '[1 0; 0 e^{iπ/4}]' },
  { id: 'RX', name: 'RX(θ)', description: 'Rotate around X.', simpleExplanation: "Use the slider below to choose exactly how much to flip!", matrixLabel: 'RotX(θ)' },
  { id: 'RY', name: 'RY(θ)', description: 'Rotate around Y.', simpleExplanation: "Use the slider below to choose exactly how much to spin sideways!", matrixLabel: 'RotY(θ)' },
  { id: 'RZ', name: 'RZ(θ)', description: 'Rotate around Z.', simpleExplanation: "Use the slider below to choose exactly how much to twirl!", matrixLabel: 'RotZ(θ)' },
];

interface GateControlsProps {
  onApplyGate: (gate: GateType, theta?: number) => void;
  onReset: () => void;
}

const GateControls: React.FC<GateControlsProps> = ({ onApplyGate, onReset }) => {
  const [theta, setTheta] = useState(Math.PI / 4);
  const [activeGate, setActiveGate] = useState<GateInfo | null>(null);

  const displayGate = activeGate || GATE_LIST[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Quantum Gates</h3>
        <button 
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCcw size={14} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {GATE_LIST.slice(0, 7).map((gate) => (
          <button
            key={gate.id}
            onMouseEnter={() => setActiveGate(gate)}
            onClick={() => {
                setActiveGate(gate);
                onApplyGate(gate.id);
            }}
            className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
              activeGate?.id === gate.id 
              ? 'bg-sky-500/20 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
              : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-sky-500/30'
            }`}
          >
            <span className="text-lg font-bold text-sky-400">{gate.id}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Detail Section */}
      <div className="p-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-inner overflow-hidden min-h-[180px] flex flex-col justify-between">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/20 rounded-lg">
                <Info size={14} className="text-sky-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">{displayGate.name}</h4>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            {displayGate.simpleExplanation}
          </p>
          
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 mb-2">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
               <Box size={10} /> The Math Rule
            </p>
            <div className="math-font text-[10px] text-emerald-400 whitespace-nowrap overflow-x-auto">
              {displayGate.matrixLabel}
            </div>
          </div>

          {(displayGate.id === 'Z' || displayGate.id === 'S' || displayGate.id === 'T' || displayGate.id === 'RZ') && (
            <div className="flex items-start gap-1.5 text-[9px] text-amber-500 bg-amber-500/5 p-1.5 rounded border border-amber-500/20">
                <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
                <span>If the vector is at the very top or bottom, Z-rotations won't show any movement! Try a <strong>Hadamard (H)</strong> first!</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Continuous Rotations</span>
          <span className="text-[10px] text-slate-500 math-font">θ = {(theta / Math.PI).toFixed(2)}π</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={2 * Math.PI} 
          step="0.01" 
          value={theta} 
          onChange={(e) => setTheta(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-3"
        />

        <div className="grid grid-cols-3 gap-2">
          {['RX', 'RY', 'RZ'].map((gateId) => {
            const gate = GATE_LIST.find(g => g.id === gateId)!;
            return (
              <button
                key={gateId}
                onMouseEnter={() => setActiveGate(gate)}
                onClick={() => {
                    setActiveGate(gate);
                    onApplyGate(gateId as GateType, theta);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border ${
                  activeGate?.id === gateId 
                  ? 'bg-sky-500/20 border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]' 
                  : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-xs font-bold text-sky-400">{gateId}</span>
                <RotateCw size={10} className="mt-0.5 text-slate-500" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GateControls;
