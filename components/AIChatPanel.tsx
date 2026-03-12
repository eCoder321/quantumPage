
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, ChevronRight, ChevronLeft, User, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { QubitState, HistoryEntry, BlochCoordinates } from '../types';
import { formatComplex } from '../services/quantumUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  state: QubitState;
  history: HistoryEntry[];
  coords: BlochCoordinates;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ state, history, coords }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your **Quantum Guide**. I've initialized your qubit to a custom superposition state. Try applying a gate or ask me how this state is represented on the Bloch sphere!" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const lastGate = history.length > 0 ? history[0].gate : 'None';

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `
        CURRENT QUBIT STATE:
        - alpha (amplitude of |0>): ${formatComplex(state.alpha)}
        - beta (amplitude of |1>): ${formatComplex(state.beta)}
        - Bloch Sphere Coordinates: X=${coords.x.toFixed(3)}, Y=${coords.y.toFixed(3)}, Z=${coords.z.toFixed(3)}
        - Last Gate Applied: ${lastGate}
        - History Path: ${history.map(h => h.gate).reverse().join(' -> ')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          {
            role: 'user',
            parts: [{ text: `CONTEXT:\n${context}\n\nUSER QUESTION: ${text}` }]
          }
        ],
        config: {
          systemInstruction: `You are a world-class Quantum Computing expert. 
          FORMATTING RULES:
          1. Use LaTeX for ALL mathematical symbols, states, and equations. Use single dollar signs ($) for inline math and double dollar signs ($$) for block math.
          2. ALWAYS represent the state as $|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$.
          3. Use bolding and lists (Markdown) to make your explanations easy to scan.
          4. If explaining a gate, describe its geometric rotation on the Bloch sphere clearly.
          5. Keep responses concise but high-quality.
          6. Address the user's specific context provided (the alpha/beta values and the last gate applied).`,
          temperature: 0.7,
        }
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text || "I'm sorry, I couldn't process that. Can you try again?" 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please ensure you have a valid internet connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative flex transition-all duration-500 ease-in-out ${isOpen ? 'w-[400px]' : 'w-12'} border-l border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl z-40`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50 shadow-lg"
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {isOpen ? (
        <div className="flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <MessageSquare size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Quantum Guide</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Informed Assistant</span>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-900/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-sky-500/10 border border-sky-500/20 text-slate-200 rounded-tr-none' 
                  : 'bg-slate-800/40 border border-slate-700/50 text-slate-300 rounded-tl-none shadow-xl'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2 opacity-40">
                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                    <span className="text-[9px] uppercase font-bold tracking-widest">
                      {msg.role === 'user' ? 'Explorer' : 'Expert'}
                    </span>
                  </div>
                  
                  <div className={`prose prose-invert prose-xs max-w-none ${msg.role === 'assistant' ? 'text-slate-300' : 'text-slate-200'}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={14} className="text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-medium italic">Simulating logic...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleSend("Explain the current amplitudes α and β.")}
                className="text-[9px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition-all"
              >
                Amplitudes
              </button>
              <button 
                onClick={() => handleSend("Predict the effect of a Hadamard (H) gate.")}
                className="text-[9px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition-all"
              >
                H-Gate Prediction
              </button>
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your state..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 w-full gap-8">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <span className="[writing-mode:vertical-lr] text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em] rotate-180">
            Quantum Guide
          </span>
        </div>
      )}
    </div>
  );
};

export default AIChatPanel;
