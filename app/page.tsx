"use client"

import dynamic from "next/dynamic"
import { HUD } from "./components/ui/hud"
import { InfoPanel } from "./components/ui/info-panel"

// Dynamic import for the 3D scene to avoid SSR issues
const MainScene = dynamic(() => import("./components/scene/main-scene").then((mod) => mod.MainScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading RelativityX...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-background">
      <MainScene />
      <HUD />
      <InfoPanel />
    </main>
  )
}
