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
  Palette,
  ChevronDown,
  Search,
  X,
  ArrowUpDown,
  Copy,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  POP3: "bg-[#FFE5CC] text-black dark:bg-orange-800 dark:text-white",
  POP3S: "bg-[#FFDEB3] text-black dark:bg-amber-800 dark:text-white",
  IMAP: "bg-[#ECCEFF] text-black dark:bg-violet-800 dark:text-white",
  IMAPS: "bg-[#E0CCFF] text-black dark:bg-purple-900 dark:text-white",
  SMTP: "bg-[#FEF08A] text-black dark:bg-yellow-700 dark:text-white",
  TELNET: "bg-[#F9FFCC] text-black dark:bg-lime-800 dark:text-white",
  LDAP: "bg-[#D1FAE5] text-black dark:bg-green-700 dark:text-white",
  LDAPS: "bg-[#A7F3D0] text-black dark:bg-emerald-700 dark:text-white",
  PPTP: "bg-[#FFCCE8] text-black dark:bg-pink-700 dark:text-white",
  RDP: "bg-[#FFDDDD] text-black dark:bg-red-700 dark:text-white",
  VNC: "bg-[#FFB3B3] text-black dark:bg-red-600 dark:text-white",
  RTMP: "bg-[#B3D1FF] text-black dark:bg-blue-700 dark:text-white",
  XMPP: "bg-[#B8CCFF] text-black dark:bg-blue-600 dark:text-white",
  IRC: "bg-[#CCE9FF] text-black dark:bg-sky-700 dark:text-white",
  NNTP: "bg-[#F3CCFF] text-black dark:bg-fuchsia-700 dark:text-white",
  SNMP: "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
  DHCP: "bg-[#FFF0CC] text-black dark:bg-amber-700 dark:text-white",
  MDNS: "bg-[#FFB3D9] text-black dark:bg-pink-600 dark:text-white",
  LLMNR: "bg-[#EACCFF] text-black dark:bg-violet-700 dark:text-white",
  NBNS: "bg-[#EFEFEF] text-black dark:bg-gray-500 dark:text-white",
  NTP: "bg-[#CCEFFF] text-black dark:bg-sky-600 dark:text-white",
  SIP: "bg-[#B3FFE7] text-black dark:bg-teal-600 dark:text-white",
  RTP: "bg-[#B3FFC2] text-black dark:bg-green-600 dark:text-white",
  RTCP: "bg-[#C2FFB3] text-black dark:bg-lime-600 dark:text-white",
  COAP: "bg-[#FFF7CC] text-black dark:bg-yellow-600 dark:text-white",
  SFLOW: "bg-[#CCF5FF] text-black dark:bg-cyan-600 dark:text-white",
  NETFLOW: "bg-[#B3E0FF] text-black dark:bg-blue-500 dark:text-white",
  GTP: "bg-[#E0FFCC] text-black dark:bg-lime-700 dark:text-white",
  RADIUS: "bg-[#D9FFCC] text-black dark:bg-green-700 dark:text-white",
  IPV4: "bg-[#FFC9CC] text-black dark:bg-red-500 dark:text-white",
  IPV6: "bg-[#FFF0B3] text-black dark:bg-yellow-500 dark:text-white",
  VLAN: "bg-[#CCFFED] text-black dark:bg-emerald-600 dark:text-white",
  QUIC: "bg-[#FFDECC] text-black dark:bg-orange-600 dark:text-white",
  MQTT: "bg-[#FFD6CC] text-black dark:bg-orange-500 dark:text-white",
  SMB: "bg-[#CCF2FF] text-black dark:bg-sky-500 dark:text-white",
  NETBIOS: "bg-[#CCFFE0] text-black dark:bg-emerald-500 dark:text-white",
  NFS: "bg-[#D9FFCC] text-black dark:bg-lime-500 dark:text-white",
  KERBEROS: "bg-[#CCFFDB] text-black dark:bg-emerald-500 dark:text-white",
  SIPS: "bg-[#DBCCFF] text-black dark:bg-violet-500 dark:text-white",
  TFTP: "bg-[#FFCCF5] text-black dark:bg-fuchsia-500 dark:text-white",
  SYSLOG: "bg-[#F5CCFF] text-black dark:bg-fuchsia-600 dark:text-white",
  ICMPV6: "bg-[#CCF5FF] text-black dark:bg-cyan-500 dark:text-white",
  "IPsec (ESP)": "bg-[#FFCCE0] text-black dark:bg-pink-600 dark:text-white",
  "IPsec (AH)": "bg-[#E0CCFF] text-black dark:bg-violet-600 dark:text-white",
  OSPF: "bg-[#CCFFE0] text-black dark:bg-emerald-600 dark:text-white",
  BGP: "bg-[#E0FFCC] text-black dark:bg-lime-600 dark:text-white",
  SCTP: "bg-[#CCFFDB] text-black dark:bg-emerald-600 dark:text-white",
  DCCP: "bg-[#DBCCFF] text-black dark:bg-violet-600 dark:text-white",
  "Layer 2 Protocol": "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
  "Unknown Layer 2 Protocol": "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
  "Unresolved Protocol": "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
  Unknown: "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
  Raw: "bg-[#EDEDED] text-black dark:bg-gray-600 dark:text-white",
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
  POP3: "#FFE5CC",
  POP3S: "#FFDEB3",
  IMAP: "#ECCEFF",
  IMAPS: "#E0CCFF",
  SMTP: "#FEF08A",
  TELNET: "#F9FFCC",
  LDAP: "#D1FAE5",
  LDAPS: "#A7F3D0",
  PPTP: "#FFCCE8",
  RDP: "#FFDDDD",
  VNC: "#FFB3B3",
  RTMP: "#B3D1FF",
  XMPP: "#B8CCFF",
  IRC: "#CCE9FF",
  NNTP: "#F3CCFF",
  SNMP: "#EDEDED",
  DHCP: "#FFF0CC",
  MDNS: "#FFB3D9",
  LLMNR: "#EACCFF",
  NBNS: "#EFEFEF",
  NTP: "#CCEFFF",
  SIP: "#B3FFE7",
  RTP: "#B3FFC2",
  RTCP: "#C2FFB3",
  COAP: "#FFF7CC",
  SFLOW: "#CCF5FF",
  NETFLOW: "#B3E0FF",
  GTP: "#E0FFCC",
  RADIUS: "#D9FFCC",
  IPV4: "#FFC9CC",
  IPV6: "#FFF0B3",
  VLAN: "#CCFFED",
  QUIC: "#FFDECC",
  MQTT: "#FFD6CC",
  SMB: "#CCF2FF",
  NETBIOS: "#CCFFE0",
  NFS: "#D9FFCC",
  KERBEROS: "#CCFFDB",
  SIPS: "#DBCCFF",
  TFTP: "#FFCCF5",
  SYSLOG: "#F5CCFF",
  ICMPV6: "#CCF5FF",
  "IPsec (ESP)": "#FFCCE0",
  "IPsec (AH)": "#E0CCFF",
  OSPF: "#CCFFE0",
  BGP: "#E0FFCC",
  SCTP: "#CCFFDB",
  DCCP: "#DBCCFF",
  "Layer 2 Protocol": "#EDEDED",
  "Unknown Layer 2 Protocol": "#EDEDED",
  "Unresolved Protocol": "#EDEDED",
  Unknown: "#EDEDED",
  Raw: "#EDEDED",
}

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
  detailedInfo?: string
}

export default function PacketAnalyzer() {
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

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [activeTab, setActiveTab] = useState("formatted")
  const [copied, setCopied] = useState(false)

  // Update copy function to set the button state to "Copied"
  const copyCurrentData = () => {
    if (!selectedPacket) return
    let dataToCopy = ""
    if (activeTab === "raw") {
      dataToCopy = JSON.stringify(selectedPacket, null, 2)
    } else if (activeTab === "hex") {
      dataToCopy = selectedPacket.detailedInfo || "Loading detailed packet information..."
    }
    navigator.clipboard.writeText(dataToCopy)
    setCopied(true)
    showNotification("Data copied to clipboard", "success")
    setTimeout(() => setCopied(false), 2000)
  }

  // Force dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }, [])

  // Clean up event source and intervals on unmount
  useEffect(() => {
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

  // Load Chart.js dynamically
  useEffect(() => {
    const loadChartJs = async () => {
      if (!window.Chart) {
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/chart.js"
        script.async = true

        // Create a promise to wait for script to load
        const scriptLoaded = new Promise<void>((resolve) => {
          script.onload = () => resolve()
        })

        document.body.appendChild(script)
        await scriptLoaded
        console.log("Chart.js loaded successfully")
      }
    }

    loadChartJs()
  }, [])

  const getRowColorClasses = (protocol: string) => {
    const normalized = protocol.toUpperCase()
    return protocolColors[normalized] ? protocolColors[normalized] : "bg-background text-foreground"
  }

  const showNotification = (message: string, type = "info") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" })
    }, 2000)
  }

  const startCapture = async () => {
    setError(null)
    setCapturing(true)
    setPackets([]) // Reset packets when starting a new capture

    try {
      const limit = packetCount ? Number.parseInt(packetCount, 10) : null

      const startTime = new Date()
      setCaptureStats({
        totalPackets: 0,
        startTime: startTime.toLocaleTimeString(),
        elapsedTime: 0,
        packetsPerSecond: 0,
      })

      statsIntervalRef.current = setInterval(() => {
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)

        // Use a ref to directly access the current packets state
        setPackets((currentPackets) => {
          const packetCount = currentPackets.length
          const pps = elapsedSeconds > 0 ? Math.round((packetCount / elapsedSeconds) * 10) / 10 : 0

          // Update stats with the current packet count
          setCaptureStats((prev) => ({
            ...prev,
            elapsedTime: elapsedSeconds,
            totalPackets: packetCount,
            packetsPerSecond: pps,
          }))

          return currentPackets
        })
      }, 1000)

      // Start capture on the Flask backend
      const response = await fetch("http://127.0.0.1:5000/api/capture/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: limit }),
      })

      if (!response.ok) {
        throw new Error("Failed to start capture")
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Connect to the Flask SSE endpoint
      eventSourceRef.current = new EventSource("http://127.0.0.1:5000/stream")

      eventSourceRef.current.onmessage = (event) => {
        try {
          const packetData = JSON.parse(event.data)
          const newPacket: Packet = {
            id: packetData[0],
            time: packetData[1],
            length: packetData[2].toString(),
            sourceIp: packetData[3],
            sourceMac: packetData[4],
            sourcePort: packetData[5].toString(),
            destIp: packetData[6],
            destMac: packetData[7],
            destPort: packetData[8].toString(),
            protocol: packetData[9],
            details: packetData[10],
            info: packetData[11],
          }

          // Update the packets state
          setPackets((prev) => [...prev, newPacket])

          if (limit && packets.length >= limit - 1) {
            stopCapture()
            showNotification(`Capture complete: ${limit} packets captured`, "success")
          }
        } catch (err) {
          console.error("Error parsing packet data:", err)
        }
      }

      eventSourceRef.current.onerror = (err) => {
        console.error("EventSource failed:", err)
        stopCapture()
        setError("Connection to packet stream failed")
      }

      showNotification("Packet capture started", "success")
    } catch (err) {
      console.error("Error starting capture:", err)
      setError("Failed to start packet capture")
      setCapturing(false)
    }
  }

  const stopCapture = async () => {
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

    try {
      await fetch("http://127.0.0.1:5000/api/capture/stop", { method: "POST" })
      showNotification("Packet capture stopped", "info")
    } catch (err) {
      console.error("Error stopping capture:", err)
    }
  }

  const saveCapture = () => {
    try {
      const url = `http://127.0.0.1:5000/api/capture/save/${fileFormat}?_=${Date.now()}`
      window.open(url, "_blank") // Opens the file download in a new tab
      showNotification(`Capture saved as packet-capture.${fileFormat}`, "success")
    } catch (err) {
      console.error("Error saving capture:", err)
      setError("Failed to save capture")
    }
  }

  const refreshDisplay = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/refresh", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to refresh display")
      }

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
    } catch (err) {
      console.error("Error refreshing display:", err)
      setError("Failed to refresh display")
    }
  }

  const applyFilters = () => {
    const filtered = packets.filter((packet) => {
      const ipMatch = !filters.ip || packet.sourceIp.includes(filters.ip) || packet.destIp.includes(filters.ip)
      const macMatch =
        !filters.mac ||
        packet.sourceMac.toLowerCase().includes(filters.mac.toLowerCase()) ||
        packet.destMac.toLowerCase().includes(filters.mac.toLowerCase())
      const protocolMatch = !filters.protocol || packet.protocol.toLowerCase().includes(filters.protocol.toLowerCase())
      const portMatch = !filters.port || packet.sourcePort === filters.port || packet.destPort === filters.port
      const lengthMatch = !filters.length || packet.length === filters.length

      return ipMatch && macMatch && protocolMatch && portMatch && lengthMatch
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Packet]
        const bValue = b[sortConfig.key as keyof Packet]

        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortConfig.direction === "ascending"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue)
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredPackets(filtered)
  }

  const requestSort = (key: keyof Packet) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

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

  const viewPacketDetails = async (packet: Packet) => {
    setSelectedPacket(packet)
    setShowPacketDetails(true)

    try {
      const response = await fetch(`http://127.0.0.1:5000/packet_detail/${packet.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch packet details")
      }

      const data = await response.json()

      // Update the selected packet with detailed info
      setSelectedPacket((prev) => {
        if (prev) {
          return {
            ...prev,
            detailedInfo: data.detailed_info,
          }
        }
        return prev
      })
    } catch (err) {
      console.error("Error fetching packet details:", err)
    }
  }

  const copyPacketData = (packet: Packet) => {
    const data = JSON.stringify(packet, null, 2)
    navigator.clipboard.writeText(data)
    showNotification("Packet data copied to clipboard", "success")
  }

  const showStatistics = async () => {
    setShowStatsModal(true)

    try {
      const response = await fetch("http://127.0.0.1:5000/api/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }

      const statsData = await response.json()

      // Wait for Chart.js to be loaded
      if (!window.Chart) {
        await new Promise<void>((resolve) => {
          const checkChart = () => {
            if (window.Chart) {
              resolve()
            } else {
              setTimeout(checkChart, 100)
            }
          }
          checkChart()
        })
      }

      // Render chart after a short delay to ensure the canvas is ready
      setTimeout(() => {
        if (chartRef.current) {
          // Destroy existing chart if it exists
          if (chartInstance.current) {
            chartInstance.current.destroy()
          }

          const protocols = Object.keys(statsData.protocol_counts)
          const counts = Object.values(statsData.protocol_counts)

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
                    labels: {
                      color: "#ffffff",
                    },
                  },
                  title: {
                    display: true,
                    text: "Protocol Distribution",
                    color: "#ffffff",
                  },
                },
              },
            })
          } else {
            console.error("Chart.js not loaded or canvas not available")
          }
        }
      }, 200)
    } catch (err) {
      console.error("Error showing statistics:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Network Packet Analyzer</h1>
          <p className="text-muted-foreground">Capture, analyze, and inspect network traffic in real-time</p>
        </div>

        {/* Capture Stats */}
        {capturing && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/10 p-2 rounded-md">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Status</span>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                <span className="font-medium">Capturing</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Packets</span>
              <span className="font-medium">{captureStats.totalPackets}</span>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Time</span>
              <span className="font-medium">{captureStats.elapsedTime}s</span>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
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
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all ${
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
          <div className="h-1 bg-white/30 mt-2 w-full relative overflow-hidden">
            <div
              className="absolute inset-0 bg-white animate-[shrink_2s_linear]"
              style={{
                animation: "shrink 2s linear forwards",
              }}
            ></div>
          </div>
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

              <div className="flex flex-wrap items-center gap-2">
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

              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => {
                  setFileFormat("json")
                  saveCapture()
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Save As
              </Button>
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
            <DropdownMenuContent align="end" className="max-h-[50vh] overflow-y-auto">
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
          <div
            ref={tableContainerRef}
            className="overflow-auto rounded-md"
            style={{ height: "calc(100vh - 300px)" }} // Further increased height
          >
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 bg-card z-50">
                <tr className="bg-card">
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
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="py-4 px-2 border whitespace-nowrap text-center font-medium text-sm cursor-pointer hover:bg-muted/50 bg-card"
                      onClick={() => requestSort(column.key as keyof Packet)}
                      style={{ zIndex: 50 }}
                    >
                      <div className="flex items-center justify-center">
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
                      <td className="p-2 border text-center">{packet.id}</td>
                      <td className="p-2 border text-center whitespace-nowrap">{packet.time}</td>
                      <td className="p-2 border text-center">{packet.length}</td>
                      <td className="p-2 border text-center">{packet.sourceIp}</td>
                      <td className="p-2 border text-center">{packet.sourceMac}</td>
                      <td className="p-2 border text-center">{packet.sourcePort}</td>
                      <td className="p-2 border text-center">{packet.destIp}</td>
                      <td className="p-2 border text-center">{packet.destMac}</td>
                      <td className="p-2 border text-center">{packet.destPort}</td>
                      <td className="p-2 border text-center">
                        <Badge variant="outline" className={getRowColorClasses(packet.protocol)}>
                          {packet.protocol}
                        </Badge>
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
                    <SelectItem value="all">All Protocols</SelectItem>
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
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Badge className={`mr-2 ${selectedPacket ? getRowColorClasses(selectedPacket.protocol) : ""}`}>
                {selectedPacket?.protocol}
              </Badge>
              Packet #{selectedPacket?.id} Details
            </DialogTitle>
            <DialogDescription>Detailed information and analysis of the selected network packet</DialogDescription>
          </DialogHeader>

          <div className="flex-1 mt-4 overflow-hidden">
            {selectedPacket && (
              <Tabs defaultValue="formatted" className="w-full" onValueChange={(value) => setActiveTab(value)}>
                <TabsList className="mb-4 w-full justify-start overflow-x-auto">
                  <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  <TabsTrigger value="hex">Detailed View</TabsTrigger>
                </TabsList>

                <TabsContent value="formatted" className="space-y-6 overflow-y-auto max-h-[50vh] pr-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(selectedPacket.sourceIp)
                                showNotification("IP copied to clipboard", "success")
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">MAC Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.sourceMac}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(selectedPacket.sourceMac)
                                showNotification("MAC copied to clipboard", "success")
                              }}
                            >
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(selectedPacket.destIp)
                                showNotification("IP copied to clipboard", "success")
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </dd>
                          <dt className="font-medium">MAC Address:</dt>
                          <dd className="flex items-center">
                            {selectedPacket.destMac}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(selectedPacket.destMac)
                                showNotification("MAC copied to clipboard", "success")
                              }}
                            >
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

                <TabsContent value="raw" className="overflow-hidden">
                  <Card>
                    <CardContent className="p-4">
                      <div className="overflow-y-auto max-h-[50vh]">
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre">
                          {JSON.stringify(selectedPacket, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hex" className="overflow-hidden">
                  <Card>
                    <CardContent className="p-4">
                      <div className="overflow-y-auto max-h-[50vh]">
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre">
                          {selectedPacket.detailedInfo || "Loading detailed packet information..."}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Captured at {selectedPacket?.time}</span>
            </div>
            <div className="flex gap-2">
              {activeTab !== "formatted" && (
                <Button variant="outline" size="sm" onClick={copyCurrentData}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied" : "Copy Data"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Packet Analysis Statistics</DialogTitle>
            <DialogDescription>Statistical breakdown of captured network traffic</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4">
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
                    <dd>
                      {captureStats.packetsPerSecond > 0 ? `${captureStats.packetsPerSecond} packets/sec` : "N/A"}
                    </dd>
                    <dt className="font-medium">Unique Protocols:</dt>
                    <dd>{new Set(packets.map((p) => p.protocol)).size}</dd>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Protocol Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] relative">
                  <canvas ref={chartRef} className="w-full h-full"></canvas>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Protocol Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                </div>
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
      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

