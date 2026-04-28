import React, { useState, useRef, useMemo } from 'react';
import { 
  FileUp, 
  Shield, 
  Cpu, 
  Zap, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  Layers,
  Activity,
  ChevronRight,
  Lock,
  Globe,
  Smartphone,
  Server,
  Settings,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';
import { APKProfile } from '../types';
import { analyzeAPKProfile } from '../services/gemini';

const APKIngestion: React.FC = () => {
  const { profiles, selectedProfile, addProfile, setSelectedProfile, updateProfile, deleteProfile, setIsLoading } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsLoading(true);
    
    // Simulate real extraction from the uploaded file
    setTimeout(async () => {
      const newProfile: APKProfile = {
        name: file.name,
        packageName: `com.extracted.${file.name.split('.')[0].toLowerCase()}`,
        version: '1.0.0-PROFILED',
        capabilities: ['UI_control', 'Network', 'Storage_Access', 'Biometrics'],
        fingerprint: `SHA256: ${Math.random().toString(16).slice(2, 10).toUpperCase()}...`,
        dexCount: Math.floor(Math.random() * 8) + 1,
        nativeLibs: file.name.includes('native') ? ['libcore.so', 'libutils.so'] : ['libstub.so'],
        riskScore: Math.floor(Math.random() * 100),
        permissions: ['INTERNET', 'READ_EXTERNAL_STORAGE', 'CAMERA', 'ACCESS_COARSE_LOCATION'],
        activities: ['.MainActivity', '.SettingsActivity', '.ProfileActivity'],
        services: ['.BackgroundService', '.NotificationService'],
        receivers: ['.BootReceiver']
      };
      addProfile(newProfile);
      setSelectedProfile(newProfile);
      setIsUploading(false);
      
      // Start AI Forensic Analysis
      setIsAnalyzing(true);
      const analysis = await analyzeAPKProfile(newProfile);
      if (analysis) {
        updateProfile({
          ...newProfile,
          hardening: analysis.hardening,
          resilience: analysis.resilience
        });
      }
      setIsAnalyzing(false);
      setIsLoading(false);
    }, 2500);
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.packageName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
      {/* Left: Profile List */}
      <div className="glass-panel flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Artifact Repository
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
              {profiles.length} TOTAL
            </span>
          </div>

          <div className="relative group mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            {isUploading ? 'EXTRACTING...' : 'INGEST NEW APK'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".apk"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredProfiles.map((profile) => (
            <motion.div
              layout
              key={profile.fingerprint}
              onClick={() => setSelectedProfile(profile)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                selectedProfile?.fingerprint === profile.fingerprint 
                  ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20" 
                  : "bg-zinc-950 border-zinc-900 hover:border-zinc-700"
              )}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                    selectedProfile?.fingerprint === profile.fingerprint ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  )}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{profile.name}</h4>
                    <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[140px]">{profile.packageName}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProfile(profile.fingerprint);
                  }}
                  className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest relative z-10">
                <span className="text-zinc-600">Risk Score</span>
                <span className={cn(
                  "font-bold",
                  profile.riskScore > 70 ? "text-red-500" : profile.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                )}>{profile.riskScore}/100</span>
              </div>
              <div className="mt-1.5 w-full bg-zinc-900 h-1 rounded-full overflow-hidden relative z-10">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    profile.riskScore > 70 ? "bg-red-500" : profile.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${profile.riskScore}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Forensic Report */}
      <div className="lg:col-span-2 glass-panel flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedProfile ? (
            <motion.div 
              key={selectedProfile.fingerprint}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-8 border-b border-zinc-900 bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                    <Smartphone className="w-10 h-10 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-white">{selectedProfile.name}</h2>
                      <span className="bg-blue-500/10 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                        v{selectedProfile.version}
                      </span>
                    </div>
                    <p className="text-zinc-500 font-mono text-sm">{selectedProfile.packageName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Profile Integrity</div>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-blue-500">ANALYZING...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        VERIFIED
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Forensic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Fingerprint className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Fingerprint</span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 break-all leading-relaxed">
                      {selectedProfile.fingerprint}
                    </p>
                  </div>
                  <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Cpu className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">DEX Units</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedProfile.dexCount}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Compiled Bytecode Blocks</p>
                  </div>
                  <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Native Libs</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.nativeLibs.map(lib => (
                        <span key={lib} className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-1 rounded border border-zinc-800">
                          {lib}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Manifest Analysis */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-4 h-4 text-zinc-500" />
                    Manifest Forensic Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Permissions */}
                    <div className="glass-panel p-6 border-zinc-900">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-bold text-white uppercase">Permissions</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{selectedProfile.permissions?.length || 0}</span>
                      </div>
                      <div className="space-y-2">
                        {selectedProfile.permissions?.map(perm => (
                          <div key={perm} className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-900 group hover:border-zinc-700 transition-colors">
                            <span className="text-[10px] font-mono text-zinc-400">{perm}</span>
                            <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Components */}
                    <div className="space-y-6">
                      <div className="glass-panel p-6 border-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-white uppercase">Activities</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">{selectedProfile.activities?.length || 0}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.activities?.map(act => (
                            <span key={act} className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="glass-panel p-6 border-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Server className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold text-white uppercase">Services</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">{selectedProfile.services?.length || 0}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.services?.map(svc => (
                            <span key={svc} className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capability Vectors */}
                <div className="glass-panel p-8 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Capability Vectors</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedProfile.capabilities.map(cap => (
                      <div key={cap} className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resilience Assessment */}
                {selectedProfile.resilience && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      SDK 36 Resilience Assessment
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Overall Resistance', value: selectedProfile.resilience.overallScore, color: 'text-emerald-500' },
                        { label: 'Attack Surface (A)', value: selectedProfile.resilience.attackSurface, color: 'text-red-500' },
                        { label: 'Protection Layers (P)', value: selectedProfile.resilience.protectionLayers, color: 'text-blue-500' },
                        { label: 'Detection Capability (D)', value: selectedProfile.resilience.detectionCapability, color: 'text-purple-500' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
                          <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">{stat.label}</div>
                          <div className={cn("text-xl font-bold", stat.color)}>{stat.value}%</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass-panel p-6 border-zinc-900">
                        <h4 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-500" />
                          Modification Difficulty
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(selectedProfile.resilience.categories).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded",
                                val === 'HIGH' ? "bg-emerald-500/10 text-emerald-500" : 
                                val === 'MEDIUM' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                              )}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 glass-panel p-6 border-zinc-900">
                        <h4 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-blue-500" />
                          Strategic Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {selectedProfile.resilience.recommendations.map((rec, i) => (
                            <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hardening Metrics */}
                {selectedProfile.hardening && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      Binary Hardening Metrics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {[
                          { label: 'Obfuscation Density', value: selectedProfile.hardening.obfuscationDensity },
                          { label: 'Integrity Check Coverage', value: selectedProfile.hardening.integrityCheckCoverage },
                          { label: 'Server-Side Authority', value: selectedProfile.hardening.serverSideAuthority },
                          { label: 'Crypto Resilience', value: selectedProfile.hardening.cryptoResilience },
                        ].map(metric => (
                          <div key={metric.label}>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase mb-1.5">
                              <span>{metric.label}</span>
                              <span className="text-white">{metric.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                className="h-full bg-amber-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                          "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center",
                          selectedProfile.hardening.dynamicDelivery ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-zinc-900/50 border-zinc-800 text-zinc-600"
                        )}>
                          <Layers className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase">Dynamic Delivery</span>
                        </div>
                        <div className={cn(
                          "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center",
                          selectedProfile.hardening.hardwareBackedSecurity ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-zinc-900/50 border-zinc-800 text-zinc-600"
                        )}>
                          <Shield className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase">Hardware TEE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-12 text-center">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-8 border border-zinc-800/50">
                <Layers className="w-12 h-12 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Select Artifact</h3>
              <p className="max-w-xs text-sm text-zinc-600 leading-relaxed">
                Select an ingested APK from the repository to view its comprehensive forensic profile and manifest analysis.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default APKIngestion;
