import React, { createContext, useContext, useReducer, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { APKProfile, IRNode, ModuleType, AuditLog, MemoryEdit, SystemAlert, AetherPlugin, PatchRecord } from './types';

interface AppState {
  profiles: APKProfile[];
  selectedProfile: APKProfile | null;
  appliedPatches: Record<string, PatchRecord[]>;
  memoryEdits: Record<string, MemoryEdit[]>;
  buildHistory: string[];
  auditTrail: AuditLog[];
  alerts: SystemAlert[];
  plugins: AetherPlugin[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PROFILE'; payload: APKProfile }
  | { type: 'SET_SELECTED_PROFILE'; payload: APKProfile | null }
  | { type: 'UPDATE_PROFILE'; payload: APKProfile }
  | { type: 'DELETE_PROFILE'; payload: string }
  | { type: 'ADD_PATCH'; payload: { fingerprint: string; patch: PatchRecord } }
  | { type: 'ADD_MEMORY_EDIT'; payload: { fingerprint: string; edit: MemoryEdit } }
  | { type: 'ADD_BUILD_LOG'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'ADD_ALERT'; payload: SystemAlert }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'TOGGLE_PLUGIN'; payload: string };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_PROFILE':
      return { ...state, profiles: [action.payload, ...state.profiles] };
    case 'SET_SELECTED_PROFILE':
      return { ...state, selectedProfile: action.payload };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(p => p.fingerprint === action.payload.fingerprint ? action.payload : p),
        selectedProfile: state.selectedProfile?.fingerprint === action.payload.fingerprint ? action.payload : state.selectedProfile
      };
    case 'DELETE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter(p => p.fingerprint !== action.payload),
        selectedProfile: state.selectedProfile?.fingerprint === action.payload ? null : state.selectedProfile
      };
    case 'ADD_PATCH':
      return {
        ...state,
        appliedPatches: {
          ...state.appliedPatches,
          [action.payload.fingerprint]: [...(state.appliedPatches[action.payload.fingerprint] || []), action.payload.patch]
        }
      };
    case 'ADD_MEMORY_EDIT':
      return {
        ...state,
        memoryEdits: {
          ...state.memoryEdits,
          [action.payload.fingerprint]: [...(state.memoryEdits[action.payload.fingerprint] || []), action.payload.edit]
        }
      };
    case 'ADD_BUILD_LOG':
      return { ...state, buildHistory: [...state.buildHistory, action.payload] };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditTrail: [action.payload, ...state.auditTrail] };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'DISMISS_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.payload ? { ...a, read: true } : a) };
    case 'TOGGLE_PLUGIN':
      return {
        ...state,
        plugins: state.plugins.map(p => p.id === action.payload ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p)
      };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  setIsLoading: (isLoading: boolean) => void;
  addProfile: (profile: APKProfile) => void;
  setSelectedProfile: (profile: APKProfile | null) => void;
  updateProfile: (profile: APKProfile) => void;
  deleteProfile: (fingerprint: string) => void;
  addPatch: (fingerprint: string, patch: PatchRecord) => void;
  addMemoryEdit: (fingerprint: string, edit: MemoryEdit) => void;
  addBuildLog: (log: string) => void;
  addAuditLog: (module: ModuleType, action: string, details: string) => void;
  normalizedDataset: any[];
  addAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'read'>) => void;
  dismissAlert: (id: string) => void;
  togglePlugin: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialProfiles: APKProfile[] = [
  {
    name: 'Messenger_v42.apk',
    packageName: 'com.social.messenger',
    version: '42.0.1',
    capabilities: ['UI_control', 'Network', 'Persistence'],
    fingerprint: 'SHA256: 8F2A...9C1D',
    dexCount: 3,
    nativeLibs: ['libnative-core.so', 'libcrypto.so'],
    riskScore: 42,
    permissions: ['INTERNET', 'READ_CONTACTS', 'CAMERA', 'RECORD_AUDIO'],
    activities: ['.MainActivity', '.ChatActivity', '.SettingsActivity'],
    services: ['.PushService', '.SyncService'],
    receivers: ['.BootReceiver', '.NetworkReceiver'],
    hardening: {
      obfuscationDensity: 65,
      integrityCheckCoverage: 30,
      serverSideAuthority: 40,
      cryptoResilience: 50,
      dynamicDelivery: false,
      hardwareBackedSecurity: true
    },
    resilience: {
      overallScore: 55,
      attackSurface: 70,
      protectionLayers: 45,
      detectionCapability: 50,
      categories: {
        adRemoval: 'MEDIUM',
        trackerStripping: 'MEDIUM',
        featureGating: 'HIGH'
      },
      recommendations: ['Implement Play Integrity API', 'Increase server-side entitlement checks']
    }
  },
  {
    name: 'BankApp_v1.2.apk',
    packageName: 'com.fintech.bank',
    version: '1.2.0',
    capabilities: ['UI_control', 'Biometrics', 'Network', 'Telemetry'],
    fingerprint: 'SHA256: 3D4E...1A2B',
    dexCount: 5,
    nativeLibs: ['libsecurity.so'],
    riskScore: 85,
    permissions: ['INTERNET', 'USE_BIOMETRIC', 'READ_EXTERNAL_STORAGE', 'ACCESS_FINE_LOCATION'],
    activities: ['.LoginActivity', '.DashboardActivity', '.TransferActivity'],
    services: ['.FraudDetectionService'],
    receivers: ['.SmsReceiver']
  }
];

const initialPlugins: AetherPlugin[] = [
  { 
    id: 'plugin_deeptrace', 
    name: 'DeepTrace Anomaly Detector', 
    version: '1.2.0', 
    author: 'AetherLabs', 
    description: 'AI-driven runtime memory and telemetry anomaly detection.', 
    category: 'telemetry', 
    status: 'active', 
    hooks: ['onTelemetryTick', 'onMemoryEdit'] 
  },
  { 
    id: 'plugin_quantum_ir', 
    name: 'Quantum IR Optimizer', 
    version: '0.9.5', 
    author: 'Community', 
    description: 'Advanced heuristics for identifying dead code in SSA representation.', 
    category: 'transformation', 
    status: 'inactive', 
    hooks: ['beforePatchSuggest', 'onIRLifting'] 
  }
];

function initAppState(): AppState {
  const getSafely = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return {
    profiles: getSafely('aether_profiles', initialProfiles),
    selectedProfile: getSafely('aether_selected_profile', null),
    appliedPatches: getSafely('aether_patches', {}),
    memoryEdits: getSafely('aether_memory_edits', {}),
    buildHistory: getSafely('aether_build_history', []),
    auditTrail: getSafely('aether_audit_trail', []),
    alerts: getSafely('aether_alerts', []),
    plugins: getSafely('aether_plugins', initialPlugins),
    isLoading: false,
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined as unknown as AppState, initAppState);

  useEffect(() => {
    localStorage.setItem('aether_profiles', JSON.stringify(state.profiles));
    localStorage.setItem('aether_selected_profile', JSON.stringify(state.selectedProfile));
    localStorage.setItem('aether_patches', JSON.stringify(state.appliedPatches));
    localStorage.setItem('aether_memory_edits', JSON.stringify(state.memoryEdits));
    localStorage.setItem('aether_build_history', JSON.stringify(state.buildHistory));
    localStorage.setItem('aether_audit_trail', JSON.stringify(state.auditTrail));
    localStorage.setItem('aether_alerts', JSON.stringify(state.alerts));
    localStorage.setItem('aether_plugins', JSON.stringify(state.plugins));
  }, [state]);

  const setIsLoading = useCallback((isLoading: boolean) => dispatch({ type: 'SET_LOADING', payload: isLoading }), []);

  const addAuditLog = useCallback((module: ModuleType, action: string, details: string) => {
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: Math.random().toString(36).slice(2, 11),
        timestamp: new Date().toISOString(),
        module,
        action,
        details,
        integrityHash: Math.random().toString(16).slice(2, 10).toUpperCase()
      }
    });
  }, []);

  const addProfile = useCallback((profile: APKProfile) => {
    dispatch({ type: 'ADD_PROFILE', payload: profile });
    addAuditLog('ingestion', 'PROFILE_INGESTED', `Artifact: ${profile.name}`);
  }, [addAuditLog]);

  const setSelectedProfile = useCallback((profile: APKProfile | null) => {
    dispatch({ type: 'SET_SELECTED_PROFILE', payload: profile });
    if (profile) addAuditLog('ingestion', 'PROFILE_SELECTED', `Artifact: ${profile.name}`);
  }, [addAuditLog]);

  const updateProfile = useCallback((profile: APKProfile) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    addAuditLog('ingestion', 'PROFILE_UPDATED', `Artifact: ${profile.name}`);
  }, [addAuditLog]);

  const deleteProfile = useCallback((fingerprint: string) => {
    dispatch({ type: 'DELETE_PROFILE', payload: fingerprint });
    addAuditLog('ingestion', 'PROFILE_DELETED', `Artifact Fingerprint: ${fingerprint}`);
  }, [addAuditLog]);

  const addPatch = useCallback((fingerprint: string, patch: PatchRecord) => {
    dispatch({ type: 'ADD_PATCH', payload: { fingerprint, patch } });
    addAuditLog('transformation', 'PATCH_APPLIED', `Method: ${patch.methodName}, Node: ${patch.targetNode}`);
  }, [addAuditLog]);

  const addMemoryEdit = useCallback((fingerprint: string, edit: MemoryEdit) => {
    dispatch({ type: 'ADD_MEMORY_EDIT', payload: { fingerprint, edit } });
    addAuditLog('runtime', 'MEMORY_EDITED', `Address: ${edit.address}, New Value: ${edit.newValue}`);
  }, [addAuditLog]);

  const addBuildLog = useCallback((log: string) => {
    dispatch({ type: 'ADD_BUILD_LOG', payload: log });
    if (log.includes('SUCCESSFUL')) {
      addAuditLog('build', 'BUILD_COMPLETED', log);
    }
  }, [addAuditLog]);

  const addAlert = useCallback((alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'read'>) => {
    dispatch({
      type: 'ADD_ALERT',
      payload: { ...alertData, id: Math.random().toString(36).slice(2, 11), timestamp: new Date().toISOString(), read: false }
    });
    addAuditLog('runtime', 'ALERT_TRIGGERED', `${alertData.severity}: ${alertData.message}`);
  }, [addAuditLog]);

  const dismissAlert = useCallback((id: string) => dispatch({ type: 'DISMISS_ALERT', payload: id }), []);

  const togglePlugin = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PLUGIN', payload: id });
    addAuditLog('plugins', 'PLUGIN_TOGGLED', `Plugin ID ${id} toggled`);
  }, [addAuditLog]);

  const normalizedDataset = useMemo(() => {
    return state.profiles.map(p => ({
      ...p,
      patches: state.appliedPatches[p.fingerprint] || [],
      memoryEdits: state.memoryEdits[p.fingerprint] || [],
      lastModified: state.appliedPatches[p.fingerprint]?.length 
        ? state.appliedPatches[p.fingerprint].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp 
        : null
    }));
  }, [state.profiles, state.appliedPatches, state.memoryEdits]);

  return (
    <AppContext.Provider value={{
      ...state,
      setIsLoading,
      addProfile,
      setSelectedProfile,
      updateProfile,
      deleteProfile,
      addPatch,
      addMemoryEdit,
      addBuildLog,
      addAuditLog,
      normalizedDataset,
      addAlert,
      dismissAlert,
      togglePlugin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
