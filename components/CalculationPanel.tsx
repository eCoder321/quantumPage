
import React, { useState } from 'react';
import { CalculationDetails } from '../types';
import { formatComplex } from '../services/quantumUtils';
import { ChevronUp, ChevronDown, Binary, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { multiply, Complex, complex } from 'mathjs';

interface CalculationPanelProps {
  details: CalculationDetails | null;
}

const toComplex = (val: any): Complex => {
  if (typeof val === 'number') return complex(val, 0);
  if (val && typeof val.re === 'number') return val as Complex;
  return complex(0, 0);
};

const CalculationPanel: React.FC<CalculationPanelProps> = ({ details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!details) return null;

  const m = details.matrix;
  // Use .get if available (MathJS Matrix), otherwise index into Array
  const getEl = (r: number, c: number) => toComplex(m.get ? m.get([r, c]) : m[r][c]);

  const g00 = getEl(0, 0);
  const g01 = getEl(0, 1);
  const g10 = getEl(1, 0);
  const g11 = getEl(1, 1);

  const a = details.input.alpha;
  const b = details.input.beta;

  const step1_a = multiply(g00, a);
  const step1_b = multiply(g01, b);
  const step2_a = multiply(g10, a);
  const step2_b = multiply(g11, b);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-500 pointer-events-auto">
      <div className={`bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[600px]' : 'max-h-16'}`}>
        
        {/* Header Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-16 px-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Calculator size={18} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Last Transformation</span>
              <span className="text-sm font-bold text-slate-100">{details.gateName} Applied</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
               <span className="text-[10px] text-slate-400 math-font">|ψ⟩ → {details.gateId}|ψ⟩</span>
            </div>
            {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
          </div>
        </button>

        {/* Math Content */}
        <div className="p-8 pt-0 overflow-y-auto max-h-[500px] custom-scrollbar text-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            
            {/* Step 1: Matrix Multiplication */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Binary size={14} /> Matrix Multiplication Step
                </h4>
                
                <div className="flex items-center justify-start gap-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800 math-font overflow-x-auto">
                  {/* Gate Matrix */}
                  <div className="flex items-center">
                    <span className="text-2xl mr-1">[</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-4">
                        <span className="text-emerald-400 min-w-[60px] text-center">{formatComplex(g00, 2)}</span>
                        <span className="text-emerald-400 min-w-[60px] text-center">{formatComplex(g01, 2)}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-emerald-400 min-w-[60px] text-center">{formatComplex(g10, 2)}</span>
                        <span className="text-emerald-400 min-w-[60px] text-center">{formatComplex(g11, 2)}</span>
                      </div>
                    </div>
                    <span className="text-2xl ml-1">]</span>
                  </div>

                  <span className="text-slate-600">×</span>

                  {/* Input Vector */}
                  <div className="flex items-center">
                    <span className="text-2xl mr-1">[</span>
                    <div className="flex flex-col gap-2">
                      <span className="text-sky-400 text-center">{formatComplex(a, 2)}</span>
                      <span className="text-sky-400 text-center">{formatComplex(b, 2)}</span>
                    </div>
                    <span className="text-2xl ml-1">]</span>
                  </div>

                  <span className="text-slate-600">=</span>

                  {/* Result Steps */}
                  <div className="flex items-center text-[10px] lg:text-xs">
                    <span className="text-2xl mr-1">[</span>
                    <div className="flex flex-col gap-3">
                      <div className="whitespace-nowrap">
                        <span className="text-emerald-500/80">({formatComplex(g00, 2)} · {formatComplex(a, 2)})</span> + <span className="text-sky-500/80">({formatComplex(g01, 2)} · {formatComplex(b, 2)})</span>
                      </div>
                      <div className="whitespace-nowrap">
                        <span className="text-emerald-500/80">({formatComplex(g10, 2)} · {formatComplex(a, 2)})</span> + <span className="text-sky-500/80">({formatComplex(g11, 2)} · {formatComplex(b, 2)})</span>
                      </div>
                    </div>
                    <span className="text-2xl ml-1">]</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Row Calculations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/50 text-[11px] math-font">
                      <p className="text-slate-500 mb-1">Row 1 (α'):</p>
                      <p className="text-slate-200">{formatComplex(step1_a as any, 3)} + {formatComplex(step1_b as any, 3)}</p>
                      <p className="text-emerald-400 font-bold mt-1">= {formatComplex(details.rawResult.alpha, 3)}</p>
                   </div>
                   <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/50 text-[11px] math-font">
                      <p className="text-slate-500 mb-1">Row 2 (β'):</p>
                      <p className="text-slate-200">{formatComplex(step2_a as any, 3)} + {formatComplex(step2_b as any, 3)}</p>
                      <p className="text-sky-400 font-bold mt-1">= {formatComplex(details.rawResult.beta, 3)}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Step 2: Global Phase Normalization */}
            <div className="space-y-6">
              <div className="space-y-4 h-full flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-400" /> Bloch Normalization
                </h4>
                
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    To show the vector on the sphere, we remove the "Global Phase". We multiply by <code className="text-indigo-300 bg-indigo-500/10 px-1 rounded">e^(-iφ)</code> so the first part (α) becomes a real number.
                  </p>
                  
                  {details.phaseCorrection ? (
                    <div className="space-y-4 math-font text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">Phase factor:</span>
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{formatComplex(details.phaseCorrection, 4)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="flex flex-col items-center">
                            <span className="text-slate-400">Final α</span>
                            <span className="text-emerald-400 font-bold">{formatComplex(details.finalResult.alpha, 3)}</span>
                         </div>
                         <ArrowRight size={14} className="text-slate-600" />
                         <div className="flex flex-col items-center">
                            <span className="text-slate-400">Final β</span>
                            <span className="text-sky-400 font-bold">{formatComplex(details.finalResult.beta, 3)}</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No phase correction needed for this state.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationPanel;
