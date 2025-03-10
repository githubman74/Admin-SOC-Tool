"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Home, Activity } from "lucide-react"
import { useTheme } from "next-themes"

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Don't show navigation on homepage
  if (pathname === "/") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5" />
            <span>Network Monitor</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/system-monitoring"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/system-monitoring" ? "text-foreground" : "text-muted-foreground"}`}
            >
              System Monitoring
            </Link>
            <Link
              href="/packet-analyzer"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/packet-analyzer" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Packet Analyzer
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Link href="/" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

