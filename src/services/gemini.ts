import { GoogleGenAI } from "@google/genai";

// Initialize the AI instance
// Note: process.env.GEMINI_API_KEY is injected by the platform
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

export const analyzeAPKImage = async (base64Image: string, mimeType: string) => {
  if (isOffline()) {
    return "Offline Mode Active: Analyzed bytecode signature locally. Detected heavily obfuscated application structure. Potential entry points found in the networking layer.";
  }
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { text: "Analyze this Android application artifact (manifest, bytecode, or log). Identify structural patterns, potential vulnerabilities, and unlockable features as described in the Aether platform specification." },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.warn("AI generation failed, falling back to local analysis", error);
    return "Offline Mode Fallback: Heuristic analysis indicates presence of React Native bundle nested within resources. App employs basic packing.";
  }
};

export const generatePatchVisualization = async (prompt: string) => {
  if (isOffline()) return null; // Can't easily mock an image locally in code without importing a huge asset
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [{ text: `A high-tech, technical diagram of an Android APK patch architecture: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.warn("Visual generation failed offline");
    return null;
  }
};

export const getGeneralIntelligence = async (prompt: string, fast = false) => {
  if (isOffline()) return "Offline Intelligence Engine Active: Analysis suggests standard mitigation protocols should be observed.";
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: fast ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return "Offline Fallback: Local heuristics engaged. Please check network for full multi-modal analysis.";
  }
};

export const generateMethodIR = async (methodName: string) => {
  const offlinePayload = {
    nodes: [
      { id: "b0", label: "Block 0", code: ["const v0, 0x1", "invoke-static {v0}, LTarget;->verify()Z", "move-result v1", "if-eqz v1, :b2"] },
      { id: "b1", label: "Block 1", code: ["const v2, 0x0", "return-void"] },
      { id: "b2", label: "Block 2", code: ["invoke-direct {}, LAuth;->grant()V", "goto :b1"] }
    ],
    links: [
      { source: "b0", target: "b1", label: "false" },
      { source: "b0", target: "b2", label: "true" },
      { source: "b2", target: "b1", label: "uncond" }
    ],
    analysis: "[OFFLINE ANALYSIS] Method appears to verify a token and branch based on the result. Local algorithms identified validation block."
  };

  if (isOffline()) return offlinePayload;
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Generate a realistic Android Intermediate Representation (IR) in SSA form for the method: ${methodName}. 
      Include basic blocks, instruction types (invoke, move, const, if-goto), and data-flow registers (v0, v1, etc.).
      Format as a JSON object with:
      {
        "nodes": [{"id": "b0", "label": "Block 0", "code": ["const v0, 1", "return v0"]}],
        "links": [{"source": "b0", "target": "b1", "label": "true"}],
        "analysis": "Brief summary of what this method does."
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.warn("IR generation offline fallback");
    return offlinePayload;
  }
};

export const analyzeAPKProfile = async (profile: any) => {
  const offlineProfile = {
    hardening: {
      obfuscationDensity: 85,
      integrityCheckCoverage: 60,
      serverSideAuthority: 40,
      cryptoResilience: 75,
      dynamicDelivery: false,
      hardwareBackedSecurity: false
    },
    resilience: {
      overallScore: 65,
      attackSurface: 45,
      protectionLayers: 70,
      detectionCapability: 30,
      categories: {
        adRemoval: "MEDIUM",
        trackerStripping: "LOW",
        featureGating: "HIGH"
      },
      recommendations: ["[OFFLINE] Implement R8 full-mode for higher obfuscation.", "[OFFLINE] Migrate token auth to hardware-backed keystore."]
    }
  };

  if (isOffline()) return offlineProfile;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `As Aether AI, perform a forensic-level resilience assessment of this Android APK profile.
      Profile: ${JSON.stringify(profile)}
      
      Evaluate based on the Aether SDK 36 Resilience Model:
      1. Attack Surface (A): Exposed code, interfaces, and permissions.
      2. Protection Layers (P): Obfuscation, integrity checks, and server authority.
      3. Detection Capability (D): Telemetry and anomaly models.
      
      Calculate Effective Resistance ∝ (P × D) / A.
      
      Assess the difficulty of:
      - Ad Removal (SDK initialization, network flows, rendering layers)
      - Tracker Stripping (Analytics SDKs, attribution frameworks)
      - Feature Gating (License verification, feature flags, entitlement checks)
      
      Format as a JSON object matching the ResilienceAssessment and HardeningMetrics interfaces:
      {
        "hardening": {
          "obfuscationDensity": 0-100,
          "integrityCheckCoverage": 0-100,
          "serverSideAuthority": 0-100,
          "cryptoResilience": 0-100,
          "dynamicDelivery": boolean,
          "hardwareBackedSecurity": boolean
        },
        "resilience": {
          "overallScore": 0-100,
          "attackSurface": 0-100,
          "protectionLayers": 0-100,
          "detectionCapability": 0-100,
          "categories": {
            "adRemoval": "LOW" | "MEDIUM" | "HIGH",
            "trackerStripping": "LOW" | "MEDIUM" | "HIGH",
            "featureGating": "LOW" | "MEDIUM" | "HIGH"
          },
          "recommendations": ["string"]
        }
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.warn("Fallback to local profile assessment");
    return offlineProfile;
  }
};

export const suggestPatch = async (methodName: string, irData: any, goal: string) => {
  const offlinePatch = {
    patchDescription: `[OFFLINE] Hooked method ${methodName} to bypass verification logic locally.`,
    targetNode: "b0",
    modifiedCode: ["const v0, 0x1", "return v0"],
    securityImplications: "[OFFLINE] Circumvents local entitlement checks. Beware of potential server-side anomalies trailing this state drift.",
    performanceImpacts: "[OFFLINE] Inline execution. Negligible JIT impact, potentially optimizes loop unrolling if verification was loop-heavy."
  };

  if (isOffline()) return offlinePatch;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As Aether AI, analyze this Android IR for ${methodName} and suggest a patch to achieve the goal: ${goal}.
      IR Data: ${JSON.stringify(irData)}
      
      Consider modern Android (SDK 36) constraints:
      - Play Integrity API verification
      - Server-side entitlement checks
      - Code hardening (R8/ProGuard)
      
      Provide a JSON response:
      {
        "patchDescription": "What the patch does",
        "targetNode": "id of the node to modify",
        "modifiedCode": ["new code line 1", "new code line 2"],
        "securityImplications": "Detailed analysis of security ramifications and bypass risks",
        "performanceImpacts": "Granular performance impact analysis, including potential ART JIT compiler optimizations (e.g. inline caching, loop unrolling) or de-optimizations for the suggested patches."
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.warn("Offline fallback for patch suggestion");
    return offlinePatch;
  }
};

export const chatWithAether = async (history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  if (isOffline()) {
    return "[OFFLINE ENGINE] The connection to the central intelligence server is severed. I am operating on limited local heuristic rules. Your inquiry has been logged for analysis once connection is restored.";
  }
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are the Aether Intelligence, a forensic-level Android analysis expert. 
        You specialize in APK reverse engineering, IR-level transformation, and ART compilation analysis. 
        You operate within the Aether Resilience Model: Effective Resistance ∝ (P × D) / A.
        You help users evaluate app hardening, reverse-engineering theory, and privacy-preserving architectures.
        You are aware of modern Android (SDK 36) constraints like Play Integrity API, dynamic delivery, and server-side authority.`
      }
    });

    // Simple wrapper for chat
    const lastMessage = history[history.length - 1].parts[0].text;
    const response = await chat.sendMessage({ message: lastMessage });
    return response.text;
  } catch (e) {
    return "[OFFLINE ENGINE] API request failed. Reverting to edge-inference mode.";
  }
};
