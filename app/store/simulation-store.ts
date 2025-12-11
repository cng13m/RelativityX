import { create } from "zustand"
import type * as THREE from "three"

export type SpeedMode = 1 | 2 | 3 | 4 | 5 | 6

export interface SpeedModeConfig {
  name: string
  maxVelocity: number // as fraction of c
  thrustMultiplier: number
  accelerationCurve: number
}

export const SPEED_MODES: Record<SpeedMode, SpeedModeConfig> = {
  1: { name: "Subsonic", maxVelocity: 0.001, thrustMultiplier: 1, accelerationCurve: 1 },
  2: { name: "High Velocity", maxVelocity: 0.01, thrustMultiplier: 2, accelerationCurve: 1.2 },
  3: { name: "Orbital Escape", maxVelocity: 0.05, thrustMultiplier: 5, accelerationCurve: 1.5 },
  4: { name: "Relativistic", maxVelocity: 0.2, thrustMultiplier: 15, accelerationCurve: 2 },
  5: { name: "Ultra-Relativistic", maxVelocity: 0.5, thrustMultiplier: 30, accelerationCurve: 2.5 },
  6: { name: "Light Speed", maxVelocity: 0.9999, thrustMultiplier: 50, accelerationCurve: 3 },
}

export const SPEED_OF_LIGHT = 299792458 // m/s

export interface CelestialBody {
  id: string
  name: string
  radius: number // km
  distanceFromSun: number // million km
  orbitalPeriod: number // Earth days
  temperature: number // Kelvin
  description: string
  color: string
  textureUrl?: string
  type: "star" | "planet" | "moon" | "blackhole"
  parentId?: string
  initialAngle?: number // Added initial orbital angle
}

export interface SimulationState {
  // Ship state
  shipPosition: { x: number; y: number; z: number }
  shipVelocity: { x: number; y: number; z: number }
  speedMode: SpeedMode
  velocityFraction: number

  // Time
  earthTime: number
  shipTime: number
  isPaused: boolean

  // Camera
  cameraMode: "free" | "follow"

  // Selection
  selectedBody: CelestialBody | null

  isInWormhole: boolean
  wormholeExitPosition: { x: number; y: number; z: number } | null

  // Actions
  setShipPosition: (pos: THREE.Vector3) => void
  setShipVelocity: (vel: THREE.Vector3) => void
  setSpeedMode: (mode: SpeedMode) => void
  setVelocityFraction: (fraction: number) => void
  updateTime: (deltaEarth: number) => void
  togglePause: () => void
  setCameraMode: (mode: "free" | "follow") => void
  setSelectedBody: (body: CelestialBody | null) => void
  triggerWormhole: () => void
  completeWormhole: () => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  shipPosition: { x: 0, y: 5, z: 50 },
  shipVelocity: { x: 0, y: 0, z: 0 },
  speedMode: 1,
  velocityFraction: 0,

  earthTime: 0,
  shipTime: 0,
  isPaused: false,

  cameraMode: "follow",

  selectedBody: null,

  isInWormhole: false,
  wormholeExitPosition: null,

  setShipPosition: (pos) => set({ shipPosition: { x: pos.x, y: pos.y, z: pos.z } }),
  setShipVelocity: (vel) => set({ shipVelocity: { x: vel.x, y: vel.y, z: vel.z } }),
  setSpeedMode: (mode) => set({ speedMode: mode }),
  setVelocityFraction: (fraction) => set({ velocityFraction: Math.min(fraction, 0.9999) }),

  updateTime: (deltaEarth) => {
    const { velocityFraction, earthTime, shipTime, isPaused } = get()
    if (isPaused) return

    const lorentzFactor = Math.sqrt(1 - velocityFraction * velocityFraction)
    const deltaShip = deltaEarth * lorentzFactor

    set({
      earthTime: earthTime + deltaEarth,
      shipTime: shipTime + deltaShip,
    })
  },

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSelectedBody: (body) => set({ selectedBody: body }),

  triggerWormhole: () => {
    const angle = Math.random() * Math.PI * 2
    // Distance of about 20-40 units puts you near Earth/Mars area
    const distance = 20 + Math.random() * 20
    const height = (Math.random() - 0.5) * 10
    set({
      isInWormhole: true,
      wormholeExitPosition: {
        x: Math.cos(angle) * distance,
        y: height,
        z: Math.sin(angle) * distance,
      },
    })
  },

  completeWormhole: () => {
    const { wormholeExitPosition } = get()
    if (wormholeExitPosition) {
      set({
        shipPosition: wormholeExitPosition,
        isInWormhole: false,
        wormholeExitPosition: null,
        velocityFraction: 0,
      })
    }
  },

  reset: () =>
    set({
      shipPosition: { x: 0, y: 5, z: 50 },
      shipVelocity: { x: 0, y: 0, z: 0 },
      speedMode: 1,
      velocityFraction: 0,
      earthTime: 0,
      shipTime: 0,
      isPaused: false,
      selectedBody: null,
      isInWormhole: false,
      wormholeExitPosition: null,
    }),
}))
