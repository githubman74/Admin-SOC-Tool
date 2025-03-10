"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function HomePage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome to the Network Monitor</h1>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="container py-12 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full p-4">
          <CardHeader className="mb-4 text-center">
            <CardTitle className="text-3xl font-bold">Dashboard Home</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/system-monitoring">
              <Button className="w-full">System Monitoring</Button>
            </Link>
            <Link href="/packet-analyzer">
              <Button className="w-full">Packet Analyzer</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
