"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Activity, Shield, Cpu, Network } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide navigation on the homepage
  if (pathname === "/") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5" />
            <span>Network Security Suite</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/system-monitoring"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/system-monitoring" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                System Monitoring
              </span>
            </Link>
            <Link
              href="/packet-analyzer"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/packet-analyzer" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <Network className="h-4 w-4" />
                Packet Analyzer
              </span>
            </Link>
            <Link
              href="/cyberscan"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/cyberscan" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                CyberScan
              </span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5 transition-all" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 transition-all" aria-hidden="true" />
              )
            ) : (
              <div className="h-5 w-5" /> // Placeholder to prevent hydration issues
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
