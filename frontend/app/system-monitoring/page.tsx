"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, LineChart } from "@/components/ui/chart"
import {
  Cpu,
  Database,
  HardDrive,
  Network,
  Activity,
  RefreshCw,
  Wifi,
  Zap,
  Server,
  Search,
  AlertCircle,
  Laptop,
  Smartphone,
  Router,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// --- Interfaces ---
interface NetworkSpeed {
  download_speed: number
  upload_speed: number
  ping: number | null
}

interface WiFiDetails {
  SSID: string | null
  "Signal Strength": string | null
}

interface CPUProcess {
  pid: number
  name: number
  cpu_percent: number
}

interface MemoryProcess {
  pid: number
  name: string
  memory_percent: number
}

interface ProcessDetails {
  Id: number
  SI: number
  ProcessName: string
  CPU: number
  Handles: number
  NPM: number
  PM: number
  WS: number
}

interface MetricsResponse {
  cpu_usage: number
  per_core_usage: number[]
  memory_usage: number
  disk_usage: number
  network_speed: NetworkSpeed
  wifi_details: WiFiDetails
  top_cpu_processes: CPUProcess[]
  top_memory_processes: MemoryProcess[]
  top_network_processes: { name: string; connections: number }[]
  process_details: ProcessDetails[] | string
}

interface Device {
  ip: string
  mac: string
}

// --- Initial state ---
const initialMetrics: MetricsResponse = {
  cpu_usage: 0,
  per_core_usage: [],
  memory_usage: 0,
  disk_usage: 0,
  network_speed: { download_speed: 0, upload_speed: 0, ping: 0 },
  wifi_details: { SSID: null, "Signal Strength": null },
  top_cpu_processes: [],
  top_memory_processes: [],
  top_network_processes: [],
  process_details: [],
}

// --- DeviceSelector Component ---
function DeviceSelector({ onSelect }: { onSelect: (ip: string) => void }) {
  const [gateway, setGateway] = useState<string>("")
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [directIP, setDirectIP] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "http://127.0.0.1:8123/devices"
      if (gateway.trim()) {
        url += `?gateway=${encodeURIComponent(gateway.trim())}`
      }
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to fetch devices: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      // Transform devices: if keys are uppercase, convert them to lowercase.
      const transformedDevices = (data.devices || []).map((device: any) => ({
        ip: device.IP ? device.IP : device.ip,
        mac: device.MAC ? device.MAC : device.mac,
      }))
      setDevices(transformedDevices)
      if (transformedDevices.length > 0) {
        setSelectedDevice(transformedDevices[0].ip)
      } else {
        setSelectedDevice("")
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch devices")
      setDevices([])
      setSelectedDevice("")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const getDeviceIcon = (ip: string) => {
    // Simple logic to determine device type based on IP
    // In a real app, you'd use more sophisticated detection
    if (ip.startsWith("192.168.1.")) {
      const lastOctet = Number.parseInt(ip.split(".")[3])
      if (lastOctet < 20) return <Router className="h-4 w-4 mr-2" />
      if (lastOctet < 50) return <Laptop className="h-4 w-4 mr-2" />
      return <Smartphone className="h-4 w-4 mr-2" />
    }
    return <Server className="h-4 w-4 mr-2" />
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Network className="h-5 w-5 mr-2" />
          Device Selection
        </CardTitle>
        <CardDescription>
          Choose a device to monitor by scanning your network or entering an IP directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scan by Gateway */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Scan Network</h3>
            {loading && (
              <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Scanning...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              placeholder="Gateway (e.g., 192.168.1.1)"
              className="flex-1"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={fetchDevices} size="sm" variant="secondary" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scan network for available devices</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="pt-2">
            <Select value={selectedDevice} onValueChange={setSelectedDevice} disabled={devices.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loading ? "Scanning network..." : devices.length === 0 ? "No devices found" : "Select a device"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device, idx) => (
                  <SelectItem key={idx} value={device.ip}>
                    <div className="flex items-center">
                      {getDeviceIcon(device.ip)}
                      <span>{device.ip}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {device.mac}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Direct IP Entry */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Direct Connection</h3>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={directIP}
              onChange={(e) => setDirectIP(e.target.value)}
              placeholder="Device IP (e.g., 192.168.1.57)"
              className="flex-1"
            />
            <Button
              onClick={() => directIP.trim() && onSelect(directIP.trim())}
              size="sm"
              variant="default"
              disabled={!directIP.trim()}
            >
              <Zap className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" onClick={() => onSelect("127.0.0.1")}>
          <Laptop className="h-4 w-4 mr-2" />
          Local Machine
        </Button>
        <Button onClick={() => selectedDevice && onSelect(selectedDevice)} size="sm" disabled={!selectedDevice}>
          <Activity className="h-4 w-4 mr-2" />
          Monitor Selected
        </Button>
      </CardFooter>
    </Card>
  )
}

// --- Main Dashboard Component ---
export default function SystemDashboard() {
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState<MetricsResponse>(initialMetrics)
  const [cpuHistory, setCpuHistory] = useState<Array<{ timestamp: number; value: number }>>([])
  const [coreHistory, setCoreHistory] = useState<Array<Array<{ timestamp: number; value: number }>>>([])
  const { theme, setTheme } = useTheme()
  const [connectionIP, setConnectionIP] = useState("127.0.0.1")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [refreshInterval, setRefreshInterval] = useState<number>(1000)
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setConnectionStatus("connecting")
    setError(null)

    const eventSource = new EventSource(`http://${connectionIP}:8123/metrics`)

    eventSource.onmessage = (event) => {
      try {
        const data: MetricsResponse = JSON.parse(event.data)
        const timestamp = Date.now()
        setMetrics(data)
        setLastUpdated(new Date().toLocaleTimeString())
        setConnectionStatus("connected")

        // Update CPU history
        setCpuHistory((prev) => [...prev, { timestamp, value: Math.min(data.cpu_usage, 99) }].slice(-60))

        // Update core history
        setCoreHistory((prev) => {
          if (prev.length === 0) {
            return data.per_core_usage.map((core: number) => [{ timestamp, value: Math.min(core, 99) }])
          }
          return data.per_core_usage.map((core: number, index: number) => {
            const coreData = prev[index] || []
            return [...coreData, { timestamp, value: Math.min(core, 99) }].slice(-60)
          })
        })
      } catch (err) {
        console.error("Error parsing metrics data:", err)
        setError("Failed to parse metrics data")
        setConnectionStatus("disconnected")
      }
    }

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err)
      setError(`Connection error: Failed to connect to ${connectionIP}`)
      setConnectionStatus("disconnected")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [connectionIP])

  if (!mounted) return null

  const { download_speed, upload_speed, ping } = metrics.network_speed
  const pingValue = ping ?? 0

  const cpuChartData = cpuHistory.map((point, index) => ({
    timestamp: index,
    value: point.value,
    fullTime: new Date(point.timestamp).toLocaleTimeString(),
  }))

  const coresChartData = (() => {
    if (coreHistory.length === 0) return []
    // Determine the minimum length across all core history arrays
    const minLength = Math.min(...coreHistory.map((arr) => arr.length))
    return Array.from({ length: minLength }).map((_, i) => {
      const point: Record<string, number | string> = { timestamp: i }
      // Use the timestamp from the first core as the label (if available)
      point.fullTime = new Date(coreHistory[0][i].timestamp).toLocaleTimeString()
      coreHistory.forEach((coreArray, coreIndex) => {
        // Provide a default value (e.g. 0) if the value doesn't exist
        point[`core${coreIndex}`] = coreArray[i] ? coreArray[i].value : 0
      })
      return point
    })
  })()

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time performance metrics and system analysis</p>
        </div>

        <div className="flex items-center space-x-4">
          {connectionStatus === "connected" ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Connected to {connectionIP}
            </Badge>
          ) : connectionStatus === "connecting" ? (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Connecting...
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              <AlertCircle className="h-3 w-3 mr-2" />
              Disconnected
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Server className="h-4 w-4 mr-2" />
                Device
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDeviceSelector(!showDeviceSelector)}>
                <Search className="h-4 w-4 mr-2" />
                {showDeviceSelector ? "Hide Device Selector" : "Show Device Selector"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConnectionIP("127.0.0.1")}>
                <Laptop className="h-4 w-4 mr-2" />
                Local Machine
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Refresh Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">Fast (500ms)</SelectItem>
              <SelectItem value="1000">Normal (1s)</SelectItem>
              <SelectItem value="2000">Slow (2s)</SelectItem>
              <SelectItem value="5000">Very Slow (5s)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Device Selector (conditionally shown) */}
      {showDeviceSelector && (
        <DeviceSelector
          onSelect={(ip) => {
            setConnectionIP(ip)
            setShowDeviceSelector(false)
          }}
        />
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-blue-500" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold">{metrics.cpu_usage.toFixed(1)}%</span>
                <p className="text-sm text-muted-foreground">{metrics.per_core_usage.length} Cores</p>
              </div>
              <div className="h-16 w-24">
                <div className="w-full h-full flex items-end">
                  {metrics.per_core_usage.map((core, i) => (
                    <div
                      key={i}
                      className="flex-1 mx-0.5 bg-blue-500 rounded-t-sm"
                      style={{ height: `${core}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Card */}
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-500" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{metrics.memory_usage.toFixed(1)}%</span>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {metrics.top_memory_processes.length} Active Processes
                  </p>
                </div>
              </div>
              <Progress
                value={metrics.memory_usage}
                className="h-2 bg-green-500/20"
                indicatorClassName="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Disk Card */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-purple-500" />
              Disk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{metrics.disk_usage.toFixed(1)}%</span>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
              </div>
              <Progress
                value={metrics.disk_usage}
                className="h-2 bg-purple-500/20"
                indicatorClassName="bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Network Card */}
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Network className="h-5 w-5 mr-2 text-orange-500" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Download</span>
                <span className="text-sm">{download_speed} MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload</span>
                <span className="text-sm">{upload_speed} MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ping</span>
                <span className="text-sm">{pingValue.toFixed(1)} ms</span>
              </div>
              {metrics.wifi_details.SSID && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WiFi</span>
                  <span className="text-sm flex items-center">
                    <Wifi className="h-3 w-3 mr-1" />
                    {metrics.wifi_details.SSID}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

{/* CPU Usage Detail */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <Cpu className="h-5 w-5 mr-2" />
      CPU Performance
    </CardTitle>
    <CardDescription>
      Real-time CPU usage monitoring and process analysis
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="overall">
      <TabsList className="mb-4 flex flex-wrap">
        <TabsTrigger value="overall" className="flex-1 min-w-[100px]">Overall Usage</TabsTrigger>
        <TabsTrigger value="cores" className="flex-1 min-w-[100px]">Per Core</TabsTrigger>
        <TabsTrigger value="processes" className="flex-1 min-w-[100px]">Processes</TabsTrigger>
      </TabsList>

      {/* Overall Usage Tab */}
      <TabsContent value="overall">
        <div className="flex flex-col space-y-6">
          {/* Chart Section */}
          <div className="relative w-full">
            <ChartContainer>
              <LineChart
                data={cpuChartData}
                xAxisDataKey="timestamp"
                series={[
                  {
                    dataKey: "value",
                    label: "CPU Usage",
                    color: "#3b82f6",
                  },
                ]}
                yAxisWidth={40}
                showXAxis
                showYAxis
                showGrid
                showTooltip
                showLegend={false}
                xAxisFormatter={(value) => `${value}s`}
                yAxisFormatter={(value) => `${value.toFixed(0)}%`}
              />
            </ChartContainer>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Usage
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.cpu_usage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Core Count
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.per_core_usage.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Processes
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.top_cpu_processes.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Per Core Tab */}
      <TabsContent value="cores">
        <div className="relative w-full mb-6 md:mb-8 lg:mb-10">
          <ChartContainer>
            <LineChart
              data={coresChartData}
              xAxisDataKey="timestamp"
              series={coreHistory.map((_, index) => ({
                dataKey: `core${index}`,
                label: `Core ${index + 1}`,
                color: `hsl(${index * 30}, 70%, 50%)`,
                valueFormatter: (value) => `${value.toFixed(1)}%`,
              }))}
              yAxisWidth={40}
              showXAxis
              showYAxis
              showGrid
              showTooltip
              showLegend
              xAxisFormatter={(value) => `${value}s`}
              yAxisFormatter={(value) => `${value.toFixed(0)}%`}
            />
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {metrics.per_core_usage.map((usage, index) => (
            <Card key={index} className="bg-muted/40">
              <CardContent className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Core {index + 1}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {usage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress
                    value={usage}
                    className="h-1.5"
                    indicatorClassName={`bg-[hsl(${index * 30},70%,50%)]`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Processes Tab */}
      <TabsContent value="processes">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto max-h-[400px]">
            <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 bg-black [&_tr]:border-b">
      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <th className="h-10 px-2 text-left align-middle font-medium">PID</th>
        <th className="h-10 px-2 text-left align-middle font-medium">Process Name</th>
        <th className="h-10 px-2 text-left align-middle font-medium">CPU %</th>
        <th className="h-10 px-2 text-left align-middle font-medium">Memory %</th>
        <th className="h-10 px-2 text-left align-middle font-medium">Handles</th>
        <th className="h-10 px-2 text-left align-middle font-medium">Status</th>
      </tr>
    </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {(() => {
                  let processData = [];
                  if (typeof metrics.process_details === "string") {
                    try {
                      processData = JSON.parse(metrics.process_details || "[]");
                    } catch (err) {
                      console.error("Error parsing process details:", err);
                    }
                  } else if (Array.isArray(metrics.process_details)) {
                    processData = metrics.process_details;
                  }

                  return processData.length > 0 ? (
                    processData.map((proc) => (
                      <tr key={proc.Id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 align-middle">{proc.Id}</td>
                        <td className="p-2 align-middle font-medium">{proc.ProcessName}</td>
                        <td className="p-2 align-middle">
                          <div className="flex items-center">
                            <div className="w-16 bg-muted rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min(proc.CPU, 100)}%` }}
                              ></div>
                            </div>
                            <span>{proc.CPU ? proc.CPU.toFixed(1) : "0"}%</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle">
                          {(proc.WS / 1024 / 1024).toFixed(1)} MB
                        </td>
                        <td className="p-2 align-middle">{proc.Handles}</td>
                        <td className="p-2 align-middle">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Running
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        No process data available
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
      {/* Memory and Network Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Memory Usage
            </CardTitle>
            <CardDescription>Memory allocation and top memory-consuming processes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-medium">{metrics.memory_usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memory_usage} className="h-2" />
            </div>

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto max-h-[300px]">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b sticky top-0 bg-background">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-10 px-2 text-left align-middle font-medium">PID</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Process Name</th>
                      <th className="h-10 px-2 text-left align-middle font-medium">Memory %</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {metrics.top_memory_processes.length > 0 ? (
                      metrics.top_memory_processes.map((proc) => (
                        <tr key={proc.pid} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-2 align-middle">{proc.pid}</td>
                          <td className="p-2 align-middle font-medium">{proc.name}</td>
                          <td className="p-2 align-middle">
                            <div className="flex items-center">
                              <div className="w-16 bg-muted rounded-full h-2 mr-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(proc.memory_percent, 100)}%` }}
                                ></div>
                              </div>
                              <span>{proc.memory_percent.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-foreground">
                          No memory process data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Network Activity
            </CardTitle>
            <CardDescription>Network performance metrics and connection details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Download</p>
                    <p className="text-2xl font-bold">
                      {download_speed} <span className="text-sm font-normal">MB/s</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Upload</p>
                    <p className="text-2xl font-bold">
                      {upload_speed} <span className="text-sm font-normal">MB/s</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Ping</p>
                    <p className="text-2xl font-bold">
                      {pingValue.toFixed(1)} <span className="text-sm font-normal">ms</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WiFi Details */}
              <Card className="bg-muted/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Wifi className="h-4 w-4 mr-2" />
                    WiFi Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {metrics.wifi_details.SSID ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">SSID:</span>
                        <span className="text-sm font-medium">{metrics.wifi_details.SSID}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Signal Strength:</span>
                        <span className="text-sm font-medium">{metrics.wifi_details["Signal Strength"]}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">No WiFi connection detected</div>
                  )}
                </CardContent>
              </Card>

              {/* Network Processes */}
              <Card className="bg-muted/40">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Network Processes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-[100px]">
                    {metrics.top_network_processes.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.top_network_processes.map((proc, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm truncate max-w-[150px]">{proc.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {proc.connections} conn
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        No network processes detected
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disk Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Disk Usage
          </CardTitle>
          <CardDescription>Storage utilization and disk performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm font-medium">{metrics.disk_usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.disk_usage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Used Space</p>
                    <p className="text-2xl font-bold">{metrics.disk_usage.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Free Space</p>
                    <p className="text-2xl font-bold">{(100 - metrics.disk_usage).toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm font-medium">Good</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer with last updated info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground text-center sm:text-left gap-2">
        <div>
          <span>Connected to: {connectionIP}</span>
          {lastUpdated && <span> • Last updated: {lastUpdated}</span>}
        </div>
        <div>
          <span>Refresh rate: {refreshInterval}ms</span>
        </div>
      </div>
    </div>
  )
}

