import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  GitBranch, 
  Terminal, 
  Play, 
  Save, 
  RotateCcw, 
  Code2, 
  Zap, 
  Cpu,
  Lock,
  Unlock,
  ChevronRight,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
  FileCode,
  Maximize2,
  Minimize2,
  Bug,
  ShieldCheck,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Target,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import * as d3 from 'd3';
import { generateMethodIR, suggestPatch } from '../services/gemini';
import { useApp } from '../AppContext';

const TransformationLab: React.FC = () => {
  const { selectedProfile, addPatch, appliedPatches, auditTrail } = useApp();
  const [activeMethod, setActiveMethod] = useState('AuthManager.verify()');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPatching, setIsPatching] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const [isLoadingIR, setIsLoadingIR] = useState(false);
  const [irData, setIrData] = useState<any>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [suggestedPatchData, setSuggestedPatchData] = useState<any>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [transformationGoal, setTransformationGoal] = useState('Feature Unlocking');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showConflictAlert, setShowConflictAlert] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<any>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const methods = useMemo(() => [
    'AuthManager.verify()',
    'LicenseService.check()',
    'UserSession.isValid()',
    'FeatureGate.isUnlocked()',
    'NetworkClient.send()',
    'Database.query()',
    'UIController.render()',
    'PaymentGateway.process()',
    'Analytics.trackEvent()',
    'SecurityProvider.getCert()',
  ], []);

  const filteredMethods = useMemo(() => {
    return methods.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, methods]);

  // Check for existing patches
  useEffect(() => {
    if (selectedProfile && activeMethod) {
      const profilePatches = appliedPatches[selectedProfile.fingerprint] || [];
      const existingPatch = profilePatches.find(p => p.methodName === activeMethod);
      setPatchApplied(!!existingPatch);
    }
  }, [activeMethod, selectedProfile, appliedPatches]);

  // Scroll to active block
  useEffect(() => {
    if (activeNodeId && blockRefs.current[activeNodeId]) {
      blockRefs.current[activeNodeId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeNodeId]);

  // Fetch IR data
  useEffect(() => {
    const fetchIR = async () => {
      setIsLoadingIR(true);
      setSuggestedPatchData(null);
      const data = await generateMethodIR(activeMethod);
      if (data) setIrData(data);
      setIsLoadingIR(false);
    };
    fetchIR();
  }, [activeMethod]);

  // D3 CFG Rendering with Zoom/Pan
  useEffect(() => {
    if (!svgRef.current || !irData) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;
    
    const g = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    const nodes = irData.nodes.map((n: any, i: number) => ({
      ...n,
      x: width / 2,
      y: 80 + i * 120
    }));

    // Arrowhead definition
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 75)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3f3f46");

    // Draw links
    g.selectAll("path")
      .data(irData.links)
      .enter()
      .append("path")
      .attr("d", (d: any) => {
        const source = nodes.find((n: any) => n.id === d.source)!;
        const target = nodes.find((n: any) => n.id === d.target)!;
        return `M${source.x},${source.y} L${target.x},${target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#27272a")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Draw nodes
    const nodeGroups = g.selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .on("click", (event, d: any) => setActiveNodeId(d.id))
      .style("cursor", "pointer");

    nodeGroups.append("rect")
      .attr("x", -70)
      .attr("y", -25)
      .attr("width", 140)
      .attr("height", 50)
      .attr("rx", 12)
      .attr("fill", (d: any) => {
        if (d.id === activeNodeId) return "#1e3a8a";
        if (patchApplied && d.id === suggestedPatchData?.targetNode) return "#064e3b";
        return "#09090b";
      })
      .attr("stroke", (d: any) => {
        if (d.id === activeNodeId) return "#3b82f6";
        if (patchApplied && d.id === suggestedPatchData?.targetNode) return "#10b981";
        return "#27272a";
      })
      .attr("stroke-width", 2)
      .attr("class", "transition-all duration-300");

    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", (d: any) => d.id === activeNodeId ? "#fff" : "#a1a1aa")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("font-family", "monospace")
      .text((d: any) => d.label);

  }, [irData, activeNodeId, patchApplied, suggestedPatchData]);

  const handleSuggestPatch = async () => {
    if (!irData) return;
    setIsSuggesting(true);
    const suggestion = await suggestPatch(activeMethod, irData, transformationGoal);
    setSuggestedPatchData(suggestion);
    setIsSuggesting(false);
  };

  const checkForConflicts = () => {
    if (!selectedProfile || !activeMethod || !suggestedPatchData || !irData) return null;
    
    const profilePatches = appliedPatches[selectedProfile.fingerprint] || [];
    const existingPatch = profilePatches.find(p => p.methodName === activeMethod);
    
    if (existingPatch) {
      if (existingPatch.targetNode === suggestedPatchData.targetNode) {
        return {
          type: 'METHOD_ALREADY_PATCHED',
          existingPatch,
          newPatch: suggestedPatchData,
          severity: 'CRITICAL',
          details: `CRITICAL CONFLICT: Target node ${suggestedPatchData.targetNode} is already hooked by a previous patch. Applying this will overwrite existing bytecodes and corrupt the SSA mapping.`
        };
      } else {
         return {
          type: 'MULTIPLE_HOOKS_WARNING',
          existingPatch,
          newPatch: suggestedPatchData,
          severity: 'HIGH',
          details: `DIVERGENCE WARNING: Method ${activeMethod} has an existing patch at ${existingPatch.targetNode}. Adding a new hook at ${suggestedPatchData.targetNode} increases the cyclomatic complexity and risk of ART de-optimization.`
        };
      }
    }
    
    // Check for structural conflicts based on IR
    const targetNodeData = irData.nodes.find((n: any) => n.id === suggestedPatchData.targetNode);
    if (targetNodeData) {
      const codeLines = targetNodeData.code as string[];
      // If we are patching a node that modifies control flow fundamentally
      const hasReturn = codeLines.some(line => line.includes('return'));
      const hasGoto = codeLines.some(line => line.includes('goto'));
      
      if (hasReturn && suggestedPatchData.modifiedCode.some((l: string) => !l.includes('return'))) {
        return {
          type: 'CONTROL_FLOW_INVALIDATION',
          details: `The proposed patch removes terminal instructions (return) from a terminal node (${suggestedPatchData.targetNode}), risking a fallthrough into unmapped memory addresses.`,
          severity: 'HIGH'
        };
      }
      
      if (hasGoto && suggestedPatchData.modifiedCode.some((l: string) => l.includes('return'))) {
        return {
           type: 'PREMATURE_TERMINATION',
           details: `The patch introduces a return sequence into a transitional basic block (${suggestedPatchData.targetNode}). Downstream blocks will be orphaned.`,
           severity: 'MEDIUM'
        };
      }
    }

    return null;
  };

  const applyPatch = (force = false) => {
    if (!suggestedPatchData || !irData || !selectedProfile) return;
    
    if (!force) {
      const conflict = checkForConflicts();
      if (conflict) {
        setConflictDetails(conflict);
        setShowConflictAlert(true);
        return;
      }
    }

    setShowConflictAlert(false);
    setIsPatching(true);
    setTimeout(() => {
      setIsPatching(false);
      setPatchApplied(true);
      
      addPatch(selectedProfile.fingerprint, {
        methodName: activeMethod,
        targetNode: suggestedPatchData.targetNode,
        modifiedCode: suggestedPatchData.modifiedCode.join('\n'),
        timestamp: new Date().toISOString()
      });

      const newNodes = irData.nodes.map((n: any) => {
        if (n.id === suggestedPatchData.targetNode) {
          return { ...n, code: suggestedPatchData.modifiedCode, label: `${n.label} (PATCHED)` };
        }
        return n;
      });
      setIrData({ ...irData, nodes: newNodes });
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full overflow-hidden relative">
      {/* Conflict Alert Modal */}
      <AnimatePresence>
        {showConflictAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full glass-panel border-red-500/30 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
              <div className="p-6 border-b border-red-500/20 bg-red-500/5 flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Patch Conflict Detected</h3>
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Integrity Violation Warning</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4 shadow-inner">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-1", conflictDetails?.severity === 'CRITICAL' ? "text-rose-500" : "text-amber-500")} />
                    <div>
                      <p className={cn("text-sm font-bold mb-1", conflictDetails?.severity === 'CRITICAL' ? "text-rose-500" : "text-amber-500")}>
                        {conflictDetails?.type}
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                        {conflictDetails?.details}
                      </p>
                      {conflictDetails?.existingPatch && (
                        <div className="mt-3 p-3 bg-black border border-zinc-800 rounded-lg">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Existing Instruction Set</p>
                          <p className="text-[9px] text-zinc-400 font-mono whitespace-pre-wrap">{conflictDetails.existingPatch.modifiedCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowConflictAlert(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                  >
                    Abort Patch
                  </button>
                  <button 
                    onClick={() => applyPatch(true)}
                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                  >
                    Override & Inject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Method Explorer */}
      <div className="lg:col-span-1 glass-panel flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-800 space-y-4 bg-zinc-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Method Explorer</h3>
            <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[8px] font-mono text-zinc-500 uppercase">
              {filteredMethods.length} Found
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search package or method..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
          {filteredMethods.map((method) => (
            <button
              key={method}
              onClick={() => setActiveMethod(method)}
              className={cn(
                "w-full p-4 border-b border-zinc-900/50 flex items-center gap-4 transition-all text-left group",
                activeMethod === method ? "bg-blue-600/10 border-l-4 border-l-blue-600" : "hover:bg-zinc-900/50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                activeMethod === method ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : "bg-zinc-950 border-zinc-900 text-zinc-600 group-hover:text-zinc-400"
              )}>
                <Code2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={cn("text-xs font-mono block truncate", activeMethod === method ? "text-white font-bold" : "text-zinc-500")}>
                  {method.split('.')[1]}
                </span>
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest truncate block">
                  {method.split('.')[0]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* IR Visualizer */}
      <div className="lg:col-span-2 flex flex-col gap-8 overflow-hidden">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <GitBranch className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Control Flow Graph</h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase">{activeMethod}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-900 mr-2">
                <button className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500"><Maximize2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500"><Minimize2 className="w-3.5 h-3.5" /></button>
              </div>
              <button onClick={() => setPatchApplied(false)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors border border-transparent hover:border-zinc-800"><RotateCcw className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors border border-transparent hover:border-zinc-800"><Save className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div ref={containerRef} className="flex-1 relative flex items-center justify-center bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:30px_30px] overflow-hidden">
            {isLoadingIR ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Lifting Bytecode</p>
                  <p className="text-[9px] font-mono text-zinc-600 uppercase">Generating SSA Intermediate Representation</p>
                </div>
              </div>
            ) : (
              <svg ref={svgRef} className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
            )}
            
            <div className="absolute bottom-6 left-6 flex flex-col gap-3">
              <div className="bg-zinc-950/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Live Graph Stream</span>
              </div>
              <div className="bg-zinc-950/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Zoom: <span className="text-white font-bold">{(zoomLevel * 100).toFixed(0)}%</span></span>
              </div>
            </div>

            <AnimatePresence>
              {isPatching && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-50"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                    <Zap className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white mb-2 uppercase tracking-tighter italic">Injecting Semantic Patch</p>
                    <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Rewriting CFG at node {suggestedPatchData?.targetNode}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detailed IR Graph / Code View */}
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[350px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/10 rounded-lg">
                <FileCode className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">SSA IR Block Structure</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Static Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 bg-black/20">
            {irData?.nodes.map((node: any) => (
              <div 
                key={node.id}
                ref={el => { blockRefs.current[node.id] = el; }}
                onClick={() => setActiveNodeId(node.id)}
                className={cn(
                  "p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                  activeNodeId === node.id 
                    ? "bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
                    : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                )}
              >
                {activeNodeId === node.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                )}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{node.label}</span>
                    {node.label.includes('PATCHED') && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[8px] font-mono text-emerald-500 uppercase font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">ADDR: {node.id}</span>
                </div>
                <div className="space-y-1.5">
                  {node.code.map((line: string, i: number) => (
                    <div key={i} className="flex gap-6 font-mono text-[11px] group/line">
                      <span className="text-zinc-800 w-6 text-right select-none group-hover/line:text-zinc-600 transition-colors">{i.toString().padStart(2, '0')}</span>
                      <span className={cn(
                        "transition-colors",
                        line.includes('invoke') ? "text-purple-400 font-bold" : 
                        line.includes('if') ? "text-amber-400 font-bold" : 
                        line.includes('return') ? "text-emerald-400 font-bold" : 
                        line.includes('const') ? "text-blue-400" : "text-zinc-500"
                      )}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Simulated Register State */}
                {activeNodeId === node.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-4"
                  >
                    {[
                      { reg: 'v0', val: '0x1', type: 'INT' },
                      { reg: 'v1', val: '0x7F2A', type: 'REF' },
                      { reg: 'v2', val: 'NULL', type: 'OBJ' },
                    ].map((r) => (
                      <div key={r.reg} className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                        <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase mb-1">
                          <span>{r.reg}</span>
                          <span>{r.type}</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 font-bold">{r.val}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patch Terminal & AI Suggestions */}
      <div className="lg:col-span-1 flex flex-col gap-8 overflow-hidden">
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full blur-3xl" />
          <div className="flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">AI Patch Advisor</h3>
            </div>
            <button 
              onClick={handleSuggestPatch}
              disabled={isSuggesting || !irData}
              className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all disabled:opacity-50 shadow-inner"
            >
              {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-6 relative z-10">
            {/* Goal Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transformation Goal</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Feature Unlocking',
                  'Ad Removal',
                  'Tracker Stripping',
                  'Offline Enablement',
                  'Feature Flag Manipulation',
                  'UI/UX Modification',
                  'Performance Tweaks',
                  'ELITE: Premium Tier Overwrites',
                  'ELITE: Cryptographic Downgrade',
                  'ELITE: License Spoofing',
                  'ELITE: Dynamic Payload Hooking'
                ].map(goal => (
                  <button
                    key={goal}
                    onClick={() => setTransformationGoal(goal)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-[10px] font-mono uppercase transition-all text-left flex items-center justify-between group",
                      transformationGoal === goal 
                        ? (goal.includes('ELITE') ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]")
                        : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                    )}
                  >
                    <span>
                      {goal.includes('ELITE') && <Crown className="w-3 h-3 inline-block mr-1.5 text-red-500" />}
                      {goal.replace('ELITE: ', '')}
                    </span>
                    {transformationGoal === goal && <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", goal.includes('ELITE') ? "bg-red-500" : "bg-amber-500")} />}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {suggestedPatchData ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl relative">
                    <Bug className="w-4 h-4 text-amber-500 absolute -top-2 -right-2 bg-zinc-950 rounded-full p-0.5" />
                    <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
                      {suggestedPatchData.patchDescription}
                    </p>
                  </div>

                  {/* Security Implications */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Security Implications</span>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                      <p className="text-[10px] text-blue-200/70 leading-relaxed font-mono italic">
                        {suggestedPatchData.securityImplications || "No critical security ramifications detected for this semantic modification."}
                      </p>
                    </div>
                  </div>

                  {/* Performance Analysis */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Performance Impact</span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                      <p className="text-[10px] text-emerald-200/70 leading-relaxed font-mono italic">
                        {suggestedPatchData.performanceImpacts || "Minimal overhead. Optimized for ART JIT compilation."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Target Node: <span className="text-blue-400 font-bold">{suggestedPatchData.targetNode}</span></p>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-mono uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Validated
                      </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl font-mono text-[10px] text-emerald-400 shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                      {suggestedPatchData.modifiedCode.map((line: string, i: number) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-emerald-900 select-none">+</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => applyPatch()}
                    disabled={patchApplied || isPatching}
                    className={cn(
                      "w-full py-4 rounded-2xl text-xs font-black transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest",
                      patchApplied 
                        ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
                    )}
                  >
                    {patchApplied ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                    {patchApplied ? 'Patch Applied' : 'Inject AI Patch'}
                  </button>
                </motion.div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-8 border-2 border-zinc-900 border-dashed rounded-3xl group hover:border-amber-500/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-zinc-800 group-hover:text-amber-500/50" />
                  </div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
                    Select a method and click refresh to generate AI-driven security patches.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass-panel flex-1 flex flex-col overflow-hidden border-zinc-800">
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Transformation Log</h3>
            </div>
            <Activity className="w-3.5 h-3.5 text-zinc-700 animate-pulse" />
          </div>
          <div className="flex-1 p-6 font-mono text-[10px] space-y-3 overflow-y-auto custom-scrollbar bg-black/40">
            {auditTrail.filter(l => l.module === 'transformation').slice(-15).reverse().map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="text-zinc-800 select-none">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                <span className={cn(
                  "transition-colors",
                  log.action.includes('PATCH') ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
                )}>
                  <span className="font-bold uppercase">{log.action}</span>: {log.details}
                </span>
              </div>
            ))}
            <div className="flex gap-4">
              <span className="text-zinc-800 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-blue-500 animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformationLab;
