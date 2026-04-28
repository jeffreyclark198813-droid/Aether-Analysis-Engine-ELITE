import { APKProfile, PatchRecord, MemoryEdit, ModuleType } from './types';

/**
 * Aether Plugin SDK v1.0
 * Provides hooks into the Aether engine for custom analysis and transformation capabilities.
 */
export interface AetherPluginContext {
  profiles: {
    getAll: () => APKProfile[];
    getActive: () => APKProfile | null;
  };
  patches: {
    apply: (methodName: string, patch: PatchRecord) => void;
    getAll: (fingerprint: string) => PatchRecord[];
  };
  memory: {
    read: (address: string) => string;
    write: (address: string, value: string) => void;
  };
  ui: {
    addAlert: (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', message: string, details: string) => void;
    showNotification: (message: string) => void;
  };
  events: {
    on: (event: 'module_change' | 'build_start' | 'profile_loaded', callback: (...args: any[]) => void) => void;
  };
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  targetSDK: string;
  permissions: string[];
}

export abstract class AetherPluginInterface {
  abstract manifest: PluginManifest;
  
  /**
   * Called when the plugin is enabled in the UI.
   */
  abstract onActivate(context: AetherPluginContext): void;
  
  /**
   * Called when the plugin is disabled. 
   * Must clean up any UI hooks or event listeners.
   */
  abstract onDeactivate(): void;
  
  /**
   * Optional periodic tick for background analysis
   */
  onTick?(): void;
}
