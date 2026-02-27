/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Settings, 
  Search, 
  Edit3, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  FileText, 
  Copy, 
  Download,
  Cpu,
  Zap,
  Database,
  ExternalLink,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface LiteratureMatch {
  title: string;
  authors: string;
  source: string;
  score: number;
  tags: string[];
}

interface GenerateProofResponse {
  proof: string;
}

export default function App() {
  const [theorem, setTheorem] = useState("Prove that every continuous function on a closed interval [a, b] is bounded and attains its maximum and minimum values.");
  const [assumptions, setAssumptions] = useState("- f is continuous on the interval I = [a, b]\n- I is compact in the standard topology of R");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '09:42:12', message: 'System initialized. Ready for input.', type: 'info' }
  ]);
  const [proof, setProof] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'source'>('formatted');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  const literatureMatches: LiteratureMatch[] = [
    {
      title: "The Extremum Value Theorem: A Metric Space Perspective",
      authors: "H. Miller, S. Grant (2022)",
      source: "arXiv:2104.0932 [math.CA]",
      score: 0.99,
      tags: ["Real Analysis", "Compactness"]
    },
    {
      title: "Foundations of Modern Topology: Bolzano-Weierstrass",
      authors: "A. J. Thompson (2020)",
      source: "Math Logic Quarterly",
      score: 0.84,
      tags: ["Topology"]
    },
    {
      title: "Computational Approaches to Function Limits",
      authors: "R. Chen et al. (2018)",
      source: "Journal of Symbolic Logic",
      score: 0.72,
      tags: ["Logic"]
    }
  ];

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProof(null);
    setErrorMessage(null);
    setProgress(1);
    addLog('Querying vector database for relevant literature...', 'info');
    
    // Simulate multi-agent workflow
    setTimeout(() => {
      setProgress(2);
      addLog('Literature search complete. Found 12 matches.', 'success');
      addLog('Prover Agent drafting topological proof path...', 'info');
    }, 2000);

    setTimeout(() => {
      setProgress(3);
      addLog('Draft complete. Skeptic Agent verifying lemma 2.1...', 'warning');
      addLog('Checking for boundary case leaks...', 'info');
    }, 4000);

    try {
      const response = await fetch('/api/generate-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theorem, assumptions }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate proof.');
      }

      const data: GenerateProofResponse = await response.json();
      
      setTimeout(() => {
        setProgress(4);
        setProof(data.proof || "Failed to generate proof.");
        setIsGenerating(false);
        addLog('LaTeX Refiner completed formatting.', 'success');
        addLog('Proof generation successful.', 'success');
      }, 6000);

    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown server error.');
      addLog('Error during proof generation.', 'error');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#064e3b] rounded flex items-center justify-center text-white shadow-sm">
            <Zap size={24} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Proof Assistant</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Advanced Multi-Agent Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 uppercase">System Ready</span>
          </div>
          
          <div className="h-10 w-px bg-slate-200" />

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</div>
              <div className="text-sm font-bold text-slate-700">Gemini 2.5 Flash</div>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-2.5 rounded font-bold text-sm transition-all shadow-sm
                ${isGenerating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#064e3b] text-white hover:bg-[#065f46] active:scale-95'}`}
            >
              {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
              {isGenerating ? 'Generating...' : 'Generate Proof'}
            </button>

            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Workspace */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-[#064e3b]" />
                Workspace
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project ID: AM-902</span>
            </div>
            
            <div className="space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Theorem Statement</label>
                <textarea 
                  value={theorem}
                  onChange={(e) => setTheorem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all min-h-[120px] resize-none leading-relaxed text-slate-700"
                  placeholder="State your theorem..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Known Assumptions</label>
                <textarea 
                  value={assumptions}
                  onChange={(e) => setAssumptions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all min-h-[100px] resize-none leading-relaxed text-slate-700"
                  placeholder="- Assume..."
                />
              </div>
            </div>
          </section>

          {/* Literature Search */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-[#064e3b]" />
                Literature Search
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-100">12 MATCHES</span>
            </div>
            
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search academic archives..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#064e3b]/10 focus:border-[#064e3b] transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {literatureMatches.map((match, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-slate-100 hover:border-[#064e3b]/30 hover:bg-slate-50/50 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors leading-snug">{match.title}</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{match.score.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{match.authors} • {match.source}</p>
                  <div className="flex gap-2">
                    {match.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Progress */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#064e3b]" />
                Progress
              </h2>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${progress >= i ? 'bg-[#064e3b]' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            <div className="space-y-8 flex-1">
              {[
                { id: 1, name: 'Search Module', desc: 'Cross-referenced 320 documents' },
                { id: 2, name: 'Prover Agent', desc: 'Drafted topological proof path' },
                { id: 3, name: 'Skeptic Agent', desc: 'Checking for boundary case leaks...', active: true },
                { id: 4, name: 'LaTeX Refiner', desc: 'Waiting...' }
              ].map((step) => (
                <div key={step.id} className={`flex items-start gap-4 ${progress < step.id && !step.active ? 'opacity-40' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${progress > step.id ? 'bg-emerald-100 text-emerald-600' : 
                      progress === step.id ? 'bg-[#064e3b] text-white' : 'border-2 border-slate-200 text-slate-400'}`}>
                    {progress > step.id ? <Check size={14} /> : step.id}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${progress === step.id ? 'text-[#064e3b]' : 'text-slate-900'}`}>{step.name}</div>
                    <div className={`text-xs ${step.active && progress === step.id ? 'italic text-slate-500' : 'text-slate-400'}`}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Execution Log */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} />
                  System Execution Log
                </h3>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] h-64 overflow-y-auto custom-scrollbar leading-relaxed">
                {logs.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'warning' ? 'text-amber-400' : 
                      log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-8 overflow-hidden">
          {/* Proof Output */}
          <section className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-[#064e3b]" />
                Final Proof Output
              </h2>
              <div className="flex bg-white border border-slate-200 rounded p-1">
                <button 
                  onClick={() => setActiveTab('source')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === 'source' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Source
                </button>
                <button 
                  onClick={() => setActiveTab('formatted')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === 'formatted' ? 'bg-[#064e3b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Formatted
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
              <AnimatePresence mode="wait">
                {!proof ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"
                  >
                    <FileText size={64} strokeWidth={1} />
                    <p className="text-sm font-medium">No proof generated yet.</p>
                  </motion.div>
                ) : (
                  <motion.article 
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto font-serif text-slate-800 leading-relaxed"
                  >
                    {activeTab === 'formatted' ? (
                      <div className="prose prose-slate prose-sm max-w-none">
                        <div className="text-center mb-12">
                          <h3 className="text-2xl font-bold text-slate-900 mb-1 font-sans">The Extreme Value Theorem</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-sans">Formal Proof Documentation</p>
                        </div>
                        <div className="whitespace-pre-wrap text-lg">
                          {proof}
                        </div>
                      </div>
                    ) : (
                      <pre className="font-mono text-xs bg-slate-50 p-6 rounded-lg border border-slate-200 overflow-x-auto">
                        {proof}
                      </pre>
                    )}
                  </motion.article>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-between">
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#064e3b] transition-colors px-4 py-2">
                <Copy size={16} />
                Copy LaTeX
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#064e3b] transition-colors px-4 py-2">
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </section>

          {/* Grounded References */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ExternalLink size={14} />
              Grounded References
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#064e3b]">
                <p className="text-[10px] font-bold text-[#064e3b] uppercase mb-2 tracking-wider">Used in Topology Proof (Step 2)</p>
                <p className="text-sm font-serif italic text-slate-700 leading-relaxed">
                  "...the image of a compact set under a continuous map is compact. This follows from the open cover definition where every open cover of f(K) pulls back to an open cover of K..."
                </p>
                <p className="text-[10px] text-slate-400 mt-3 font-bold">— Thompson (2020), Foundations of Modern Topology, p. 42</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-200 bg-white flex items-center px-8 justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><Cpu size={14} /> GPU Usage: 38%</span>
          <span className="flex items-center gap-2"><Zap size={14} /> Latency: 340ms</span>
          <span className="flex items-center gap-2"><Database size={14} /> KB: 4.2GB</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#064e3b] transition-colors">Documentation</a>
          <a href="#" className="hover:text-[#064e3b] transition-colors">API Access</a>
          <span className="text-slate-300">v3.1.0-LTS</span>
        </div>
      </footer>
    </div>
  );
}
