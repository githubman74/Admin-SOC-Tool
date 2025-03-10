"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Protocol color mapping
const protocolColors: Record<string, string> = {
  HTTP: "bg-[#CCE4FF] text-black",
  HTTPS: "bg-[#CCFFD9] text-black",
  SSH: "bg-[#FFCCCC] text-black",
  FTP: "bg-[#FFF5CC] text-black",
  DNS: "bg-[#E5CCFF] text-black",
  ARP: "bg-[#FFCCE5] text-black",
  ICMP: "bg-[#F2F2F2] text-black",
  TCP: "bg-[#D9CCFF] text-black",
  UDP: "bg-[#CCFFFF] text-black",
  TLS: "bg-[#CCFFF2] text-black",
  "TLS V1.2": "bg-[#CCFFFC] text-black",
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
  const [notification, setNotification] = useState({ show: false, message: "" })
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    ip: "",
    mac: "",
    protocol: "",
    port: "",
    length: "",
  })

  // Refs
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

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
    }
  }, [])

  // Apply filters when filters or packets change
  useEffect(() => {
    applyFilters()
  }, [filters, packets])

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
  const showNotification = (message: string) => {
    setNotification({ show: true, message })

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "" })
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

      // Simulate receiving packets at intervals
      const interval = setInterval(() => {
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
          clearInterval(interval)
          setCapturing(false)
          showNotification(`Capture complete: ${limit} packets captured`)
        }
      }, 1000)

      // Store the interval ID for cleanup
      eventSourceRef.current = { close: () => clearInterval(interval) } as unknown as EventSource

      showNotification("Packet capture started")
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

    setCapturing(false)
    showNotification("Packet capture stopped")
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

      showNotification(`Capture saved as ${filename}`)
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

    setCapturing(false)
    showNotification("Display cleared")
  }

  // Function to apply filters
  const applyFilters = () => {
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

    setFilteredPackets(filtered)
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

    showNotification("Filters reset")
  }

  // Function to view packet details
  const viewPacketDetails = (packet: Packet) => {
    setSelectedPacket(packet)
    setShowPacketDetails(true)
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
    <div className="container py-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-md shadow-lg transition-opacity">
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
              onClick={() => setNotification({ show: false, message: "" })}
            >
              ×
            </Button>
          </div>
          <div className="h-1 bg-primary-foreground/30 mt-2 w-full animate-[shrink_3s_linear]"></div>
        </div>
      )}

      {/* Control Panel */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Packet count limit"
                className="w-40"
                value={packetCount}
                onChange={(e) => setPacketCount(e.target.value)}
              />
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="bg-primary/10 px-4 py-2"
                onClick={() => setShowProtoScheme(!showProtoScheme)}
              >
                <span className="text-xs text-center">Protocol Scheme</span>
              </Button>


              <Button
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={startCapture}
                disabled={capturing}
              >
                Start Capture
              </Button>

              <Button
                variant="default"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={stopCapture}
                disabled={!capturing}
              >
                Stop Capture
              </Button>

              <Button variant="outline" onClick={refreshDisplay}>
                Refresh
              </Button>

              <Button variant="outline" onClick={() => setShowFilterSidebar(true)}>
                Display Filter
              </Button>

              <Button
                variant="default"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={showStatistics}
              >
                Statistics
              </Button>

              <Select value={fileFormat} onValueChange={setFileFormat}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pcap">PCAP</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={saveCapture}>
                Save Capture
              </Button>
            </div>
          </div>

          {/* Protocol Scheme Dropdown */}
          {showProtoScheme && (
            <div className="p-4 border rounded-md">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(protocolColors).map(([protocol, colorClass]) => (
                  <div key={protocol} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${colorClass.split(" ")[0]}`}></div>
                    <span>{protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Packet Table */}
      <div ref={tableContainerRef} className="border rounded-md overflow-auto max-h-[calc(100vh-300px)]">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr>
              <th className="p-2 border-b text-left">ID</th>
              <th className="p-2 border-b text-left">Time</th>
              <th className="p-2 border-b text-left">Length</th>
              <th className="p-2 border-b text-left">Source IP</th>
              <th className="p-2 border-b text-left">Source MAC</th>
              <th className="p-2 border-b text-left">Source Port</th>
              <th className="p-2 border-b text-left">Destination IP</th>
              <th className="p-2 border-b text-left">Destination MAC</th>
              <th className="p-2 border-b text-left">Destination Port</th>
              <th className="p-2 border-b text-left">Protocol</th>
              <th className="p-2 border-b text-left">Details</th>
              <th className="p-2 border-b text-left">Info</th>
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
                <tr key={packet.id} className={getRowColorClasses(packet.protocol)}>
                  <td className="p-2 border-b">{packet.id}</td>
                  <td className="p-2 border-b">{packet.time}</td>
                  <td className="p-2 border-b">{packet.length}</td>
                  <td className="p-2 border-b">{packet.sourceIp}</td>
                  <td className="p-2 border-b">{packet.sourceMac}</td>
                  <td className="p-2 border-b">{packet.sourcePort}</td>
                  <td className="p-2 border-b">{packet.destIp}</td>
                  <td className="p-2 border-b">{packet.destMac}</td>
                  <td className="p-2 border-b">{packet.destPort}</td>
                  <td className="p-2 border-b">{packet.protocol}</td>
                  <td className="p-2 border-b">{packet.details}</td>
                  <td className="p-2 border-b cursor-pointer relative group" onClick={() => viewPacketDetails(packet)}>
                    {packet.info}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Click for details</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Filter Sidebar */}
      <Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Options</SheetTitle>
            <SheetDescription>Filter packets by various criteria</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="ipFilter" className="text-sm font-medium">
                Filter by IP:
              </label>
              <Input
                id="ipFilter"
                placeholder="Enter IP address"
                value={filters.ip}
                onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="macFilter" className="text-sm font-medium">
                Filter by MAC Address:
              </label>
              <Input
                id="macFilter"
                placeholder="Enter MAC address"
                value={filters.mac}
                onChange={(e) => setFilters({ ...filters, mac: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="protocolFilter" className="text-sm font-medium">
                Filter by Protocol:
              </label>
              <Input
                id="protocolFilter"
                placeholder="Enter protocol"
                value={filters.protocol}
                onChange={(e) => setFilters({ ...filters, protocol: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="portFilter" className="text-sm font-medium">
                Filter by Port:
              </label>
              <Input
                id="portFilter"
                placeholder="Enter port"
                value={filters.port}
                onChange={(e) => setFilters({ ...filters, port: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lengthFilter" className="text-sm font-medium">
                Filter by Length:
              </label>
              <Input
                id="lengthFilter"
                placeholder="Enter length"
                value={filters.length}
                onChange={(e) => setFilters({ ...filters, length: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Packet Details</DialogTitle>
            <DialogDescription>Detailed information about packet #{selectedPacket?.id}</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto p-4">
            {selectedPacket && (
              <Tabs defaultValue="formatted">
                <TabsList className="mb-4">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">ID:</div>
                          <div className="text-sm">{selectedPacket.id}</div>
                          <div className="text-sm font-medium">Time:</div>
                          <div className="text-sm">{selectedPacket.time}</div>
                          <div className="text-sm font-medium">Length:</div>
                          <div className="text-sm">{selectedPacket.length} bytes</div>
                          <div className="text-sm font-medium">Protocol:</div>
                          <div className="text-sm">{selectedPacket.protocol}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Source</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">IP:</div>
                          <div className="text-sm">{selectedPacket.sourceIp}</div>
                          <div className="text-sm font-medium">MAC:</div>
                          <div className="text-sm">{selectedPacket.sourceMac}</div>
                          <div className="text-sm font-medium">Port:</div>
                          <div className="text-sm">{selectedPacket.sourcePort}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Destination</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">IP:</div>
                          <div className="text-sm">{selectedPacket.destIp}</div>
                          <div className="text-sm font-medium">MAC:</div>
                          <div className="text-sm">{selectedPacket.destMac}</div>
                          <div className="text-sm font-medium">Port:</div>
                          <div className="text-sm">{selectedPacket.destPort}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Details</h3>
                        <div className="text-sm">{selectedPacket.details}</div>
                        <div className="text-sm">{selectedPacket.info}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="raw">
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                    {`00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F
20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F
30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F
40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F
50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F
60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F
70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F`}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Packet Statistics</DialogTitle>
            <DialogDescription>Distribution of captured packets by protocol</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[400px] relative">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
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

