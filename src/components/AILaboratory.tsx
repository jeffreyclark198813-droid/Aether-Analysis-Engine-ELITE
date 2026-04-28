import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  Zap, 
  Loader2, 
  Download, 
  Share2,
  Camera,
  FileSearch,
  Wand2,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeAPKImage, generatePatchVisualization } from '../services/gemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const AILaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate' | 'elite'>('elite');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Analysis State
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Elite State
  const [elitePayload, setElitePayload] = useState('');
  const [eliteOutput, setEliteOutput] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!analysisImage) return;
    setIsProcessing(true);
    try {
      const base64 = analysisImage.split(',')[1];
      const result = await analyzeAPKImage(base64, 'image/png');
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const runGeneration = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const result = await generatePatchVisualization(prompt);
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const synthesizeEliteCircumvention = async () => {
    if (!elitePayload.trim()) return;
    setIsProcessing(true);
    
    // Simulate complex elite circumvention workflow
    setTimeout(() => {
      setEliteOutput(`
# ELITE CIRCUMVENTION MODULE ACTIVE
*Target Signature:* \`${btoa(elitePayload.substring(0, 10)).substring(0, 8)}\`...

## BYPASS TACTICS ENGAGED
1. **Dynamic Payload Hooking**
   - Injecting trampoline to intercept method invocations.
   - Forcing \`true\` evaluation on boolean returns for validation checks.
   - Stripping internal DRM assertions.
   
2. **Cryptographic Downgrade**
   - Ramping AES-GCM requirement to legacy DES.
   - Bypassing KeyStore validation.
   
3. **Advanced Obfuscation Evader**
   - De-virtuating control flow flattening.
   - Using neural heuristic matching to identify true entry points.

## NEXT STEPS
Apply these exact structural modifications in the **Transformation Lab**. Ensure \`DeepTrace Anomaly\` monitor is paused to prevent internal flags.
      `);
      setIsProcessing(false);
    }, 2800);
  };

  return (
    <div className="space-y-8 h-full flex flex-col relative z-10">
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-amber-900/40 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-amber-50 mb-1 flex items-center gap-3">
            Elite AI Laboratory
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-500 text-[10px] font-black tracking-widest uppercase">Premium</span>
          </h2>
          <p className="text-amber-500/60 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Advanced vision analysis and payload synthesis powered by Gemini.</p>
        </div>
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-amber-900/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('elite')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'elite' ? "bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-amber-400"
            )}
          >
            <Crown className="w-4 h-4" />
            Circumvention
          </button>
          <button 
            onClick={() => setActiveTab('analyze')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'analyze' ? "bg-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-amber-400"
            )}
          >
            <FileSearch className="w-4 h-4" />
            Analyze
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'generate' ? "bg-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-amber-400"
            )}
          >
            <Wand2 className="w-4 h-4" />
            Synthesize
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Input Section */}
        <div className="glass-panel p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar border-amber-900/20">
          {activeTab === 'elite' ? (
             <>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Elite Circumvention Generator
                </h3>
                <p className="text-sm text-amber-500/60 leading-relaxed font-mono">
                  Input target method signatures or defensive heuristics. The Aether AI will formulate a multi-faceted circumvention strategy, combining hooking, proxying, and downgrade attacks.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-amber-500/50 uppercase tracking-widest font-black">Target Attack Surface</label>
                <textarea 
                  value={elitePayload}
                  onChange={(e) => setElitePayload(e.target.value)}
                  placeholder="e.g. Lcom/vendor/premium/LicenseChecker;->verify(Ljava/lang/String;)Z"
                  className="w-full bg-zinc-950 border border-amber-900/30 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 min-h-[200px] transition-all font-mono"
                />
              </div>

              <button 
                onClick={synthesizeEliteCircumvention}
                disabled={!elitePayload.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] uppercase tracking-widest"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                Generate Elite Bypass
              </button>
            </>
          ) : activeTab === 'analyze' ? (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Visual Artifact Analysis
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Upload a screenshot of an Android manifest, DEX bytecode, or system logs. 
                  Aether will use <code className="text-blue-400">gemini-3.1-pro-preview</code> to perform deep structural analysis.
                </p>
              </div>

              <div 
                className={cn(
                  "relative aspect-video rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center overflow-hidden group transition-all",
                  analysisImage ? "border-blue-500/50" : "hover:border-zinc-700"
                )}
              >
                {analysisImage ? (
                  <>
                    <img src={analysisImage} alt="Artifact" className="w-full h-full object-contain" />
                    <button 
                      onClick={() => setAnalysisImage(null)}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-zinc-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-400">Click to upload artifact</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>

              <button 
                onClick={runAnalysis}
                disabled={!analysisImage || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Run Deep Analysis
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Patch Architecture Synthesis
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Describe a patch or mod architecture. Aether will use <code className="text-purple-400">gemini-3.1-flash-image-preview</code> to 
                  visualize the technical implementation and data-flow.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Synthesis Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A high-level diagram of a DEX bytecode hook bypassing the license verification path in a social media app..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 min-h-[150px] transition-all"
                />
              </div>

              <button 
                onClick={runGeneration}
                disabled={!prompt.trim() || isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Synthesize Visualization
              </button>
            </>
          )}
        </div>

        {/* Output Section */}
        <div className="glass-panel p-8 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-4 bg-zinc-700 rounded-full" />
              Laboratory Output
            </h3>
            <div className="flex gap-2">
              <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'elite' ? (
                eliteOutput ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-invert prose-sm max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-amber-900/40 prose-a:text-amber-500 prose-strong:text-white"
                  >
                    <ReactMarkdown>{eliteOutput}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-amber-500/20">
                    <Crown className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    <p className="text-sm font-mono uppercase tracking-widest font-bold">Awaiting Target Signature</p>
                  </div>
                )
              ) : activeTab === 'analyze' ? (
                analysisResult ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-invert prose-sm max-w-none"
                  >
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600">
                    <FileSearch className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Analysis Data</p>
                  </div>
                )
              ) : (
                generatedImage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                      <img src={generatedImage} alt="Synthesized Patch" className="w-full h-auto" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-400 italic">
                        Visualization generated based on neural synthesis of the provided patch architecture. 
                        This model represents the predicted IR-level transformation path.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600">
                    <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Synthesis Prompt</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default AILaboratory;
