"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Suspense } from "react"
import { SolarSystem } from "./solar-system"
import { BlackHole } from "./black-hole"
import { Spaceship } from "./spaceship"
import { Skybox } from "./skybox"
import { useSimulationStore } from "../../store/simulation-store"

function SceneContent() {
  const cameraMode = useSimulationStore((state) => state.cameraMode)

  return (
    <>
      <Skybox />
      <Stars radius={300} depth={100} count={10000} factor={6} saturation={0} fade speed={0.5} />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} />

      {/* Scene objects */}
      <SolarSystem />
      <BlackHole />
      <Spaceship />

      {/* Controls only in free camera mode */}
      {cameraMode === "free" && <OrbitControls enableDamping dampingFactor={0.05} maxDistance={500} />}
    </>
  )
}

export function MainScene() {
  return (
    <Canvas camera={{ position: [0, 10, 60], fov: 75, near: 0.1, far: 10000 }} className="w-full h-full">
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}
