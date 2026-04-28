import React, { useMemo, useState, useEffect } from 'react';
import { 
  Zap, 
  Shield,
  ShieldAlert,
  Cpu, 
  Activity, 
  ArrowUpRight, 
  Layers,
  Unlock,
  History,
  Terminal,
  Fingerprint,
  Clock,
  Gauge,
  Network,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { profiles, auditTrail, appliedPatches, memoryEdits, alerts } = useApp();
  const [liveLoad, setLiveLoad] = useState(42);
  const [chartData, setChartData] = useState<any[]>([]);

  // Simulate live engine load
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLoad(prev => {
        const delta = (Math.random() - 0.5) * 10;
        return Math.min(Math.max(prev + delta, 20), 85);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and update chart data
  useEffect(() => {
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    const initialData = hours.map((h, i) => ({
      name: h,
      load: 30 + Math.random() * 40,
      activity: (auditTrail.length / 10) + i * 5
    }));
    setChartData(initialData);
  }, [auditTrail.length]);

  const totalPatches = useMemo(() => {
    return Object.values(appliedPatches).reduce((acc, curr) => acc + curr.length, 0);
  }, [appliedPatches]);

  const totalMemoryEdits = useMemo(() => {
    return Object.values(memoryEdits).reduce((acc, curr) => acc + curr.length, 0);
  }, [memoryEdits]);

  const stats = [
    { label: 'Active Profiles', value: profiles.length, icon: Layers, color: 'text-blue-500', trend: 'Live', desc: 'Ingested APKs' },
    { label: 'Applied Patches', value: totalPatches, icon: Zap, color: 'text-purple-500', trend: 'Verified', desc: 'Bytecode Mods' },
    { label: 'Memory Overrides', value: totalMemoryEdits, icon: Cpu, color: 'text-amber-500', trend: 'In-Place', desc: 'Runtime Edits' },
    { label: 'Security Audit', value: auditTrail.length, icon: Shield, color: 'text-emerald-500', trend: 'Secured', desc: 'Integrity Logs' },
  ];

  return (
    <div className="space-y-8 h-full overflow-y-auto custom-scrollbar pr-2 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative overflow-hidden p-6 glass-panel border-amber-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 -mr-32 -mt-32 rounded-full blur-3xl z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Elite <span className="text-amber-500">Command</span>
            </h2>
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-500 text-[10px] font-black tracking-widest uppercase">
              Premium Tier
            </div>
          </div>
          <p className="text-amber-500/60 font-mono text-xs uppercase tracking-[0.3em] font-bold">Aether Analysis Engine — v3.0.0-ELITE</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="bg-black/50 backdrop-blur px-6 py-3 flex items-center gap-4 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div className="text-right">
              <p className="text-[10px] font-mono text-amber-500/70 uppercase font-black">Quantum Load</p>
              <p className="text-xl font-black text-amber-400 font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{liveLoad.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-950 flex items-center justify-center relative">
              <svg className="w-full h-full -rotate-90">
                 <circle
                  cx="24" cy="24" r="20"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-amber-600/20"
                />
                <circle
                  cx="24" cy="24" r="20"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 * (1 - liveLoad / 100)}
                  className="text-amber-500 transition-all duration-1000"
                />
              </svg>
              <Activity className="w-4 h-4 text-amber-500 absolute animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 hover:border-zinc-700 transition-all group cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-900/20 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={cn("p-3 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-inner", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 uppercase tracking-tighter">
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase">{stat.desc}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  Performance Analytics
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 uppercase">Historical load and activity metrics</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">System Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Activity</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#3f3f46" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#3f3f46" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorLoad)" 
                    strokeWidth={3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorActivity)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Elite Threat Config
                </span>
                <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-2 py-0.5 rounded text-[10px] shadow-lg">PREMIUM</span>
              </h4>
              <div className="flex-1 flex flex-col gap-3 relative z-10">
                <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mb-2">
                  Threat models are dynamically synthesized via Aether AI. Live ingestion streams update heuristic bounds automatically.
                </p>
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">Obfuscation Evader</span>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full border border-emerald-500/50 flex items-center justify-end px-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">Dynamic Unpacking Shield</span>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full border border-emerald-500/50 flex items-center justify-end px-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">Network Exfiltration</span>
                    <div className="w-8 h-4 bg-zinc-800 rounded-full border border-zinc-700 flex items-center px-1">
                      <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

            <div className="glass-panel p-6 border-emerald-500/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-500" />
                Network Status
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Uplink</span>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">124.5 MB/s</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[75%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Downlink</span>
                  <span className="text-[10px] font-mono text-blue-500 font-bold">42.1 MB/s</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[40%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col overflow-hidden border-zinc-800 shadow-2xl">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <History className="w-4 h-4 text-purple-500" />
              Audit Stream
            </h3>
            <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[8px] font-mono text-zinc-500 uppercase">
              Live
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-black/20">
            {auditTrail.slice(0, 12).map((log, i) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 group relative"
              >
                <div className="absolute left-4 top-10 bottom-0 w-px bg-zinc-900 group-last:hidden" />
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-800 shadow-lg relative z-10 transition-all group-hover:scale-110",
                  log.module === 'ingestion' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  log.module === 'transformation' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                  log.module === 'build' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                )}>
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{log.action}</p>
                    <p className="text-[8px] font-mono text-zinc-700 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2 font-mono italic">{log.details}</p>
                </div>
              </motion.div>
            ))}
            {auditTrail.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-50">
                <Clock className="w-16 h-16 mb-4" />
                <p className="uppercase tracking-[0.3em] text-[10px] font-black">No Logs Detected</p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-zinc-900 bg-zinc-900/10">
            <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <Terminal className="w-6 h-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-white font-black uppercase tracking-tighter">Aether Core</p>
                <p className="text-[9px] text-zinc-500 font-mono uppercase">Node: US-WEST-1A // 0xAF32</p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
