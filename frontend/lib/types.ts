export interface ScanResult {
    id: string
    fileName?: string
    fileSize?: number
    fileType?: string
    url?: string
    hash: string
    scanDate: string
    detectionRate: string
    detectionPercentage: number
    scanResults: {
      engine: string
      result: string
      category: "clean" | "suspicious" | "malicious"
    }[]
    yaraMatches?: {
      rule: string
      description: string
      severity: string
      tags: string[]
    }[]
    behaviorAnalysis?: {
      networkConnections?: {
        destination: string
        port: number
        protocol: string
      }[]
      fileOperations?: {
        operation: string
        path: string
        timestamp: string
      }[]
      processCreation?: {
        process: string
        commandLine: string
        pid: number
      }[]
    }
    urlAnalysis?: {
      redirectChain: {
        url: string
        statusCode: number
      }[]
      ssl: {
        valid: boolean
        issuer: string
        validFrom: string
        validTo: string
      }
      cookies: {
        name: string
        secure: boolean
        httpOnly: boolean
      }[]
    }
    exploitDetails?: {
      cve: string
      description: string
      affectedVersions: string
      mitigationStatus: string
    }
  }
  
  export interface HistoryItem {
    id: string
    type: "file" | "url" | "hash"
    name: string
    hash: string
    date: string
    detectionRate: string
    detectionPercentage: number
  }
  
  