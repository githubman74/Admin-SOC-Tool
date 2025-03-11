"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Network, ArrowRight, Cpu, Database, HardDrive, BarChart4, Shield, Zap } from 'lucide-react'
import { useTheme } from "next-themes"

export default function HomePage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Network Monitoring System
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Advanced tools for real-time system monitoring and network packet analysis in one comprehensive dashboard.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/system-monitoring">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    System Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/packet-analyzer">
                  <Button variant="outline" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Packet Analyzer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted md:h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/0 dark:from-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-background/90 shadow-lg">
                        <Cpu className="h-12 w-12 text-primary" />
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-background/90 shadow-lg">
                        <Database className="h-12 w-12 text-primary" />
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-background/90 shadow-lg">
                        <HardDrive className="h-12 w-12 text-primary" />
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-background/90 shadow-lg">
                        <Network className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Powerful Monitoring Tools
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our comprehensive suite provides everything you need to monitor and analyze your network infrastructure.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
            {/* System Monitoring Card */}
            <Link href="/system-monitoring" className="group">
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-primary/10">
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-background p-4 shadow-sm">
                        <Cpu className="h-8 w-8 text-primary" />
                        <div className="h-2 w-full rounded-full bg-primary/20">
                          <div className="h-full w-3/4 rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-background p-4 shadow-sm">
                        <Database className="h-8 w-8 text-primary" />
                        <div className="h-2 w-full rounded-full bg-primary/20">
                          <div className="h-full w-1/2 rounded-full bg-primary"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Monitoring Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time metrics for CPU, memory, disk usage, and network performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <span>Real-time CPU usage tracking with per-core metrics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span>Memory allocation and usage monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span>Disk space utilization and I/O performance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-primary" />
                      <span>Historical performance data visualization</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full group-hover:bg-primary/90">
                    Launch System Monitor
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>

            {/* Packet Analyzer Card */}
            <Link href="/packet-analyzer" className="group">
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-primary/10">
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Packet Capture</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs">Active</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between rounded px-2 py-1 hover:bg-muted">
                          <span>192.168.1.1</span>
                          <span>HTTP</span>
                          <span>80</span>
                        </div>
                        <div className="flex justify-between rounded bg-primary/10 px-2 py-1">
                          <span>192.168.1.2</span>
                          <span>HTTPS</span>
                          <span>443</span>
                        </div>
                        <div className="flex justify-between rounded px-2 py-1 hover:bg-muted">
                          <span>192.168.1.3</span>
                          <span>DNS</span>
                          <span>53</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Network Packet Analyzer
                  </CardTitle>
                  <CardDescription>
                    Capture, inspect, and analyze network traffic with detailed protocol information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Real-time packet capture and inspection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Protocol-based filtering and analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-primary" />
                      <span>Traffic statistics and visualization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span>Save captures in multiple formats (JSON, PCAP, PDF)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full group-hover:bg-primary/90">
                    Launch Packet Analyzer
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Start Monitoring Your Network Today
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get comprehensive insights into your system performance and network traffic with our advanced monitoring tools.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/system-monitoring">
                <Button size="lg" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
