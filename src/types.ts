export interface PatchRecord {
  methodName: string;
  targetNode: string;
  modifiedCode: string;
  timestamp: string;
}

export type ModuleType = 
  | 'overview' 
  | 'ingestion' 
  | 'transformation' 
  | 'runtime' 
  | 'risk' 
  | 'ai-lab'
  | 'build'
  | 'audit'
  | 'plugins';

export interface SystemAlert {
  id: string;
  title?: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: string;
  impact?: string;
  mitigation?: string;
  read: boolean;
}

export interface AetherPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'analysis' | 'transformation' | 'telemetry' | 'ai';
  status: 'active' | 'inactive';
  hooks: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  module: ModuleType;
  details: string;
  integrityHash: string;
}

export interface MemoryEdit {
  address: string;
  originalValue: string;
  newValue: string;
  timestamp: string;
  description: string;
}

export interface HardeningMetrics {
  obfuscationDensity: number; // 0-100
  integrityCheckCoverage: number; // 0-100
  serverSideAuthority: number; // 0-100
  cryptoResilience: number; // 0-100
  dynamicDelivery: boolean;
  hardwareBackedSecurity: boolean;
}

export interface ResilienceAssessment {
  overallScore: number; // 0-100
  attackSurface: number; // 0-100
  protectionLayers: number; // 0-100
  detectionCapability: number; // 0-100
  categories: {
    adRemoval: 'LOW' | 'MEDIUM' | 'HIGH';
    trackerStripping: 'LOW' | 'MEDIUM' | 'HIGH';
    featureGating: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  recommendations: string[];
}

export interface APKProfile {
  name: string;
  packageName: string;
  version: string;
  capabilities: string[];
  fingerprint: string;
  dexCount: number;
  nativeLibs: string[];
  riskScore: number;
  permissions?: string[];
  activities?: string[];
  services?: string[];
  receivers?: string[];
  hardening?: HardeningMetrics;
  resilience?: ResilienceAssessment;
}

export interface IRNode {
  id: string;
  label: string;
  type: 'method' | 'class' | 'block';
  connections: string[];
}

export interface AnalysisResult {
  summary: string;
  vulnerabilities: string[];
  patchPoints: string[];
  divergenceScore: number;
}
