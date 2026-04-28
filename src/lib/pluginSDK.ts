import { APKProfile, IRNode, SystemAlert, AetherPlugin, MemoryEdit } from '../types';

/**
 * Aether Plugin SDK (v1.0.0)
 * Provides standardized interfaces and hooks for integrating custom 
 * analysis, transformation, and telemetry plugins into the core engine.
 */

export interface PluginContext {
  // Read-only access to core engine state
  readonly profiles: APKProfile[];
  readonly selectedProfile: APKProfile | null;
  readonly activePlugins: AetherPlugin[];
  
  // Plugin capabilities
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  
  alertManager: {
    fire: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'read'>) => void;
  };

  telemetry: {
    onTick: (callback: (data: any) => void) => void;
  };

  memory: {
    observe: (addressRange: [string, string], callback: (edit: MemoryEdit) => void) => void;
  };

  ir: {
    analyze: (methodName: string, irData: any) => void;
    registerPass: (passName: string, passFn: (irData: any) => any) => void;
  };
}

export type PluginInitializer = (ctx: PluginContext) => void;

export class PluginBase {
  constructor(public manifest: AetherPlugin) {}
  
  // Lifecycle hooks to be overridden
  onLoad(ctx: PluginContext): void {}
  onEnable(ctx: PluginContext): void {}
  onDisable(ctx: PluginContext): void {}
  onUnload(ctx: PluginContext): void {}
}
