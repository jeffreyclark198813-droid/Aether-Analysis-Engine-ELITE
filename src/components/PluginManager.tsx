import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { 
  Puzzle, 
  ToggleLeft, 
  ToggleRight, 
  Code2, 
  Terminal, 
  Activity, 
  Sparkles, 
  GitBranch, 
  Cpu, 
  Settings,
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AetherPlugin } from '../types';

const PluginManager: React.FC = () => {
  const { plugins, togglePlugin, addAuditLog, setIsLoading } = useApp();
  const [installUrl, setInstallUrl] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState('');

  const handleInstall = () => {
    if (!installUrl.trim()) {
      setError('URL cannot be empty');
      return;
    }
    
    try {
      new URL(installUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    if (!installUrl.endsWith('.json')) {
      setError('URL must point to a JSON manifest');
      return;
    }

    setIsInstalling(true);
    setIsLoading(true);
    setError('');
    // Simulate install
    setTimeout(() => {
      addAuditLog('plugins', 'PLUGIN_INSTALLED', `Initiated install trace from ${installUrl}`);
      setIsInstalling(false);
      setIsLoading(false);
      setInstallUrl('');
      alert("Simulated install complete. To truly add a plugin, SDK bounds must be met.");
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analysis': return <Code2 className="w-4 h-4 text-blue-500" />;
      case 'transformation': return <GitBranch className="w-4 h-4 text-purple-500" />;
      case 'telemetry': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-amber-500" />;
      default: return <Puzzle className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 glass-panel border-blue-500/20 shadow-[inset_0_0_40px_rgba(37,99,235,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Puzzle className="w-64 h-64 text-blue-500 transform rotate-12" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-4">
            <Puzzle className="w-8 h-8 text-blue-500" />
            Plugin <span className="text-zinc-600">Manager</span>
          </h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
            <Cpu className="w-3 h-3 text-emerald-500" />
            Aether Extension Architecture (v1.0 API)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        
        {/* Active Plugins List */}
        <div className="lg:col-span-2 glass-panel flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-zinc-500" />
              Installed Plugins
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">
              {plugins.length} REGISTERED
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {plugins.map((plugin: AetherPlugin) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "border rounded-xl p-6 transition-all group relative overflow-hidden",
                  plugin.status === 'active' 
                    ? "bg-blue-950/20 border-blue-500/30" 
                    : "bg-zinc-950 border-zinc-900 opacity-70 hover:opacity-100"
                )}
              >
                {plugin.status === 'active' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                )}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-black border border-zinc-800 rounded-xl shadow-inner">
                      {getCategoryIcon(plugin.category)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-mono">{plugin.name} <span className="text-zinc-600 text-xs font-normal ml-2">v{plugin.version}</span></h4>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">Author: {plugin.author}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => togglePlugin(plugin.id)}
                    className="flex items-center gap-2 transition-transform active:scale-95"
                  >
                    {plugin.status === 'active' ? (
                      <ToggleRight className="w-8 h-8 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-600 group-hover:text-zinc-500" />
                    )}
                  </button>
                </div>

                <div className="relative z-10">
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-4">
                    {plugin.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {plugin.hooks.map(hook => (
                      <span key={hook} className="text-[9px] font-mono font-bold text-zinc-500 bg-black border border-zinc-800 px-2 py-1 rounded">
                        @{hook}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Plugin Installation & Creation */}
        <div className="flex flex-col gap-8">
          
          <div className="glass-panel flex-1 flex flex-col overflow-hidden border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="p-4 border-b border-zinc-900 bg-black/40 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                <Code2 className="w-4 h-4 text-amber-500" />
                Custom Plugin Studio
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-500 text-[8px] font-black tracking-widest uppercase">Elite Edition</span>
            </div>
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex gap-2">
              <button 
                onClick={() => setInstallUrl('template')}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
               >
                 New Anomaly Detector
              </button>
              <button 
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
              >
                New UI Injector
              </button>
            </div>
            <div className="flex-1 p-4 bg-black/80 font-mono text-xs overflow-y-auto custom-scrollbar relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-4 text-zinc-700 select-none">
                {[...Array(20)].map((_, i) => <div key={i}>{i+1}</div>)}
              </div>
              <div className="pl-10 h-full">
                <textarea 
                  className="w-full h-full bg-transparent text-amber-100/90 resize-none outline-none leading-relaxed"
                  defaultValue={`import { PluginBase, PluginContext } from '@aether/sdk';\n\nexport default class AnomalyDetector extends PluginBase {\n  onEnable(ctx: PluginContext) {\n    ctx.telemetry.onTick((data) => {\n      if (data.memoryDelta > 1024 * 1024) {\n        ctx.alertManager.fire({\n          title: 'Memory Spike Detected',\n          severity: 'HIGH',\n          message: 'Heap allocation exceeds normal bounds.',\n          details: 'Potential dynamic payload unpacking detected via telemetry stream.'\n        });\n      }\n    });\n  }\n}`}
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-900 bg-black flex gap-2">
               <button 
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white py-2 rounded-lg text-xs font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                Compile & Inject Plugin
              </button>
            </div>
          </div>

          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/30">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                SDK API Reference
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/50">
              <pre className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                <code className="text-purple-400">interface</code> <span className="text-amber-300">PluginContext</span> {'{\n'}
                {'  '}<span className="text-zinc-500">// Read-only core state</span>{'\n'}
                {'  '}<span className="text-blue-300">profiles</span>: APKProfile[];{'\n'}
                {'  '}<span className="text-blue-300">activePlugins</span>: AetherPlugin[];{'\n'}
                {'\n'}
                {'  '}<span className="text-zinc-500">// Alert bindings</span>{'\n'}
                {'  '}<span className="text-blue-300">alertManager</span>: {'{\n'}
                {'    '}fire: (alert: <span className="text-emerald-300">SystemAlert</span>) =&#62; <span className="text-purple-400">void</span>;{'\n'}
                {'  }'};{'\n'}
                {'\n'}
                {'  '}<span className="text-zinc-500">// Telemetry subscriptions</span>{'\n'}
                {'  '}<span className="text-blue-300">telemetry</span>: {'{\n'}
                {'    '}onTick: (cb: (data: <span className="text-emerald-300">any</span>) =&#62; <span className="text-purple-400">void</span>) =&#62; <span className="text-purple-400">void</span>;{'\n'}
                {'  }'};{'\n'}
                {'}'}{'\n'}
                {'\n'}
                <code className="text-purple-400">abstract class</code> <span className="text-amber-300">PluginBase</span> {'{\n'}
                {'  '}onLoad(ctx: <span className="text-amber-300">PluginContext</span>): <span className="text-purple-400">void</span>;{'\n'}
                {'  '}onEnable(ctx: <span className="text-amber-300">PluginContext</span>): <span className="text-purple-400">void</span>;{'\n'}
                {'}'}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PluginManager;
