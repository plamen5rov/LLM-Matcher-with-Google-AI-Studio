/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  MemoryStick as Memory, 
  Monitor, 
  Zap, 
  Search, 
  ExternalLink, 
  RefreshCw,
  Info,
  ChevronRight,
  Activity,
  Bot,
  Heart,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getModelRecommendations, HardwareSpecs, ModelRecommendation } from './services/geminiService';

export default function App() {
  const [specs, setSpecs] = useState<HardwareSpecs | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [useCase, setUseCase] = useState("General Chat");
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved specs on mount
  useEffect(() => {
    const saved = localStorage.getItem('hardware_specs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSpecs(parsed);
        // If we have saved specs, get initial recommendations
        fetchRecommendations(parsed, useCase);
      } catch (e) {
        console.error("Failed to parse saved specs", e);
      }
    }
  }, []);

  const saveSpecs = (newSpecs: HardwareSpecs) => {
    console.log("Saving specs:", newSpecs);
    localStorage.setItem('hardware_specs', JSON.stringify(newSpecs));
    setSpecs(newSpecs);
    setIsEditing(false);
    // Immediately fetch with the new specs
    fetchRecommendations(newSpecs, useCase);
  };

  const useCaseColors: Record<string, string> = {
    "General Chat": "bg-blue-50 text-blue-700 border-blue-200",
    "Coding & Development": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Creative Writing": "bg-purple-50 text-purple-700 border-purple-200",
    "Scientific Reasoning": "bg-amber-50 text-amber-700 border-amber-200",
    "Roleplay & Storytelling": "bg-pink-50 text-pink-700 border-pink-200",
    "Image/Video Generation (Local)": "bg-blue-50 text-blue-700 border-blue-200",
    "Small/Edge Device Deployment": "bg-slate-50 text-slate-700 border-slate-200"
  };

  const useCases = Object.keys(useCaseColors);

  const probeHardware = async () => {
    setProbing(true);
    setError(null);
    
    try {
      const cpuCores = navigator.hardwareConcurrency || 0;
      const ramGB = (navigator as any).deviceMemory || 0;
      const platform = navigator.platform;

      let gpuInfo = "Unknown";
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch (e) {
        console.warn("WebGL GPU detection failed", e);
      }

      const detectedSpecs: HardwareSpecs = {
        cpuCores,
        ramGB,
        gpuInfo,
        platform,
        isManual: false
      };

      setSpecs(detectedSpecs);
      await fetchRecommendations(detectedSpecs, useCase);
    } catch (err) {
      setError("Failed to probe hardware. Some browser security settings might be blocking access.");
      console.error(err);
    } finally {
      setProbing(false);
    }
  };

  const handleUpdateSpecs = (field: keyof HardwareSpecs, value: any) => {
    setSpecs(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value, isManual: true };
    });
  };

  const fetchRecommendations = async (hardwareSpecs: HardwareSpecs, selectedUseCase: string) => {
    if (!hardwareSpecs) return;
    setLoading(true);
    try {
      console.log("Fetching recommendations for:", hardwareSpecs, "UseCase:", selectedUseCase);
      const recs = await getModelRecommendations(hardwareSpecs, selectedUseCase);
      setRecommendations(recs);
    } catch (err) {
      setError("Failed to get AI recommendations. Please check your API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#00E5FF] selection:text-white">
      {/* Header */}
      <header className="p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-end max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <div className="absolute inset-0 bg-[#00E5FF] rounded-[1rem] sm:rounded-[1.25rem] rotate-6 opacity-20 animate-pulse" />
            <div className="absolute inset-0 bg-[#1D1D1F] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl border border-white/10">
              <div className="relative">
                <Bot size={24} className="sm:hidden text-[#00E5FF]" />
                <Bot size={36} className="hidden sm:block text-[#00E5FF]" />
                <Heart 
                  size={10} 
                  fill="#00E5FF" 
                  className="absolute -top-1 -right-1 text-[#00E5FF] animate-bounce sm:scale-150" 
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
                LLM Matcher
              </h1>
              <div className="px-2 py-0.5 bg-white rounded-full border border-[#D2D2D7] shadow-sm flex items-center gap-1.5 mt-1 sm:mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[#86868B]">v1.0.8-PRO</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium opacity-50 mt-1">
              Find your LLM model soulmate for your hardware.
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          {import.meta.env.VITE_GITHUB_REPO_URL && (
            <a 
              href={import.meta.env.VITE_GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-[#1D1D1F] text-white rounded-2xl text-base font-bold hover:bg-[#333] transition-all shadow-xl shadow-black/20"
            >
              <Github size={20} />
              View on GitHub
            </a>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Left Column: System Specs */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Use Case Selection */}
          <section className="bg-white shadow-xl shadow-black/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-[#D2D2D7]/30">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 opacity-40">
                <Search size={16} />
                <h2 className="text-[12px] sm:text-[13px] uppercase font-bold tracking-widest">Primary Objective</h2>
              </div>
              <div className={`rounded-xl sm:rounded-2xl border transition-all duration-500 p-1 ${useCaseColors[useCase] || 'bg-gray-50 border-gray-200'}`}>
                <select 
                  value={useCase}
                  onChange={(e) => {
                    const newUseCase = e.target.value;
                    setUseCase(newUseCase);
                    if (specs) fetchRecommendations(specs, newUseCase);
                  }}
                  className="w-full bg-transparent p-3 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base font-semibold focus:outline-none appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'calc(100% - 1rem) center', 
                    backgroundSize: '1.2em' 
                  }}
                >
                  {useCases.map((uc) => (
                    <option key={uc} value={uc} className="bg-white text-[#1D1D1F]">{uc}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] sm:text-[11px] mt-4 opacity-40 font-medium leading-relaxed">
                AI analysis will prioritize model architectures and quantization methods best suited for this task.
              </p>
            </div>
          </section>

          <section className="bg-white shadow-xl shadow-black/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-[#D2D2D7]/30">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-2 opacity-40">
                  <Activity size={16} />
                  <h2 className="text-[12px] sm:text-[13px] uppercase font-bold tracking-widest">System Diagnostics</h2>
                </div>
                {specs && (
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[11px] sm:text-xs font-semibold text-[#00E5FF] hover:underline"
                  >
                    {isEditing ? "Cancel" : "Adjust Specs"}
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {!specs ? (
                  <div className="text-center py-8 sm:py-12 space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-[#F5F5F7] flex items-center justify-center">
                      <Search size={24} className="sm:hidden opacity-20" />
                      <Search size={32} className="hidden sm:block opacity-20" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium opacity-40 px-4 leading-relaxed">
                      Browser security layers may mask true hardware capabilities. 
                      Auto-probe provides a baseline estimate.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={probeHardware}
                        disabled={probing}
                        className="w-full py-4 sm:py-5 bg-[#1D1D1F] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#333] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                      >
                        {probing ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                        {probing ? "Analyzing..." : "Auto-Probe System"}
                      </button>
                      <button 
                        onClick={() => {
                          setSpecs({
                            cpuCores: 8,
                            ramGB: 16,
                            gpuInfo: "High-End GPU",
                            gpuVRAM: 8,
                            platform: navigator.platform,
                            isManual: true
                          });
                          setIsEditing(true);
                        }}
                        className="w-full py-3 sm:py-4 border-2 border-[#1D1D1F] text-[#1D1D1F] rounded-xl sm:rounded-2xl font-bold hover:bg-[#1D1D1F] hover:text-white transition-all"
                      >
                        Manual Configuration
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-[#F5F5F7] rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-medium leading-relaxed text-[#86868B]">
                          <Info size={14} className="inline mr-2 mb-0.5 text-[#00E5FF]" />
                          Manual override active. Enter exact specifications for high-precision model matching.
                        </div>
                        <EditRow label="CPU Cores" value={specs.cpuCores} onChange={(v) => handleUpdateSpecs('cpuCores', parseInt(v) || 0)} type="number" />
                        <EditRow label="System RAM (GB)" value={specs.ramGB} onChange={(v) => handleUpdateSpecs('ramGB', parseInt(v) || 0)} type="number" />
                        <EditRow label="GPU VRAM (GB)" value={specs.gpuVRAM || 0} onChange={(v) => handleUpdateSpecs('gpuVRAM', parseInt(v) || 0)} type="number" />
                        <EditRow label="GPU Name" value={specs.gpuInfo} onChange={(v) => handleUpdateSpecs('gpuInfo', v)} type="text" />
                        
                        <button 
                          onClick={() => saveSpecs(specs)}
                          className="w-full py-4 sm:py-5 bg-[#34C759] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#28A745] transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 mt-4"
                        >
                          <Zap size={18} />
                          Save & Apply
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                          <div className={`h-2 w-2 rounded-full ${specs.isManual ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-40">
                            {specs.isManual ? 'Manual Profile (Saved)' : 'Auto-Detected'}
                          </span>
                        </div>
                        <SpecRow icon={<Cpu size={20} />} label="Processor" value={`${specs.cpuCores} Cores`} />
                        <SpecRow icon={<Memory size={20} />} label="System RAM" value={`${specs.ramGB} GB`} />
                        <SpecRow icon={<Zap size={20} />} label="GPU VRAM" value={specs.gpuVRAM ? `${specs.gpuVRAM} GB` : "Unknown"} />
                        <SpecRow icon={<Monitor size={20} />} label="Graphics" value={specs.gpuInfo} />
                        <SpecRow icon={<Info size={20} />} label="Platform" value={specs.platform} />
                        
                        {!specs.isManual && specs.ramGB <= 8 && (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="w-full mt-6 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100 text-[11px] sm:text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Info size={14} />
                            RAM seems low? Adjust manually
                          </button>
                        )}
                      </div>
                    )}
                    
                    {!isEditing && (
                      <div className="pt-6 sm:pt-8 space-y-3">
                        <button 
                          onClick={() => fetchRecommendations(specs, useCase)}
                          disabled={probing || loading}
                          className="w-full py-4 sm:py-5 bg-[#1D1D1F] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#333] transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                        >
                          <Zap size={18} />
                          Update Analysis
                        </button>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('hardware_specs');
                            probeHardware();
                          }}
                          disabled={probing || loading}
                          className="w-full py-3 sm:py-4 border-2 border-[#D2D2D7] text-[#1D1D1F] rounded-xl sm:rounded-2xl font-bold hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-3"
                        >
                          <RefreshCw size={16} />
                          Reset & Re-Scan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 border border-red-900 text-red-900 text-xs font-mono"
            >
              [ERROR]: {error}
            </motion.div>
          )}
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-8">
          <section className="border border-[#141414] min-h-[600px] flex flex-col rounded-sm">
            <div className="border-b border-[#141414] p-4 relative flex items-center justify-center bg-white">
              <h2 className="text-[14px] sm:text-[16px] uppercase font-bold tracking-widest text-center opacity-40">Recommended Models</h2>
              {loading && (
                <div className="absolute right-4 flex items-center gap-2 text-[10px] font-mono uppercase animate-pulse opacity-40">
                  <RefreshCw size={12} className="animate-spin" />
                  <span className="hidden sm:inline">AI Analysis in progress...</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center space-y-4 opacity-40"
                  >
                    <div className="w-full max-w-md h-1 bg-[#141414]/10 overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#141414]"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    </div>
                    <p className="text-[10px] font-mono uppercase tracking-widest">Synthesizing hardware-specific optimizations</p>
                  </motion.div>
                ) : recommendations.length > 0 ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {recommendations.map((model, idx) => (
                      <div key={idx}>
                        <ModelCard model={model} index={idx} />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                    <Search size={48} strokeWidth={1} />
                    <p className="mt-4 font-serif italic">Run diagnostics to generate recommendations</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#141414] p-6 text-center">
        <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
          Powered by Gemini 3 Flash & Hugging Face Hub
        </p>
      </footer>
    </div>
  );
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#D2D2D7]/30 last:border-0 group">
      <div className="flex items-center gap-4">
        <span className="text-[#86868B] group-hover:text-[#00E5FF] transition-colors">{icon}</span>
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#86868B]">{label}</span>
      </div>
      <span className="text-sm font-bold text-[#1D1D1F] truncate max-w-[180px]">{value}</span>
    </div>
  );
}

function EditRow({ label, value, onChange, type }: { label: string, value: string | number, onChange: (v: string) => void, type: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] uppercase font-bold tracking-widest text-[#86868B] ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:border-[#00E5FF] transition-all"
      />
    </div>
  );
}

interface ModelCardProps {
  model: ModelRecommendation;
  index: number;
}

function ModelCard({ model, index }: ModelCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-lg sm:text-xl font-bold text-[#1D1D1F]">
              {index + 1}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">{model.name}</h3>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#00E5FF]">
                {model.size} Parameters
              </span>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-[#424245] leading-relaxed font-medium">
            {model.description}
          </p>
        </div>

        <div className="w-full md:w-auto">
          <a 
            href={model.huggingFaceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 text-sm font-bold bg-[#F5F5F7] text-[#1D1D1F] rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 hover:bg-[#1D1D1F] hover:text-white transition-all shadow-sm group/btn"
          >
            <span className="text-lg sm:text-xl group-hover/btn:scale-110 transition-transform">🤗</span>
            Open in Hugging Face
            <ExternalLink size={16} className="opacity-40 group-hover/btn:opacity-100" />
          </a>
        </div>
      </div>

      {/* Expanded Green Reason Area */}
      <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
        <div className="mt-1 p-2 bg-white rounded-lg sm:rounded-xl shadow-sm text-[#2E7D32] shrink-0">
          <Zap size={16} className="sm:hidden" fill="currentColor" />
          <Zap size={20} className="hidden sm:block" fill="currentColor" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-[#2E7D32] opacity-70">Optimization Logic</h4>
          <p className="text-base sm:text-lg font-bold text-[#1B5E20] leading-snug">
            {model.reason}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
