/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ModuleType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import APKIngestion from './components/APKIngestion';
import TransformationLab from './components/TransformationLab';
import RuntimeAnalysis from './components/RuntimeAnalysis';
import AILaboratory from './components/AILaboratory';
import BuildEngine from './components/BuildEngine';
import AuditIntegrity from './components/AuditIntegrity';
import AIAssistant from './components/AIAssistant';
import PluginManager from './components/PluginManager';
import { Terminal, Shield, Zap, Search, ShieldCheck, AlertTriangle, Info, ShieldAlert, X, Activity } from 'lucide-react';
import { AppProvider, useApp } from './AppContext';
import { cn } from './lib/utils';

const AppContent = () => {
  const { alerts, dismissAlert, profiles, isLoading, addAlert } = useApp();
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Network Connection Monitoring
  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      addAlert({
        title: 'NETWORK DISCONNECTED',
        message: 'Aether Engine entered Offline Mode.',
        severity: 'MEDIUM',
        details: 'Transitioned to localized heuristics and on-device execution models. Some remote AI telemetry will be unavailable until connection is restored.',
      });
    };
    
    const handleOnline = () => {
      setIsOnline(true);
      addAlert({
        title: 'NETWORK RESTORED',
        message: 'Aether Engine reconnected to core telemetry.',
        severity: 'LOW',
        details: 'Synchronizing audit trails and enabling full multi-modal AI intelligence models.',
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [addAlert]);

  // Simulated Telemetry Monitor
  useEffect(() => {
    if (!profiles.length) return;
    
    const anomalyInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        addAlert({
          title: 'Runtime Semantic Anomaly',
          message: 'Divergence detected in target process heap layout during JIT compilation.',
          severity: 'HIGH',
          details: 'Impact: Potential application crash due to memory misalignment. Mitigation: Re-run R8 shrinker with conservative mapping rules.',
        });
      }
    }, 45000); // Check every 45s

    return () => clearInterval(anomalyInterval);
  }, [profiles, addAlert]);

  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return <Dashboard />;
      case 'ingestion': return <APKIngestion />;
      case 'transformation': return <TransformationLab />;
      case 'runtime': return <RuntimeAnalysis />;
      case 'ai-lab': return <AILaboratory />;
      case 'build': return <BuildEngine />;
      case 'audit': return <AuditIntegrity />;
      case 'plugins': return <PluginManager />;
      default: return <Dashboard />;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'MEDIUM': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getAlertBorder = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'border-rose-500/50 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.2)]';
      case 'HIGH': return 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]';
      case 'MEDIUM': return 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]';
      default: return 'border-zinc-700 bg-zinc-900/80';
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 relative">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Global Alerts Overlay */}
        <div className="absolute top-20 right-8 z-[100] flex flex-col gap-4 w-[400px] pointer-events-none">
          <AnimatePresence>
            {alerts.filter(a => !a.read).map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                className={cn(
                  "p-4 rounded-xl border backdrop-blur-xl pointer-events-auto flex gap-4 items-start",
                  getAlertBorder(alert.severity)
                )}
              >
                <div className="shrink-0 mt-1">{getAlertIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider">{alert.message}</h4>
                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono mb-3 leading-relaxed">{alert.details}</p>
                  <div className="space-y-2">
                    <div className="bg-black/50 p-2 rounded border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Impact</span>
                      <span className="text-[10px] text-zinc-300 font-mono">{alert.impact}</span>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-white/5">
                      <span className="text-[10px] text-emerald-500 uppercase font-black block mb-1">Mitigation Suggestion</span>
                      <span className="text-[10px] text-zinc-300 font-mono">{alert.mitigation}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-600 font-mono mt-3 text-right">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Top Header Bar */}
        <header className="h-16 border-b border-amber-900/40 bg-black/60 shadow-[0_5px_30px_rgba(245,158,11,0.05)] backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-amber-500">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest font-black">Session: 0xEL1T3...</span>
            </div>
            <div className="h-4 w-px bg-amber-900/50" />
            <div className="flex items-center gap-2 text-amber-400/80">
              <Shield className="w-4 h-4 text-emerald-500/90" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Integrity: <span className="text-emerald-500">VERIFIED</span></span>
            </div>
            <div className="h-4 w-px bg-amber-900/50" />
            <div className="flex items-center gap-2 text-rose-500 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-rose-500/10 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase font-black tracking-widest drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">LIVE MEMORY (ELITE ADMIN)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search APKs, Methods, or Patches..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              Aether AI
            </button>
          </div>
        </header>

        {/* Global Loading Bar */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 2 }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-16 left-0 right-0 bg-zinc-900 z-50 overflow-hidden"
            >
              <div className="w-full h-full relative">
                <motion.div 
                  className="absolute inset-y-0 w-1/3 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  initial={{ left: '-33%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24 relative">
          
          {/* Global Alerts Overlay */}
          <div className="absolute top-8 right-8 z-[100] flex flex-col gap-4 max-w-sm pointer-events-none">
            <AnimatePresence>
              {alerts.filter(a => !a.read).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  className={cn(
                    "pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex gap-4",
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' :
                    alert.severity === 'HIGH' ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
                    alert.severity === 'MEDIUM' ? 'bg-blue-500/10 border-blue-500/50' :
                    'bg-zinc-900 border-zinc-800'
                  )}
                >
                  <div className="mt-0.5">
                    {alert.severity === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                    {alert.severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {alert.severity === 'MEDIUM' && <Activity className="w-5 h-5 text-blue-500" />}
                    {alert.severity === 'LOW' && <Info className="w-5 h-5 text-zinc-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn(
                        "text-sm font-bold uppercase tracking-widest",
                        alert.severity === 'CRITICAL' ? 'text-rose-500' :
                        alert.severity === 'HIGH' ? 'text-amber-500' :
                        alert.severity === 'MEDIUM' ? 'text-blue-500' :
                        'text-zinc-300'
                      )}>{alert.title || alert.severity + " ALERT"}</h4>
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-2">{alert.message}</p>
                    {alert.details && (
                      <p className="text-[10px] font-mono text-zinc-500 leading-relaxed bg-black/40 p-2 rounded">
                        {alert.details}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Status Bar Footer */}
        <footer className="absolute bottom-0 left-0 right-0 h-10 bg-zinc-950 border-t border-amber-900/50 flex items-center justify-between px-6 z-20 backdrop-blur-md bg-opacity-80 shadow-[0_-5px_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-6 text-[10px] font-mono text-amber-500/50 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", !isOnline ? "bg-red-500" : "bg-amber-500")} />
              <span>System: {!isOnline ? 'Edge Offline' : 'Online'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">Engine: v3.0.0-ELITE</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Persistence: Crypto-Vault</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 font-bold">
            <span className="text-amber-500/50">QUANTUM LATENCY: 2ms</span>
            <span className="text-amber-500/50">UPTIME: 100.0%</span>
            <span className="text-amber-900">|</span>
            <span className="text-amber-700">© 2026 AETHER ELITE LABS</span>
          </div>
        </footer>

        {/* AI Assistant Drawer */}
        <AIAssistant isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


