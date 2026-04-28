import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  GitBranch, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Terminal,
  Cpu,
  Zap,
  Lock,
  Unlock,
  ShieldCheck,
  Database,
  RefreshCw,
  Puzzle,
  Crown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ModuleType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const handleReset = () => {
    if (window.confirm('WARNING: This will clear all ingested profiles, patches, and memory edits. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ingestion', label: 'Ingestion', icon: FileUp },
    { id: 'transformation', label: 'Transformation', icon: GitBranch },
    { id: 'runtime', label: 'Runtime Analysis', icon: Activity },
    { id: 'risk', label: 'Risk Modeling', icon: ShieldAlert },
    { id: 'ai-lab', label: 'AI Laboratory', icon: Sparkles },
    { id: 'build', label: 'Build Engine', icon: Zap },
    { id: 'audit', label: 'Audit & Integrity', icon: ShieldCheck },
    { id: 'plugins', label: 'Plugin Architecture', icon: Puzzle },
  ] as const;

  return (
    <div className="w-64 h-screen bg-black border-r border-amber-900/30 flex flex-col p-4 gap-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 px-2 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          <Crown className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tighter text-xl">AETHER ELITE</h1>
          <p className="text-amber-500/80 text-[10px] font-mono uppercase tracking-widest font-black">Premium Edition</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
              activeModule === item.id 
                ? "bg-amber-900/20 text-amber-400 border border-amber-900/50 shadow-[inset_0_1px_1px_rgba(245,158,11,0.1)]" 
                : "text-zinc-500 hover:text-amber-100 hover:bg-amber-900/10 border border-transparent"
            )}
          >
            {activeModule === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            )}
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeModule === item.id ? "text-amber-400" : "text-zinc-600 group-hover:text-amber-500/50"
            )} />
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
            {activeModule === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-amber-900/30 space-y-4 relative z-10">
        <div className="bg-amber-950/20 rounded-xl p-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-xs font-mono font-black tracking-widest">SYSTEM STATUS</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500 uppercase">Engine Tiers</span>
              <span className="text-amber-400 font-black">ALL UNLOCKED</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500 uppercase">Circumvention</span>
              <span className="text-amber-400 flex items-center gap-1 font-black">
                <ShieldCheck className="w-2 h-2" />
                ACTIVE
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2 border border-zinc-800">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[98%] animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all text-[10px] font-mono uppercase tracking-widest group"
        >
          <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          Reset Environment
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
