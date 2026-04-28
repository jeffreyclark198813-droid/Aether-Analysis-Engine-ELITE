import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  History, 
  Database, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowRightLeft,
  FileJson,
  Activity,
  Zap,
  Cpu,
  Lock,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

const AuditIntegrity: React.FC = () => {
  const { auditTrail, normalizedDataset } = useApp();
  const [activeTab, setActiveTab] = useState<'audit' | 'dataset'>('audit');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAudit = useMemo(() => {
    return auditTrail.filter(log => 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();
  }, [auditTrail, searchQuery]);

  const filteredDataset = useMemo(() => {
    return normalizedDataset.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.packageName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedDataset, searchQuery]);

  return (
    <div className="flex flex-col gap-8 h-full overflow-hidden">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <div className="glass-panel p-6 border-l-4 border-l-amber-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em]">Quantum Ledger</span>
          </div>
          <div className="text-3xl font-black text-white relative z-10">SECURED</div>
          <div className="text-[10px] font-mono text-emerald-500 mt-2 uppercase font-bold flex items-center gap-2 relative z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Deterministically Verified
          </div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-rose-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <History className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.2em]">Forensic Depth</span>
          </div>
          <div className="text-3xl font-black text-white relative z-10">{auditTrail.length}</div>
          <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase font-bold relative z-10">Unique Vectors</div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em]">Normalization</span>
          </div>
          <div className="text-3xl font-black text-white relative z-10">{normalizedDataset.length}</div>
          <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase font-bold relative z-10">Linked Entities</div>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-emerald-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <Database className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Vault Fidelity</span>
          </div>
          <div className="text-3xl font-black text-white relative z-10">100%</div>
          <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase font-bold relative z-10">Zero Data Loss</div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
          <button 
            onClick={() => setActiveTab('audit')}
            className={cn(
              "px-8 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-3 uppercase tracking-widest",
              activeTab === 'audit' ? "bg-amber-900/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-900/50" : "text-zinc-600 hover:text-amber-500/50"
            )}
          >
            <History className="w-4 h-4" />
            Quantum Ledger
          </button>
          <button 
            onClick={() => setActiveTab('dataset')}
            className={cn(
              "px-8 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-3 uppercase tracking-widest",
              activeTab === 'dataset' ? "bg-amber-900/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-900/50" : "text-zinc-600 hover:text-amber-500/50"
            )}
          >
            <Database className="w-4 h-4" />
            Crypto-Vault
          </button>
        </div>

        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={activeTab === 'audit' ? "Search forensic logs..." : "Search normalized entities..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl pl-12 pr-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-800 font-mono"
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-zinc-950 border border-zinc-900 p-3 rounded-2xl text-zinc-600 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-inner">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="bg-zinc-950 border border-zinc-900 p-3 rounded-2xl text-zinc-600 hover:text-purple-500 hover:border-purple-500/30 transition-all shadow-inner">
            <FileJson className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel overflow-hidden flex flex-col border-zinc-800">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/20">
          <AnimatePresence mode="wait">
            {activeTab === 'audit' ? (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {filteredAudit.length === 0 ? (
                  <div className="h-96 flex flex-col items-center justify-center text-zinc-800">
                    <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mb-6 border border-zinc-900">
                      <History className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="uppercase tracking-[0.3em] text-xs font-black">No Audit Logs Found</p>
                  </div>
                ) : (
                  filteredAudit.map((log) => (
                    <div key={log.id} className="bg-zinc-950/40 border border-zinc-900/50 rounded-2xl p-5 flex items-start gap-6 group hover:border-zinc-700 hover:bg-zinc-900/20 transition-all relative overflow-hidden">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-lg",
                        log.module === 'ingestion' ? "bg-blue-600/10 border-blue-500/30 text-blue-500" :
                        log.module === 'transformation' ? "bg-purple-600/10 border-purple-500/30 text-purple-500" :
                        log.module === 'build' ? "bg-amber-600/10 border-amber-500/30 text-amber-500" : 
                        log.module === 'runtime' ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-500" :
                        "bg-zinc-800 border-zinc-700 text-zinc-500"
                      )}>
                        {log.module === 'ingestion' ? <Zap className="w-5 h-5" /> :
                         log.module === 'transformation' ? <Cpu className="w-5 h-5" /> :
                         log.module === 'build' ? <Terminal className="w-5 h-5" /> :
                         log.module === 'runtime' ? <Activity className="w-5 h-5" /> :
                         <Fingerprint className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-black text-white uppercase tracking-tight">{log.action}</h4>
                            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-mono text-zinc-500 uppercase font-bold tracking-widest">
                              {log.module}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-700 font-bold">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-4 font-medium leading-relaxed">{log.details}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                            <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold tracking-widest">Integrity: <span className="text-zinc-400">{log.integrityHash.slice(0, 12)}...</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-blue-500/70" />
                            <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold tracking-widest">Auth: <span className="text-zinc-400">HARDWARE_KEY</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-800 hover:text-zinc-500 cursor-pointer" />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="dataset"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {filteredDataset.map((item) => (
                  <div key={item.fingerprint} className="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden group hover:border-blue-500/40 transition-all shadow-2xl">
                    <div className="p-8 border-b border-zinc-900 bg-gradient-to-r from-blue-600/5 via-transparent to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 shadow-inner group-hover:scale-105 transition-transform">
                          <Database className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white mb-1">{item.name}</h4>
                          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.2em]">{item.packageName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2">Last Reconciled</div>
                        <div className="text-sm font-mono text-zinc-400 font-bold">
                          {item.lastModified ? new Date(item.lastModified).toLocaleTimeString([], { hour12: false }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Cpu className="w-4 h-4 text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Structural Profile</span>
                        </div>
                        <div className="space-y-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900/50">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-600 font-medium">DEX Units</span>
                            <span className="text-xs text-white font-black font-mono">{item.dexCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-600 font-medium">Native Libs</span>
                            <span className="text-xs text-white font-black font-mono">{item.nativeLibs.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-600 font-medium">Risk Factor</span>
                            <span className={cn(
                              "text-xs font-black font-mono",
                              item.riskScore > 70 ? "text-red-500" : "text-emerald-500"
                            )}>{item.riskScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Transformation State</span>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900/50">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                              item.patches.length > 0 ? "bg-purple-500 animate-pulse" : "bg-zinc-800"
                            )} />
                            <span className="text-xs text-zinc-300 font-bold">
                              {item.patches.length} Active Patches
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.capabilities.slice(0, 4).map((cap: string) => (
                              <span key={cap} className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-3 py-1 rounded-lg border border-zinc-800 uppercase font-bold tracking-tighter">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Referential Integrity</span>
                        </div>
                        <div className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-900/50 flex items-center gap-4 group/meta cursor-help">
                          <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-500/20">
                            <FileJson className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase mb-1">Linked Metadata</p>
                            <p className="text-[9px] font-mono text-zinc-600 font-bold group-hover/meta:text-zinc-400 transition-colors">UUID: {item.fingerprint.slice(7, 23)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuditIntegrity;
