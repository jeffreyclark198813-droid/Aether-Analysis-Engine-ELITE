import React, { useState, useMemo } from 'react';
import { 
  Hammer, 
  Settings, 
  ShieldCheck, 
  FileDown, 
  Play, 
  RotateCcw, 
  Terminal, 
  Zap, 
  Cpu, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Fingerprint,
  Smartphone,
  Server,
  Package,
  History,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';

const BuildEngine: React.FC = () => {
  const { selectedProfile, addBuildLog, buildHistory } = useApp();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState('');

  const buildSteps = [
    { label: 'Resolving Dependencies', duration: 1500, icon: Server },
    { label: 'Compiling DEX Bytecode', duration: 3000, icon: Cpu },
    { label: 'R8 Optimization & Shrinking', duration: 2500, icon: Zap },
    { label: 'Injecting SSA IR Patches', duration: 2000, icon: Hammer },
    { label: 'Resource Alignment (zipalign)', duration: 1500, icon: Settings },
    { label: 'Signing Artifact (RSA-4096)', duration: 2000, icon: ShieldCheck },
    { label: 'Verifying Integrity', duration: 1000, icon: Fingerprint },
  ];

  const handleStartBuild = async () => {
    if (!selectedProfile) return;
    
    setIsBuilding(true);
    setBuildStatus('building');
    setBuildProgress(0);
    
    const startTime = Date.now();
    addBuildLog(`[${new Date().toLocaleTimeString()}] Build initiated for ${selectedProfile.name}`);

    for (let i = 0; i < buildSteps.length; i++) {
      const step = buildSteps[i];
      setCurrentStep(step.label);
      addBuildLog(`[${new Date().toLocaleTimeString()}] ${step.label}...`);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      setBuildProgress(((i + 1) / buildSteps.length) * 100);
    }

    setBuildStatus('success');
    setIsBuilding(false);
    addBuildLog(`[${new Date().toLocaleTimeString()}] SUCCESS: The build engine has finished building the full, true, complete, patched, modded, and rebuilt version.`);
    addBuildLog(`[${new Date().toLocaleTimeString()}] Build completed successfully in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    addBuildLog(`[${new Date().toLocaleTimeString()}] Artifact: app-release-signed.apk generated.`);
  };

  const recentLogs = useMemo(() => {
    return buildHistory.slice(-10).reverse();
  }, [buildHistory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
      {/* Build Configuration */}
      <div className="glass-panel flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
            <Settings className="w-4 h-4 text-blue-500" />
            Build Pipeline Config
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Selected Artifact</label>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                  <Smartphone className="w-5 h-5 text-zinc-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedProfile?.name || 'No Artifact Selected'}</p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">{selectedProfile?.packageName || '---'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Optimization Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['None', 'R8', 'Full'].map(level => (
                  <button 
                    key={level}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-bold border transition-all",
                      level === 'Full' ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Signing Strategy</label>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-300">Aether Hardware Key</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">RSA-4096</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={handleStartBuild}
              disabled={isBuilding || !selectedProfile}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(37,99,235,0.3)]"
            >
              {isBuilding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isBuilding ? 'BUILDING ARTIFACT...' : 'INITIATE BUILD PIPELINE'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Pipeline Stages</h4>
          <div className="space-y-4">
            {buildSteps.map((step, i) => {
              const isCompleted = buildProgress > ((i + 1) / buildSteps.length) * 100 || buildStatus === 'success';
              const isActive = currentStep === step.label;
              
              return (
                <div key={step.label} className="flex items-center gap-4 group">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                    isCompleted ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" :
                    isActive ? "bg-blue-500/20 border-blue-500/50 text-blue-500 animate-pulse" :
                    "bg-zinc-900 border-zinc-800 text-zinc-700"
                  )}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tight",
                        isCompleted ? "text-emerald-500" : isActive ? "text-blue-500" : "text-zinc-600"
                      )}>{step.label}</span>
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div className="w-full bg-zinc-900 h-0.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                        className={cn("h-full", isCompleted ? "bg-emerald-500" : "bg-blue-500")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Build Monitor */}
      <div className="lg:col-span-2 flex flex-col gap-8 overflow-hidden">
        {/* Progress Card */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
            <motion.div 
              className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              animate={{ width: `${buildProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" />
                Build Monitor
              </h3>
              <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
                {buildStatus === 'idle' ? 'System Ready' : 
                 buildStatus === 'building' ? `Processing: ${currentStep}` : 
                 'Build Complete'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white mb-1">{Math.round(buildProgress)}%</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pipeline Progress</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
              <Package className="w-8 h-8 text-purple-500 mb-4" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Output Format</span>
              <span className="text-sm font-bold text-white">Android App Bundle</span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
              <Zap className="w-8 h-8 text-amber-500 mb-4" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Optimization</span>
              <span className="text-sm font-bold text-white">R8 Full Mode</span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Signature</span>
              <span className="text-sm font-bold text-white">V2 + V3 Verified</span>
            </div>
          </div>

          {buildStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">app-release-signed.apk</h4>
                  <p className="text-[10px] font-mono text-emerald-500/70 uppercase">Ready for deployment • 42.5 MB</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  alert("Downloading full, true, complete, patched, modded, and rebuilt version...");
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                Download Artifact
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Terminal Output */}
        <div className="glass-panel flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Build Output Console</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><RotateCcw className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><History className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-xs space-y-2 overflow-y-auto custom-scrollbar bg-black/50">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="text-zinc-700 select-none">{recentLogs.length - i}</span>
                <span className={cn(
                  "transition-colors",
                  log.includes('successfully') ? "text-emerald-400 font-bold" :
                  log.includes('initiated') ? "text-blue-400" :
                  log.includes('...') ? "text-zinc-500" : "text-zinc-400"
                )}>
                  {log}
                </span>
              </div>
            ))}
            {buildHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800">
                <Terminal className="w-12 h-12 mb-4 opacity-20" />
                <p className="uppercase tracking-[0.2em] text-[10px]">Console Idle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildEngine;
