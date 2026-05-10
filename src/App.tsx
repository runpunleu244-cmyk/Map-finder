import React, { useState, useCallback } from 'react';
import { 
  Scan, 
  Upload, 
  ShieldAlert, 
  Target, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, fileToBase64 } from './lib/utils';
import { analyzeLocation, type AnalysisResult } from './lib/gemini';
import { MapPanel } from './components/MapPanel';
import { AnalysisDisplay } from './components/AnalysisDisplay';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [insaneMode, setInsaneMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image too large. Max 10MB.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setImage(`data:${file.type};base64,${base64}`);
        setResult(null);
        setError(null);
      } catch (err) {
        setError("Failed to process image.");
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = image.split(',')[1];
      const data = await analyzeLocation(base64, insaneMode);
      setResult(data);
    } catch (err) {
      setError("Forensic analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-bottom border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <Scan className="w-5 h-5 text-zinc-950" />
            </div>
            <h1 className="font-mono text-lg font-bold tracking-tighter uppercase">GeoForensics <span className="text-emerald-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setInsaneMode(!insaneMode)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border flex items-center gap-2",
                insaneMode 
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 hover:opacity-100"
              )}
            >
              <ShieldAlert className={cn("w-3 h-3", insaneMode && "animate-pulse")} />
              Insane Mode
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Upload & Analysis */}
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Input Source</h2>
                {image && !isAnalyzing && (
                  <button 
                    onClick={() => setImage(null)}
                    className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              
              <div 
                className={cn(
                  "relative aspect-video rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 overflow-hidden group transition-all duration-500",
                  !image && "hover:border-emerald-500/50 hover:bg-zinc-900",
                  image && "border-solid border-zinc-800"
                )}
              >
                {!image ? (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-10 h-10 text-zinc-700 group-hover:text-emerald-500 transition-colors mb-4" />
                    <span className="text-sm font-medium text-zinc-400">Import Visual Data</span>
                    <span className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">DRAG-DROP OR CLICK</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <img src={image} className="w-full h-full object-cover" alt="Source" />
                )}
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <Loader2 className="w-12 h-12 text-emerald-500" />
                      </div>
                      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                    <p className="mt-6 font-mono text-sm text-emerald-500 animate-pulse tracking-widest uppercase">
                      Running De-shadowing & Reflection Analysis
                    </p>
                  </div>
                )}
              </div>

              {image && !isAnalyzing && !result && (
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Target className="w-5 h-5" />
                  INITIATE FORENSIC SCAN
                </button>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </section>

            <AnimatePresence mode="wait">
              {result && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Analysis Breakdown</h2>
                  <AnalysisDisplay result={result} />
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Maps & Verification */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <section className="space-y-4 h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Geospatial Verification</h2>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", result ? "bg-emerald-500 animate-pulse" : "bg-zinc-800")} />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">LIVE FEED</span>
                </div>
              </div>
              
              <div className="h-[calc(100vh-20rem)] min-h-[500px]">
                {result?.coordinates ? (
                  <MapPanel 
                    center={result.coordinates} 
                    zoom={18} 
                  />
                ) : (
                  <div className="w-full h-full rounded-xl border border-zinc-900 bg-zinc-900/30 flex flex-col items-center justify-center text-center p-8">
                    <ImageIcon className="w-12 h-12 text-zinc-800 mb-4" />
                    <p className="text-zinc-600 text-sm font-medium">Awaiting Geospatial Data</p>
                    <p className="text-zinc-700 text-xs mt-2 italic max-w-xs">Scan an image to triangulate coordinates and unlock Street View verification.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-zinc-900 py-12 mt-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Tech Stack</p>
              <p className="text-sm font-mono leading-none">GEMINI FLASH 2.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Engine</p>
              <p className="text-sm font-mono leading-none">STRUCTURAL LLM v4</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase">GeoForensics</p>
            <p className="text-sm font-mono leading-none">LATITUDE: AUTO-TRIANGULATION</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
