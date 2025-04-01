// lib/api.ts
import { ScanResult } from "./types";

const API_BASE_URL = "http://localhost:8000/api";

// Helper function to calculate detection values based on VirusTotal results.
const calculateDetectionValues = (vtEngines: any[]): { detectionRate: string, detectionPercentage: number } => {
  if (!vtEngines || vtEngines.length === 0) {
    return { detectionRate: "0/0", detectionPercentage: 0 };
  }
  const maliciousCount = vtEngines.filter(e => e.category === 'malicious' || e.category === 'suspicious').length;
  return {
    detectionRate: `${maliciousCount}/${vtEngines.length}`,
    detectionPercentage: Math.round((maliciousCount / vtEngines.length) * 100)
  };
};

// File scanning function
export const scanFile = async (file: File, progressCallback: (progress: number) => void): Promise<ScanResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 200);
    
    const response = await fetch(`${API_BASE_URL}/scan/file`, {
      method: "POST",
      body: formData,
    });
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to scan file");
    }
    
    const data = await response.json();
    
    // Using camelCase keys as returned by the backend.
    const { detectionRate, detectionPercentage } = calculateDetectionValues(data.virusTotalEngines);
    
    const result: ScanResult = {
      id: data.id || Date.now().toString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      hash: data.hash,
      scanDate: data.scanDate,
      detectionRate,
      detectionPercentage,
      // Map VirusTotal results to scanResults
      scanResults: data.virusTotalEngines.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category,
      })),
      // Assume yaraMatches come from the local scan section if available
      yaraMatches: data.localScan && data.localScan.yara ? data.localScan.yara : [],
      behaviorAnalysis: data.behaviorAnalysis || {},
    };
    
    progressCallback(100);
    
    return result;
  } catch (error) {
    console.error("Error scanning file:", error);
    throw error;
  }
};

// URL scanning function
export const scanUrl = async (url: string, progressCallback: (progress: number) => void): Promise<ScanResult> => {
  try {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 200);
    
    // For URL scans, we use a FormData as per the backend (if that is how it’s set up)
    const formData = new FormData();
    formData.append("url", url);
    
    const response = await fetch(`${API_BASE_URL}/scan/url`, {
      method: "POST",
      body: formData,
    });
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to scan URL");
    }
    
    const data = await response.json();
    
    const { detectionRate, detectionPercentage } = calculateDetectionValues(data.virusTotalEngines);
    
    const result: ScanResult = {
      id: data.id || Date.now().toString(),
      url: data.url,
      hash: data.hash,
      scanDate: data.scanDate,
      detectionRate,
      detectionPercentage,
      scanResults: data.virusTotalEngines.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category,
      })),
      urlAnalysis: data.urlAnalysis || {},
    };
    
    progressCallback(100);
    
    return result;
  } catch (error) {
    console.error("Error scanning URL:", error);
    throw error;
  }
};

// Hash lookup function
export const lookupHash = async (hash: string, progressCallback: (progress: number) => void): Promise<ScanResult> => {
  try {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 100);
    
    // Change: Use POST with a JSON body to match the backend endpoint.
    const response = await fetch(`${API_BASE_URL}/lookup/hash`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash }),
    });
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to lookup hash");
    }
    
    const data = await response.json();
    
    const { detectionRate, detectionPercentage } = calculateDetectionValues(data.virusTotalEngines);
    
    const result: ScanResult = {
      id: data.id || Date.now().toString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      hash: data.hash,
      scanDate: data.scanDate,
      detectionRate,
      detectionPercentage,
      scanResults: data.virusTotalEngines.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category,
      })),
      yaraMatches: data.localScan && data.localScan.yara ? data.localScan.yara : [],
      behaviorAnalysis: data.behaviorAnalysis || {},
    };
    
    progressCallback(100);
    
    return result;
  } catch (error) {
    console.error("Error looking up hash:", error);
    throw error;
  }
};
