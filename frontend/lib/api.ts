// lib/api.ts
import { ScanResult } from "./types";

const API_BASE_URL = "http://localhost:8000/api";

// File scanning function
export const scanFile = async (file: File, progressCallback: (progress: number) => void): Promise<ScanResult> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);
    
    // Start progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 200);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/scan/file`, {
      method: "POST",
      body: formData,
    });
    
    // Clear the progress interval
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to scan file");
    }
    
    // Parse the response
    const data = await response.json();
    
    // Convert the backend response format to our frontend format
    const result: ScanResult = {
      id: data.id,
      fileName: data.file_name,
      fileSize: data.file_size,
      fileType: data.file_type,
      hash: data.hash,
      scanDate: data.scan_date,
      detectionRate: data.detection_rate,
      detectionPercentage: data.detection_percentage,
      scanResults: data.scan_results.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category
      })),
      yaraMatches: data.yara_matches,
      behaviorAnalysis: data.behavior_analysis
    };
    
    // Set progress to 100% to indicate completion
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
    // Start progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 200);
    
    // Make the API request
    const formData = new FormData();
    formData.append("url", url);
    
    const response = await fetch(`${API_BASE_URL}/scan/url`, {
      method: "POST",
      body: formData,
    });
    
    // Clear the progress interval
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to scan URL");
    }
    
    // Parse the response
    const data = await response.json();
    
    // Convert the backend response format to our frontend format
    const result: ScanResult = {
      id: data.id,
      url: data.url,
      hash: data.hash,
      scanDate: data.scan_date,
      detectionRate: data.detection_rate,
      detectionPercentage: data.detection_percentage,
      scanResults: data.scan_results.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category
      })),
      urlAnalysis: data.url_analysis
    };
    
    // Set progress to 100% to indicate completion
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
    // Start progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress >= 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      progressCallback(progress);
    }, 100);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/lookup/hash/${hash}`, {
      method: "GET",
    });
    
    // Clear the progress interval
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to lookup hash");
    }
    
    // Parse the response
    const data = await response.json();
    
    // Convert the backend response format to our frontend format
    const result: ScanResult = {
      id: data.id,
      fileName: data.file_name,
      fileSize: data.file_size,
      fileType: data.file_type,
      hash: data.hash,
      scanDate: data.scan_date,
      detectionRate: data.detection_rate,
      detectionPercentage: data.detection_percentage,
      scanResults: data.scan_results.map((result: any) => ({
        engine: result.engine,
        result: result.result,
        category: result.category
      })),
      yaraMatches: data.yara_matches,
      behaviorAnalysis: data.behavior_analysis
    };
    
    // Set progress to 100% to indicate completion
    progressCallback(100);
    
    return result;
  } catch (error) {
    console.error("Error looking up hash:", error);
    throw error;
  }
};