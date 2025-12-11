"use client"

import { useSimulationStore, SPEED_MODES } from "../../store/simulation-store"
import { formatTime, formatVelocity, calculateLorentzFactor } from "../../physics/relativity"
import { useEffect, useState } from "react"

export function HUD() {
  const {
    speedMode,
    velocityFraction,
    earthTime,
    shipTime,
    shipPosition,
    cameraMode,
    isPaused,
    setSpeedMode,
    setCameraMode,
    togglePause,
    reset,
    isInWormhole,
  } = useSimulationStore()

  const [fps, setFps] = useState(60)

  // FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const countFPS = () => {
      frameCount++
      const currentTime = performance.now()
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = currentTime
      }
      requestAnimationFrame(countFPS)
    }

    const animationId = requestAnimationFrame(countFPS)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const modeConfig = SPEED_MODES[speedMode]
  const lorentzFactor = calculateLorentzFactor(velocityFraction)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {isInWormhole && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 animate-pulse">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-cyan-400 animate-pulse">WORMHOLE TRANSIT</div>
            <div className="text-lg text-purple-400">Spacetime coordinates destabilizing...</div>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top left - Speed and velocity */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg p-4 space-y-3 min-w-[280px]">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Speed Mode</span>
            <span className="text-primary font-mono font-bold">{modeConfig.name}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Velocity</span>
              <span className="font-mono text-cyan-400">{formatVelocity(velocityFraction)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Lorentz Factor</span>
              <span className="font-mono text-amber-400">{lorentzFactor.toFixed(6)}</span>
            </div>

            {/* Velocity bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-primary transition-all duration-200"
                style={{ width: `${Math.min(velocityFraction * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Speed mode selector */}
          <div className="grid grid-cols-6 gap-1 pt-2">
            {([1, 2, 3, 4, 5, 6] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSpeedMode(mode)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  speedMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top right - Time */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg p-4 space-y-3 min-w-[200px]">
          <div className="text-xs text-muted-foreground uppercase tracking-wider border-b border-primary/20 pb-2">
            Time Dilation
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Earth Time
              </span>
              <span className="font-mono text-blue-400">{formatTime(earthTime)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Ship Time
              </span>
              <span className="font-mono text-green-400">{formatTime(shipTime)}</span>
            </div>

            {velocityFraction > 0.01 && (
              <div className="text-xs text-amber-400 mt-2 p-2 bg-amber-500/10 rounded">
                Time slowed by {((1 - 1 / lorentzFactor) * 100).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left - Coordinates */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg p-4 min-w-[200px]">
          <div className="text-xs text-muted-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-2">
            Coordinates
          </div>

          <div className="font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-red-400">X:</span>
              <span>{shipPosition.x.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Y:</span>
              <span>{shipPosition.y.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Z:</span>
              <span>{shipPosition.z.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom right - Controls */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCameraMode(cameraMode === "follow" ? "free" : "follow")}
              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              {cameraMode === "follow" ? "Free Camera" : "Follow Camera"}
            </button>
            <button
              onClick={togglePause}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                isPaused ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs bg-red-600/80 hover:bg-red-600 rounded transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            <span>FPS: </span>
            <span
              className={`font-mono ${fps >= 50 ? "text-green-400" : fps >= 30 ? "text-amber-400" : "text-red-400"}`}
            >
              {fps}
            </span>
          </div>
        </div>
      </div>

      {/* Center - Controls help */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-background/60 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2 text-xs text-muted-foreground">
          <span className="font-mono">W/S</span> Forward/Back • <span className="font-mono">A/D</span> Turn •{" "}
          <span className="font-mono">Space/Shift</span> Up/Down • <span className="font-mono">Q/E</span> Roll •{" "}
          <span className="font-mono">1-6</span> Speed Mode
        </div>
      </div>
    </div>
  )
}
