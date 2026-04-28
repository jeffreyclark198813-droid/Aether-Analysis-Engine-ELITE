import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Search, 
  Terminal, 
  Play, 
  Square, 
  RefreshCcw, 
  ChevronRight, 
  Shield, 
  ShieldAlert,
  Lock,
  Eye,
  Edit3,
  Save,
  Trash2,
  AlertTriangle,
  Layers,
  Network,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';

const RuntimeAnalysis: React.FC = () => {
  const { selectedProfile, memoryEdits, addMemoryEdit, auditTrail, plugins, addAlert } = useApp();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'memory' | 'alerts'>('telemetry');
  const [isRunning, setIsRunning] = useState(false);
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<{ address: string, value: string } | null>(null);
  const [editingError, setEditingError] = useState('');

  // Simulated Memory Regions
  const memoryRegions = useMemo(() => [
    { name: 'Stack', start: '0x7FF00000', size: '2MB', type: 'RW', color: 'text-blue-500' },
    { name: 'Heap', start: '0x10000000', size: '128MB', type: 'RW', color: 'text-emerald-500' },
    { name: '.text', start: '0x00400000', size: '16MB', type: 'RX', color: 'text-purple-500' },
    { name: '.data', start: '0x00600000', size: '4MB', type: 'RW', color: 'text-amber-500' },
    { name: 'Shared Libs', start: '0x70000000', size: '64MB', type: 'RX', color: 'text-rose-500' },
  ], []);

  // Simulated Memory Content
  const memoryContent = useMemo(() => {
    const content: any[] = [];
    const base = parseInt(selectedRegion || '0x10000000', 16);
    const profileEdits = memoryEdits[selectedProfile?.fingerprint || ''] || [];

    for (let i = 0; i < 100; i++) {
      const addr = '0x' + (base + i * 16).toString(16).toUpperCase();
      const bytes = Array.from({ length: 16 }, (_, j) => {
        const cellAddr = `${addr}_${j}`;
        const edit = profileEdits.find(e => e.address === cellAddr);
        return edit ? edit.newValue : Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
      });
      
      const ascii = bytes.map(b => {
        const charCode = parseInt(b, 16);
        return (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : '.';
      }).join('');
      
      content.push({ address: addr, bytes, ascii });
    }
    return content;
  }, [selectedRegion, memoryEdits, selectedProfile]);

  useEffect(() => {
    if (isRunning) {
      const isDeepTraceActive = plugins.some(p => p.id === 'plugin_deeptrace' && p.status === 'active');
      
      const interval = setInterval(() => {
        setTelemetryData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString(),
            latency: Math.random() * 50 + 10,
            cpu: Math.random() * 40 + 20,
            memory: Math.random() * 200 + 400,
            network: Math.random() * 100,
          }].slice(-20);
          return newData;
        });

        // DeepTrace Anomaly Simulation
        if (isDeepTraceActive && Math.random() > 0.85) {
          addAlert({
            severity: 'HIGH',
            message: 'Runtime Anomaly Detected',
            details: 'DeepTrace heuristic identified unusual heap allocation latency spike. Potential logic bomb or infinite loop in background service.',
            impact: 'Application freeze or OOM (Out Of Memory) crash vector.',
            mitigation: 'Intercept allocation at 0x10000000 and dump trace for analysis.'
          });
        }
      }, 3000); // Slower interval for visibility
      return () => clearInterval(interval);
    }
  }, [isRunning, plugins, addAlert]);

  const handleSaveEdit = () => {
    if (editingValue && selectedProfile) {
      const addr = editingValue.address;
      const newValue = editingValue.value;

      if (!/^[0-9A-Fa-f]{1,2}$/.test(newValue)) {
        setEditingError('Must be a valid hex value (00-FF)');
        return;
      }
      setEditingError('');
      
      // Find original value from memoryContent if possible
      const [rowAddr, byteIdx] = addr.split('_');
      const row = memoryContent.find(r => r.address === rowAddr);
      const originalValue = row ? row.bytes[parseInt(byteIdx)] : '??';

      addMemoryEdit(selectedProfile.fingerprint, {
        address: addr,
        newValue: newValue,
        originalValue: originalValue,
        timestamp: new Date().toISOString(),
        description: `Manual memory override at ${addr} via Aether Runtime`
      });
      setEditingValue(null);
    }
  };

  const handleCommitChanges = () => {
    if (!selectedProfile) return;
    const edits = memoryEdits[selectedProfile.fingerprint] || [];
    if (edits.length === 0) return;
    
    // In a real app, this would push to the device/emulator
    // Here we just log the commitment
    const { addAuditLog } = useApp();
    addAuditLog('runtime', 'MEMORY_COMMITTED', `Committed ${edits.length} memory overrides to process memory space.`);
    
    // Visual feedback
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 1000);
  };

  return (
    <div className="flex flex-col h-full gap-8 overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between glass-panel p-4">
        <div className="flex items-center gap-6">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'telemetry' ? "bg-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Activity className="w-4 h-4" />
              Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('memory')}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'memory' ? "bg-amber-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Database className="w-4 h-4" />
              Memory Editor
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'alerts' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <ShieldAlert className="w-4 h-4" />
              Risk Framework Config
            </button>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-lg uppercase tracking-widest",
                isRunning 
                  ? "bg-rose-500/10 border-rose-500/50 text-rose-500 hover:bg-rose-500/20" 
                  : "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 border-amber-500/50 shadow-amber-900/20"
              )}
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'HALT EXECUTION' : 'ENGAGE ELITE HOOK'}
            </button>
            <button className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 transition-colors border border-transparent hover:border-zinc-800 shadow-inner">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <Shield className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Elite Sandbox Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg">
            <Lock className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Encrypted Stream</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'telemetry' ? (
            <motion.div 
              key="telemetry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
            >
              {/* Main Charts */}
              <div className="lg:col-span-2 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
                <div className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Execution Latency (ms)
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Real-time</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryData}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#52525b" fontSize={10} tickFormatter={(v) => `${v}ms`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                          itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-panel p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                      <Cpu className="w-4 h-4 text-purple-500" />
                      CPU Utilization
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#52525b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="cpu" stroke="#a855f7" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass-panel p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                      <Network className="w-4 h-4 text-emerald-500" />
                      Network Throughput
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={telemetryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#52525b" fontSize={10} tickFormatter={(v) => `${v}kb/s`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                          />
                          <Bar dataKey="network" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="flex flex-col gap-8">
                <div className="glass-panel p-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-blue-500" />
                    System Health
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Heap Allocation', value: '412 MB', progress: 65, color: 'bg-blue-500' },
                      { label: 'Thread Count', value: '42 Active', progress: 40, color: 'bg-purple-500' },
                      { label: 'GC Pressure', value: 'Low', progress: 15, color: 'bg-emerald-500' },
                      { label: 'JIT Cache', value: '12.4 MB', progress: 82, color: 'bg-amber-500' },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-zinc-500 uppercase">{stat.label}</span>
                          <span className="text-white font-bold">{stat.value}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.progress}%` }}
                            className={cn("h-full", stat.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-zinc-900 bg-zinc-900/30">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-zinc-500" />
                      Live Event Stream
                    </h3>
                  </div>
                  <div className="flex-1 p-4 font-mono text-[10px] space-y-2 overflow-y-auto custom-scrollbar bg-black/50">
                    {auditTrail.slice(-20).reverse().map((log, i) => (
                      <div key={i} className="flex gap-3 group">
                        <span className="text-zinc-700 select-none">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          <span className="text-blue-500 font-bold">{log.module}</span>: {log.action}
                        </span>
                      </div>
                    ))}
                    {auditTrail.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-50">
                        <Activity className="w-8 h-8 mb-2" />
                        <p className="uppercase tracking-widest text-[8px]">No events recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'alerts' ? (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="glass-panel p-6 mb-8 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 relative z-10">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Customizable Risk Framework & Telemetry Rules
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-2 max-w-2xl relative z-10 leading-relaxed">
                  Configure real-time monitoring constraints. When defined heuristics are breached, the system evaluates the potential consequences and automatically generates mitigation strategies based on active Elite parameters.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                  {
                    id: 'rule_1',
                    category: 'Heap Memory Allocation',
                    breachCondition: 'Delta > 10MB/sec',
                    consequence: 'Logic bomb execution or dynamic payload unpacking',
                    mitigation: 'Force GC and intercept native malloc bounds',
                    enabled: true,
                    severity: 'HIGH'
                  },
                  {
                    id: 'rule_2',
                    category: 'Network Socket Exfiltration',
                    breachCondition: 'Unexpected TLS Handshake',
                    consequence: 'Command & Control server communication',
                    mitigation: 'Nullify socket descriptor and inject fake success code',
                    enabled: true,
                    severity: 'CRITICAL'
                  },
                  {
                    id: 'rule_3',
                    category: 'JIT Profiler Misalignment',
                    breachCondition: 'ART Cyclomatic Divergence',
                    consequence: 'Method virtualization or control flow flattening',
                    mitigation: 'Fallback to interpreted mode temporarily',
                    enabled: false,
                    severity: 'MEDIUM'
                  },
                  {
                    id: 'rule_4',
                    category: 'Cryptographic API Abuse',
                    breachCondition: 'KeyStore Invalidation',
                    consequence: 'Weakened encryption keys or bypassed DRM',
                    mitigation: 'Hook KeyGenerator and spoof root-of-trust',
                    enabled: true,
                    severity: 'CRITICAL'
                  }
                ].map((rule) => (
                  <div key={rule.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 transition-all hover:bg-zinc-900/50 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", 
                            rule.severity === 'CRITICAL' ? "bg-rose-500/20 text-rose-500" : 
                            rule.severity === 'HIGH' ? "bg-amber-500/20 text-amber-500" :
                            "bg-blue-500/20 text-blue-500"
                          )}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-widest uppercase">{rule.category}</h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold mt-1">Rule ID: {rule.id.toUpperCase()}</p>
                          </div>
                        </div>
                        <button className="relative w-12 h-6 bg-black rounded-full border border-zinc-800 transition-colors">
                          <div className={cn("absolute top-1 left-1 w-4 h-4 rounded-full transition-all shadow", rule.enabled ? "bg-emerald-500 translate-x-6" : "bg-zinc-700")} />
                        </button>
                      </div>
                      
                      <div className="space-y-4 mb-6 relative">
                        <div className="absolute left-1 top-2 bottom-2 w-px bg-zinc-800" />
                        <div className="pl-4 relative">
                          <div className="absolute left-[3px] top-1.5 w-1 h-1 rounded-full bg-zinc-500" />
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Breach Event</p>
                          <p className="text-xs text-white font-mono mt-1 bg-zinc-900 px-2 py-1 inline-block rounded">{rule.breachCondition}</p>
                        </div>
                        <div className="pl-4 relative">
                          <div className="absolute left-[3px] top-1.5 w-1 h-1 rounded-full bg-zinc-500" />
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Consequence</p>
                          <p className="text-xs text-rose-400 font-mono mt-1">{rule.consequence}</p>
                        </div>
                        <div className="pl-4 relative">
                          <div className="absolute left-[3px] top-1.5 w-1 h-1 rounded-full bg-zinc-500" />
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Auto-Mitigation</p>
                          <p className="text-xs text-emerald-400 font-mono mt-1">{rule.mitigation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                         Edit Rule
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="memory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full"
            >
              {/* Memory Regions Sidebar */}
              <div className="glass-panel flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-900 bg-zinc-900/30">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    Memory Map
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                  {memoryRegions.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => setSelectedRegion(region.start)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all group",
                        selectedRegion === region.start 
                          ? "bg-blue-600/10 border-blue-500/50" 
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn("text-xs font-bold uppercase tracking-tight", region.color)}>
                          {region.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          {region.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>{region.start}</span>
                        <span>{region.size}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hex Editor View */}
              <div className="lg:col-span-3 glass-panel flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text"
                        placeholder="Search address or pattern (e.g. 0x7FF...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    <div className="h-6 w-px bg-zinc-800" />
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-zinc-500">OFFSET: {selectedRegion || '0x00000000'}</span>
                    <button 
                      onClick={handleCommitChanges}
                      disabled={!selectedProfile || !(memoryEdits[selectedProfile.fingerprint]?.length)}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Commit Changes
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] p-6 bg-black/30">
                  <div className="grid grid-cols-[auto_1fr_auto] gap-8">
                    {/* Header Row */}
                    <div className="text-zinc-700 select-none">ADDRESS</div>
                    <div className="grid grid-cols-16 gap-2 text-zinc-700 select-none text-center">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i}>{i.toString(16).toUpperCase().padStart(2, '0')}</div>
                      ))}
                    </div>
                    <div className="text-zinc-700 select-none">ASCII</div>

                    {/* Content Rows */}
                    {memoryContent.map((row, i) => (
                      <React.Fragment key={row.address}>
                        <div className="text-zinc-500 select-none">{row.address}</div>
                        <div className="grid grid-cols-16 gap-2">
                          {row.bytes.map((byte, j) => {
                            const addr = `${row.address}_${j}`;
                            const isEdited = memoryEdits[selectedProfile?.fingerprint || '']?.find((e: any) => e.address === addr);
                            
                            return (
                              <button 
                                key={j}
                                onClick={() => setEditingValue({ address: addr, value: byte })}
                                className={cn(
                                  "text-center transition-all hover:bg-blue-500/20 rounded px-1",
                                  isEdited ? "text-emerald-400 font-bold" : "text-zinc-400",
                                  editingValue?.address === addr && "bg-blue-600 text-white"
                                )}
                              >
                                {isEdited?.newValue || byte}
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-zinc-600 select-none tracking-widest">{row.ascii}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Edit Modal / Tooltip */}
                <AnimatePresence>
                  {editingValue && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-8 right-8 glass-panel p-6 w-80 shadow-2xl border-blue-500/30"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Edit Memory</h4>
                        <button onClick={() => { setEditingValue(null); setEditingError(''); }} className="text-zinc-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Address</label>
                          <div className="bg-zinc-950 border border-zinc-900 p-2 rounded text-xs text-blue-400 font-mono">
                            {editingValue.address}
                          </div>
                        </div>
                        <div className="space-y-2 relative">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">New Value (HEX)</label>
                          <input 
                            type="text"
                            maxLength={2}
                            value={editingValue.value}
                            onChange={(e) => {
                              setEditingValue({ ...editingValue, value: e.target.value.toUpperCase() });
                              if (editingError) setEditingError('');
                            }}
                            className={cn(
                              "w-full bg-zinc-950 border rounded p-2 text-xs text-white font-mono focus:outline-none transition-colors",
                              editingError ? "border-rose-500 focus:border-rose-500" : "border-zinc-800 focus:border-blue-500"
                            )}
                          />
                          {editingError && (
                            <p className="text-[10px] text-rose-500 mt-1 font-mono">{editingError}</p>
                          )}
                        </div>
                        <button 
                          onClick={handleSaveEdit}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold transition-all mt-2"
                        >
                          APPLY OVERRIDE
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Status */}
      <div className="glass-panel p-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isRunning ? "bg-emerald-500" : "bg-rose-500")} />
            <span>Engine: {isRunning ? 'Active' : 'Standby'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            <span>Load: {isRunning ? '12.4%' : '0.2%'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            <span>Memory: {isRunning ? '412MB' : '12MB'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>PID: 1337</span>
          <span>ARCH: ARM64-V8A</span>
          <div className="flex items-center gap-1 text-blue-500">
            <AlertTriangle className="w-3 h-3" />
            <span>Live Debugging Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuntimeAnalysis;
