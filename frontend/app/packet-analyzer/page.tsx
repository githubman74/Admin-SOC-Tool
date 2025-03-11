"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  Network,
  Filter,
  RefreshCw,
  Save,
  Play,
  Square,
  BarChart4,
  Info,
  Palette,
  ChevronDown,
  Search,
  X,
  ArrowUpDown,
  ExternalLink,
  Copy,
  FileJson,
  FileDown,
  FileIcon as FilePdf,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Protocol color mapping
const protocolColors: Record<string, string> = {
  HTTP: "bg-[#CCE4FF] text-black dark:bg-blue-800 dark:text-white",
  HTTPS: "bg-[#CCFFD9] text-black dark:bg-green-800 dark:text-white",
  SSH: "bg-[#FFCCCC] text-black dark:bg-red-800 dark:text-white",
  FTP: "bg-[#FFF5CC] text-black dark:bg-yellow-800 dark:text-white",
  DNS: "bg-[#E5CCFF] text-black dark:bg-purple-800 dark:text-white",
  ARP: "bg-[#FFCCE5] text-black dark:bg-pink-800 dark:text-white",
  ICMP: "bg-[#F2F2F2] text-black dark:bg-gray-700 dark:text-white",
  TCP: "bg-[#D9CCFF] text-black dark:bg-indigo-800 dark:text-white",
  UDP: "bg-[#CCFFFF] text-black dark:bg-cyan-800 dark:text-white",
  TLS: "bg-[#CCFFF2] text-black dark:bg-teal-800 dark:text-white",
  "TLS V1.2": "bg-[#CCFFFC] text-black dark:bg-emerald-800 dark:text-white",
}

// Protocol color mapping for chart
const protocolColorMapping: Record<string, string> = {
  HTTP: "#CCE4FF",
  HTTPS: "#CCFFD9",
  SSH: "#FFCCCC",
  FTP: "#FFF5CC",
  DNS: "#E5CCFF",
  ARP: "#FFCCE5",
  ICMP: "#F2F2F2",
  TCP: "#D9CCFF",
  UDP: "#CCFFFF",
  TLS: "#CCFFF2",
  "TLS V1.2": "#CCFFFC",
}

// Mock data for demonstration
const mockPackets = [
  [
    1,
    "12:30:45",
    "128",
    "192.168.1.1",
    "00:1A:2B:3C:4D:5E",
    "8080",
    "192.168.1.2",
    "00:1A:2B:3C:4D:5F",
    "80",
    "HTTP",
    "GET /index.html",
    "HTTP GET Request",
  ],
  [
    2,
    "12:30:46",
    "256",
    "192.168.1.2",
    "00:1A:2B:3C:4D:5F",
    "80",
    "192.168.1.1",
    "00:1A:2B:3C:4D:5E",
    "8080",
    "HTTP",
    "200 OK",
    "HTTP Response",
  ],
  [
    3,
    "12:30:47",
    "64",
    "192.168.1.3",
    "00:1A:2B:3C:4D:60",
    "443",
    "192.168.1.4",
    "00:1A:2B:3C:4D:61",
    "443",
    "HTTPS",
    "TLS Handshake",
    "TLS Client Hello",
  ],
  [
    4,
    "12:30:48",
    "96",
    "192.168.1.4",
    "00:1A:2B:3C:4D:61",
    "443",
    "192.168.1.3",
    "00:1A:2B:3C:4D:60",
    "443",
    "HTTPS",
    "TLS Handshake",
    "TLS Server Hello",
  ],
  [
    5,
    "12:30:49",
    "48",
    "192.168.1.5",
    "00:1A:2B:3C:4D:62",
    "53",
    "8.8.8.8",
    "00:1A:2B:3C:4D:63",
    "53",
    "DNS",
    "Query",
    "DNS Query for example.com",
  ],
  [
    6,
    "12:30:50",
    "64",
    "8.8.8.8",
    "00:1A:2B:3C:4D:63",
    "53",
    "192.168.1.5",
    "00:1A:2B:3C:4D:62",
    "53",
    "DNS",
    "Response",
    "DNS Response for example.com",
  ],
  [
    7,
    "12:30:51",
    "42",
    "192.168.1.6",
    "00:1A:2B:3C:4D:64",
    "0",
    "192.168.1.255",
    "FF:FF:FF:FF:FF:FF",
    "0",
    "ARP",
    "Who has 192.168.1.7",
    "ARP Request",
  ],
  [
    8,
    "12:30:52",
    "42",
    "192.168.1.7",
    "00:1A:2B:3C:4D:65",
    "0",
    "192.168.1.6",
    "00:1A:2B:3C:4D:64",
    "0",
    "ARP",
    "192.168.1.7 is at 00:1A:2B:3C:4D:65",
    "ARP Response",
  ],
  [
    9,
    "12:30:53",
    "84",
    "192.168.1.8",
    "00:1A:2B:3C:4D:66",
    "0",
    "192.168.1.9",
    "00:1A:2B:3C:4D:67",
    "0",
    "ICMP",
    "Echo request",
    "Ping Request",
  ],
  [
    10,
    "12:30:54",
    "84",
    "192.168.1.9",
    "00:1A:2B:3C:4D:67",
    "0",
    "192.168.1.8",
    "00:1A:2B:3C:4D:66",
    "0",
    "ICMP",
    "Echo reply",
    "Ping Response",
  ],
]

interface Packet {
  id: number
  time: string
  length: string
  sourceIp: string
  sourceMac: string
  sourcePort: string
  destIp: string
  destMac: string
  destPort: string
  protocol: string
  details: string
  info: string
}

export default function PacketAnalyzer() {
  // State variables
  const [packets, setPackets] = useState<Packet[]>([])
  const [filteredPackets, setFilteredPackets] = useState<Packet[]>([])
  const [capturing, setCapturing] = useState(false)
  const [packetCount, setPacketCount] = useState("")
  const [fileFormat, setFileFormat] = useState("json")
  const [showProtoScheme, setShowProtoScheme] = useState(false)
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [showPacketDetails, setShowPacketDetails] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" })
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    ip: "",
    mac: "",
    protocol: "",
    port: "",
    length: "",
  })
  const [captureStats, setCaptureStats] = useState({
    totalPackets: 0,
    startTime: "",
    elapsedTime: 0,
    packetsPerSecond: 0,
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Packet | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Refs
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load mock data on component mount
  useEffect(() => {
    const formattedPackets = mockPackets.map((p) => ({
      id: p[0] as number,
      time: p[1] as string,
      length: p[2] as string,
      sourceIp: p[3] as string,
      sourceMac: p[4] as string,
      sourcePort: p[5] as string,
      destIp: p[6] as string,
      destMac: p[7] as string,
      destPort: p[8] as string,
      protocol: p[9] as string,
      details: p[10] as string,
      info: p[11] as string,
    }))
    setPackets(formattedPackets)
    setFilteredPackets(formattedPackets)

    // Clean up any existing event source on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
      }
    }
  }, [])

  // Apply filters when filters or packets change
  useEffect(() => {
    applyFilters()
  }, [filters, packets, sortConfig])

  // Auto-scroll table when new packets arrive
  useEffect(() => {
    if (tableContainerRef.current && capturing) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight
    }
  }, [filteredPackets, capturing])

  // Function to get row color classes based on protocol
  const getRowColorClasses = (protocol: string) => {
    const normalized = protocol.toUpperCase()
    return protocolColors[normalized] ? protocolColors[normalized] : "bg-background text-foreground"
  }

  // Function to show notification
  const showNotification = (message: string, type = "info") => {
    setNotification({ show: true, message, type })

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" })
    }, 3000)
  }

  // Function to start packet capture
  const startCapture = () => {
    setError(null)
    setCapturing(true)

    try {
      // In a real application, this would connect to your backend API
      // For demo purposes, we'll simulate receiving packets

      // Parse packet count limit if provided
      const limit = packetCount ? Number.parseInt(packetCount, 10) : null

      // Set capture start time
      const startTime = new Date()
      setCaptureStats({
        totalPackets: 0,
        startTime: startTime.toLocaleTimeString(),
        elapsedTime: 0,
        packetsPerSecond: 0,
      })

      // Start stats update interval
      statsIntervalRef.current = setInterval(() => {
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const pps = elapsedSeconds > 0 ? Math.round((packets.length / elapsedSeconds) * 10) / 10 : 0

        setCaptureStats((prev) => ({
          ...prev,
          elapsedTime: elapsedSeconds,
          totalPackets: packets.length,
          packetsPerSecond: pps,
        }))
      }, 1000)

      // Simulate receiving packets at intervals
      captureIntervalRef.current = setInterval(() => {
        // Generate a random packet
        const newPacket: Packet = {
          id: packets.length + 1,
          time: new Date().toLocaleTimeString(),
          length: Math.floor(Math.random() * 1500).toString(),
          sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
          sourceMac:
            "00:1A:2B:3C:4D:" +
            Math.floor(Math.random() * 100)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase(),
          sourcePort: Math.floor(Math.random() * 65535).toString(),
          destIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
          destMac:
            "00:1A:2B:3C:4D:" +
            Math.floor(Math.random() * 100)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase(),
          destPort: Math.floor(Math.random() * 65535).toString(),
          protocol: Object.keys(protocolColors)[Math.floor(Math.random() * Object.keys(protocolColors).length)],
          details: "Simulated packet details",
          info: "Simulated packet info",
        }

        setPackets((prev) => [...prev, newPacket])

        // Check if we've reached the packet limit
        if (limit && packets.length >= limit - 1) {
          if (captureIntervalRef.current) clearInterval(captureIntervalRef.current)
          if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
          setCapturing(false)
          showNotification(`Capture complete: ${limit} packets captured`, "success")
        }
      }, 1000)

      // Store the interval ID for cleanup
      eventSourceRef.current = {
        close: () => {
          if (captureIntervalRef.current) clearInterval(captureIntervalRef.current)
          if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
        },
      } as unknown as EventSource

      showNotification("Packet capture started", "success")
    } catch (err) {
      console.error("Error starting capture:", err)
      setError("Failed to start packet capture")
      setCapturing(false)
    }
  }

  // Function to stop packet capture
  const stopCapture = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = null
    }

    setCapturing(false)
    showNotification("Packet capture stopped", "info")
  }

  // Function to save captured packets
  const saveCapture = () => {
    try {
      // In a real application, this would call your backend API
      // For demo purposes, we'll create a downloadable file

      let content: string
      let mimeType: string
      let filename: string

      switch (fileFormat) {
        case "json":
          content = JSON.stringify(packets, null, 2)
          mimeType = "application/json"
          filename = "packet-capture.json"
          break
        case "pcap":
          // In a real app, this would be a binary file
          content = "This would be a binary PCAP file in a real application"
          mimeType = "application/octet-stream"
          filename = "packet-capture.pcap"
          break
        case "pdf":
          // In a real app, this would be a PDF file
          content = "This would be a PDF file in a real application"
          mimeType = "application/pdf"
          filename = "packet-capture.pdf"
          break
        default:
          content = JSON.stringify(packets, null, 2)
          mimeType = "application/json"
          filename = "packet-capture.json"
      }

      // Create a blob and download link
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification(`Capture saved as ${filename}`, "success")
    } catch (err) {
      console.error("Error saving capture:", err)
      setError("Failed to save capture")
    }
  }

  // Function to refresh/clear the display
  const refreshDisplay = () => {
    setPackets([])
    setFilteredPackets([])
    setError(null)

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = null
    }

    setCapturing(false)
    setCaptureStats({
      totalPackets: 0,
      startTime: "",
      elapsedTime: 0,
      packetsPerSecond: 0,
    })

    showNotification("Display cleared", "info")
  }

  // Function to apply filters and sorting
  const applyFilters = () => {
    // First filter the packets
    const filtered = packets.filter((packet) => {
      // IP filter (source or destination)
      const ipMatch = !filters.ip || packet.sourceIp.includes(filters.ip) || packet.destIp.includes(filters.ip)

      // MAC filter (source or destination)
      const macMatch =
        !filters.mac ||
        packet.sourceMac.toLowerCase().includes(filters.mac.toLowerCase()) ||
        packet.destMac.toLowerCase().includes(filters.mac.toLowerCase())

      // Protocol filter
      const protocolMatch = !filters.protocol || packet.protocol.toLowerCase().includes(filters.protocol.toLowerCase())

      // Port filter (source or destination)
      const portMatch = !filters.port || packet.sourcePort === filters.port || packet.destPort === filters.port

      // Length filter
      const lengthMatch = !filters.length || packet.length === filters.length

      return ipMatch && macMatch && protocolMatch && portMatch && lengthMatch
    })

    // Then sort the filtered packets if a sort config is set
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Packet]
        const bValue = b[sortConfig.key as keyof Packet]

        // Handle numeric values
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortConfig.direction === "ascending"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue)
        }

        // Handle string values
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredPackets(filtered)
  }

  // Function to handle column sorting
  const requestSort = (key: keyof Packet) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Function to get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Packet) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓"
  }

  // Function to reset filters
  const resetFilters = () => {
    setFilters({
      ip: "",
      mac: "",
      protocol: "",
      port: "",
      length: "",
    })

    showNotification("Filters reset", "info")
  }

  // Function to view packet details
  const viewPacketDetails = (packet: Packet) => {
    setSelectedPacket(packet)
    setShowPacketDetails(true)
  }

  // Function to copy packet data to clipboard
  const copyPacketData = (packet: Packet) => {
    const data = JSON.stringify(packet, null, 2)
    navigator.clipboard.writeText(data)
    showNotification("Packet data copied to clipboard", "success")
  }

  // Function to show statistics
  const showStatistics = () => {
    setShowStatsModal(true)

    // Use setTimeout to ensure the canvas is in the DOM
    setTimeout(() => {
      if (chartRef.current) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        // Count protocols
        const protocolCounts: Record<string, number> = {}
        packets.forEach((packet) => {
          const protocol = packet.protocol
          protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1
        })

        // Get protocol names and counts
        const protocols = Object.keys(protocolCounts)
        const counts = Object.values(protocolCounts)

        // Create chart
        const ctx = chartRef.current.getContext("2d")
        if (ctx && window.Chart) {
          chartInstance.current = new window.Chart(ctx, {
            type: "pie",
            data: {
              labels: protocols,
              datasets: [
                {
                  label: "Protocol Distribution",
                  data: counts,
                  backgroundColor: protocols.map((proto) => {
                    const normalized = proto.toUpperCase()
                    return protocolColorMapping[normalized] || "#ffffff"
                  }),
                  borderColor: "#ffffff",
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const label = context.label || ""
                      const value = context.raw
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                      const percentage = ((value / total) * 100).toFixed(1) + "%"
                      return `${label}: ${value} (${percentage})`
                    },
                  },
                },
                legend: {
                  position: "bottom",
                },
                title: {
                  display: true,
                  text: "Protocol Distribution",
                },
              },
            },
          })
        } else {
          console.error("Chart.js not loaded or canvas not available")
        }
      }
    }, 100)
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Packet Analyzer</h1>
          <p className="text-muted-foreground">Capture, analyze, and inspect network traffic in real-time</p>
        </div>

        {/* Capture Stats */}
        {capturing && (
          <div className="flex items-center space-x-4 bg-primary/10 p-2 rounded-md">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Status</span>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                <span className="font-medium">Capturing</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Packets</span>
              <span className="font-medium">{captureStats.totalPackets}</span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Time</span>
              <span className="font-medium">{captureStats.elapsedTime}s</span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Rate</span>
              <span className="font-medium">{captureStats.packetsPerSecond} pkt/s</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg transition-opacity ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-primary text-primary-foreground"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2 text-white hover:bg-white/20"
              onClick={() => setNotification({ show: false, message: "", type: "info" })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-white/30 mt-2 w-full animate-[shrink_3s_linear]"></div>
        </div>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Packet Capture Controls
          </CardTitle>
          <CardDescription>Configure and control your network packet capture session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="packetLimit" className="text-sm font-medium">
                    Packet Limit
                  </label>
                  <Input
                    id="packetLimit"
                    type="number"
                    placeholder="No limit"
                    value={packetCount}
                    onChange={(e) => setPacketCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fileFormat" className="text-sm font-medium">
                    Export Format
                  </label>
                  <Select value={fileFormat} onValueChange={setFileFormat}>
                    <SelectTrigger id="fileFormat">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pcap">PCAP</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProtoScheme(!showProtoScheme)}
                  className="flex items-center"
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Protocol Colors
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterSidebar(true)}
                  className="flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Display Filters
                </Button>

                <Button variant="outline" size="sm" onClick={showStatistics} className="flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={startCapture}
                      disabled={capturing}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Capture
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Begin capturing network packets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={stopCapture}
                      disabled={!capturing}
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop Capture
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop the current capture session</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={refreshDisplay}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all captured packets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save As
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setFileFormat("json")
                      saveCapture()
                    }}
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    <span>JSON Format</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFileFormat("pcap")
                      saveCapture()
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    <span>PCAP Format</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFileFormat("pdf")
                      saveCapture()
                    }}
                  >
                    <FilePdf className="mr-2 h-4 w-4" />
                    <span>PDF Format</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Protocol Scheme Dropdown */}
          {showProtoScheme && (
            <div className="mt-4 p-4 border rounded-md bg-card">
              <h3 className="text-sm font-medium mb-3">Protocol Color Scheme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(protocolColors).map(([protocol, colorClass]) => (
                  <div key={protocol} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <div className={`w-4 h-4 rounded ${colorClass.split(" ")[0]}`}></div>
                    <span className="text-sm">{protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Quick filter (IP, protocol, port...)"
            className="pl-8"
            value={filters.ip || filters.protocol || filters.port}
            onChange={(e) => {
              const value = e.target.value
              // Try to determine what the user is filtering by
              if (value.includes(".")) {
                setFilters({ ...filters, ip: value, protocol: "", port: "" })
              } else if (!isNaN(Number(value))) {
                setFilters({ ...filters, port: value, ip: "", protocol: "" })
              } else {
                setFilters({ ...filters, protocol: value, ip: "", port: "" })
              }
            }}
          />
          {(filters.ip || filters.protocol || filters.port) && (
            <Button variant="ghost" size="sm" className="absolute right-0.5 top-0.5 h-8 w-8 p-0" onClick={resetFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {Object.keys(protocolColors)
          .slice(0, 5)
          .map((protocol) => (
            <Badge
              key={protocol}
              variant="outline"
              className={`cursor-pointer ${filters.protocol === protocol ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setFilters({ ...filters, protocol: filters.protocol === protocol ? "" : protocol })}
            >
              {protocol}
            </Badge>
          ))}

        {Object.keys(protocolColors).length > 5 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                More Protocols
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(protocolColors)
                .slice(5)
                .map((protocol) => (
                  <DropdownMenuItem
                    key={protocol}
                    onClick={() => setFilters({ ...filters, protocol: filters.protocol === protocol ? "" : protocol })}
                  >
                    <div className={`w-3 h-3 rounded mr-2 ${protocolColors[protocol].split(" ")[0]}`}></div>
                    <span>{protocol}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Packet Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Captured Packets</CardTitle>
          <CardDescription>
            {filteredPackets.length} packets displayed{" "}
            {packets.length !== filteredPackets.length && `(filtered from ${packets.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={tableContainerRef} className="overflow-auto max-h-[calc(100vh-400px)] rounded-md">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr>
                  {[
                    { key: "id", label: "ID" },
                    { key: "time", label: "Time" },
                    { key: "length", label: "Length" },
                    { key: "sourceIp", label: "Source IP" },
                    { key: "sourceMac", label: "Source MAC" },
                    { key: "sourcePort", label: "Source Port" },
                    { key: "destIp", label: "Destination IP" },
                    { key: "destMac", label: "Destination MAC" },
                    { key: "destPort", label: "Destination Port" },
                    { key: "protocol", label: "Protocol" },
                    { key: "details", label: "Details" },
                    { key: "info", label: "Info" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="p-2 border-b text-left font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => requestSort(column.key as keyof Packet)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {sortConfig.key === column.key && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${
                              sortConfig.direction === "ascending" ? "rotate-0" : "rotate-180"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-4 text-center">
                      <span className="italic text-muted-foreground">
                        {capturing ? "Waiting for packets..." : "No packets to display"}
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredPackets.map((packet) => (
                    <tr
                      key={packet.id}
                      className={`${getRowColorClasses(packet.protocol)} hover:brightness-95 dark:hover:brightness-125 transition-all cursor-pointer`}
                      onClick={() => viewPacketDetails(packet)}
                    >
                      <td className="p-2 border-b">{packet.id}</td>
                      <td className="p-2 border-b">{packet.time}</td>
                      <td className="p-2 border-b">{packet.length}</td>
                      <td className="p-2 border-b">{packet.sourceIp}</td>
                      <td className="p-2 border-b">{packet.sourceMac}</td>
                      <td className="p-2 border-b">{packet.sourcePort}</td>
                      <td className="p-2 border-b">{packet.destIp}</td>
                      <td className="p-2 border-b">{packet.destMac}</td>
                      <td className="p-2 border-b">{packet.destPort}</td>
                      <td className="p-2 border-b">
                        <Badge variant="outline" className={getRowColorClasses(packet.protocol)}>
                          {packet.protocol}
                        </Badge>
                      </td>
                      <td className="p-2 border-b">{packet.details}</td>
                      <td className="p-2 border-b relative group">
                        <div className="flex items-center justify-between">
                          <span>{packet.info}</span>
                          <Info className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filter Sidebar */}
      <Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>Filter packets by various criteria to focus your analysis</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ipFilter" className="text-sm font-medium">
                  Filter by IP Address
                </label>
                <Input
                  id="ipFilter"
                  placeholder="e.g. 192.168.1.1"
                  value={filters.ip}
                  onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Matches source or destination IP addresses</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="macFilter" className="text-sm font-medium">
                  Filter by MAC Address
                </label>
                <Input
                  id="macFilter"
                  placeholder="e.g. 00:1A:2B:3C"
                  value={filters.mac}
                  onChange={(e) => setFilters({ ...filters, mac: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Matches source or destination MAC addresses</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="protocolFilter" className="text-sm font-medium">
                  Filter by Protocol
                </label>
                <Select value={filters.protocol} onValueChange={(value) => setFilters({ ...filters, protocol: value })}>
                  <SelectTrigger id="protocolFilter">
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Protocols</SelectItem>
                    {Object.keys(protocolColors).map((protocol) => (
                      <SelectItem key={protocol} value={protocol}>
                        {protocol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="portFilter" className="text-sm font-medium">
                  Filter by Port
                </label>
                <Input
                  id="portFilter"
                  placeholder="e.g. 80, 443"
                  value={filters.port}
                  onChange={(e) => setFilters({ ...filters, port: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Matches source or destination ports</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="lengthFilter" className="text-sm font-medium">
                  Filter by Packet Length
                </label>
                <Input
                  id="lengthFilter"
                  placeholder="e.g. 64"
                  value={filters.length}
                  onChange={(e) => setFilters({ ...filters, length: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters} className="flex-1">
                Reset Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Packet Details Modal */}
      <Dialog open={showPacketDetails} onOpenChange={setShowPacketDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Badge className={`mr-2 ${selectedPacket ? getRowColorClasses(selectedPacket.protocol) : ""}`}>
                {selectedPacket?.protocol}
              </Badge>
              Packet #{selectedPacket?.id} Details
            </DialogTitle>
            <DialogDescription>Detailed information and analysis of the selected network packet</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 mt-4">
            {selectedPacket && (
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  <TabsTrigger value="hex">Hex Dump</TabsTrigger>
                </TabsList>

                <TabsContent value="formatted" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                          <dt className="font-medium">Packet ID:</dt>
                          <dd>{selectedPacket.id}</dd>
                          <dt className="font-medium">Timestamp:</dt>
                          <dd>{selectedPacket.time}</dd>
                          <dt className="font-medium">Length:</dt>
                          <dd>{selectedPacket.length} bytes</dd>
                          <dt className="font-medium">Protocol:</dt>
                          <dd>
                            <Badge className={getRowColorClasses(selectedPacket.protocol)}>
                              {selectedPacket.protocol}
                            </Badge>
                          </dd>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Packet Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                          <dt className="font-medium">Info:</dt>
                          <dd>{selectedPacket.info}</dd>
                          <dt className="font-medium">Details:</dt>
                          <dd>{selectedPacket.details}</dd>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Source</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                          <dt className="font-medium">IP Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.sourceIp}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">MAC Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.sourceMac}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">Port:</dt>
                          <dd>{selectedPacket.sourcePort}</dd>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Destination</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                          <dt className="font-medium">IP Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.destIp}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">MAC Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.destMac}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">Port:</dt>
                          <dd>{selectedPacket.destPort}</dd>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="raw">
                  <Card>
                    <CardContent className="p-4">
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono whitespace-pre">
                        {JSON.stringify(selectedPacket, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hex">
                  <Card>
                    <CardContent className="p-4">
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono">
                        {`00000000  00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  |................|
00000010  10 11 12 13 14 15 16 17  18 19 1A 1B 1C 1D 1E 1F  |................|
00000020  20 21 22 23 24 25 26 27  28 29 2A 2B 2C 2D 2E 2F  | !"#$%&'()*+,-./|
00000030  30 31 32 33 34 35 36 37  38 39 3A 3B 3C 3D 3E 3F  |0123456789:;<=>?|
00000040  40 41 42 43 44 45 46 47  48 49 4A 4B 4C 4D 4E 4F  |@ABCDEFGHIJKLMNO|
00000050  50 51 52 53 54 55 56 57  58 59 5A 5B 5C 5D 5E 5F  |PQRSTUVWXYZ[\\]^_|
00000060  60 61 62 63 64 65 66 67  68 69 6A 6B 6C 6D 6E 6F  |\`abcdefghijklmno|
00000070  70 71 72 73 74 75 76 77  78 79 7A 7B 7C 7D 7E 7F  |pqrstuvwxyz{|}~.|`}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>

          <DialogFooter className="flex justify-between items-center mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Captured at {selectedPacket?.time}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyPacketData(selectedPacket!)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Data
              </Button>
              <Button size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Analyze Further
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Packet Analysis Statistics</DialogTitle>
            <DialogDescription>Statistical breakdown of captured network traffic</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Capture Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                  <dt className="font-medium">Total Packets:</dt>
                  <dd>{packets.length}</dd>
                  <dt className="font-medium">Start Time:</dt>
                  <dd>{captureStats.startTime || "N/A"}</dd>
                  <dt className="font-medium">Duration:</dt>
                  <dd>{captureStats.elapsedTime > 0 ? `${captureStats.elapsedTime} seconds` : "N/A"}</dd>
                  <dt className="font-medium">Average Rate:</dt>
                  <dd>{captureStats.packetsPerSecond > 0 ? `${captureStats.packetsPerSecond} packets/sec` : "N/A"}</dd>
                  <dt className="font-medium">Unique Protocols:</dt>
                  <dd>{new Set(packets.map((p) => p.protocol)).size}</dd>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Protocol Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] relative">
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 overflow-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Protocol Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Protocol</th>
                      <th className="text-left p-2">Count</th>
                      <th className="text-left p-2">Percentage</th>
                      <th className="text-left p-2">Avg. Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      packets.reduce(
                        (acc, packet) => {
                          const protocol = packet.protocol
                          if (!acc[protocol]) {
                            acc[protocol] = { count: 0, totalSize: 0 }
                          }
                          acc[protocol].count++
                          acc[protocol].totalSize += Number.parseInt(packet.length, 10)
                          return acc
                        },
                        {} as Record<string, { count: number; totalSize: number }>,
                      ),
                    ).map(([protocol, data]) => (
                      <tr key={protocol}>
                        <td className="p-2">
                          <Badge className={getRowColorClasses(protocol)}>{protocol}</Badge>
                        </td>
                        <td className="p-2">{data.count}</td>
                        <td className="p-2">{((data.count / packets.length) * 100).toFixed(1)}%</td>
                        <td className="p-2">{Math.round(data.totalSize / data.count)} bytes</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Chart.js dynamically */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.Chart) {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
              script.async = true;
              document.body.appendChild(script);
            }
          `,
        }}
      />
    </div>
  )
}

