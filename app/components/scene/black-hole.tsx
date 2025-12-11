"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { CELESTIAL_BODIES, getScaledDistance } from "../../data/celestial-bodies"
import { useSimulationStore } from "../../store/simulation-store"

function RelativisticJet({ direction }: { direction: 1 | -1 }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 200

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const spread = Math.random() * 0.5
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * spread
      positions[i * 3 + 1] = Math.random() * 30 * direction
      positions[i * 3 + 2] = Math.sin(angle) * spread
      velocities[i] = 0.5 + Math.random() * 1.5
    }

    return { positions, velocities }
  }, [direction])

  useFrame((_, delta) => {
    if (!particlesRef.current) return
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3 + 1] += velocities[i] * delta * 20 * direction

      // Reset particles that go too far
      if (Math.abs(posArray[i * 3 + 1]) > 40) {
        const spread = Math.random() * 0.5
        const angle = Math.random() * Math.PI * 2
        posArray[i * 3] = Math.cos(angle) * spread
        posArray[i * 3 + 1] = direction * 2
        posArray[i * 3 + 2] = Math.sin(angle) * spread
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#00ffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function AccretionDisk() {
  const diskRef = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    rings.current.forEach((ring, i) => {
      if (ring) {
        // Inner rings spin faster (Keplerian motion)
        ring.rotation.z = t * (0.8 - i * 0.15)
      }
    })
  })

  const ringConfigs = [
    { inner: 2.5, outer: 4, color: "#ffffff", opacity: 1 },
    { inner: 4, outer: 6, color: "#ffcc00", opacity: 0.9 },
    { inner: 6, outer: 8, color: "#ff6600", opacity: 0.8 },
    { inner: 8, outer: 11, color: "#ff3300", opacity: 0.6 },
    { inner: 11, outer: 15, color: "#cc0000", opacity: 0.4 },
    { inner: 15, outer: 20, color: "#330066", opacity: 0.2 },
  ]

  return (
    <group ref={diskRef} rotation={[Math.PI / 2.5, 0.2, 0]}>
      {ringConfigs.map((config, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) rings.current[i] = el
          }}
        >
          <ringGeometry args={[config.inner, config.outer, 128]} />
          <meshBasicMaterial
            color={config.color}
            transparent
            opacity={config.opacity}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function GravitationalLensing() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group>
      {/* Photon sphere - light orbiting the black hole */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.1, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>

      {/* Einstein ring effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function WormholeEffect({ active }: { active: boolean }) {
  const tunnelRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (tunnelRef.current && active) {
      tunnelRef.current.rotation.z = clock.getElapsedTime() * 3
      const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2
      tunnelRef.current.scale.setScalar(scale)
    }
  })

  if (!active) return null

  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} ref={i === 0 ? tunnelRef : undefined} position={[0, 0, -i * 2]}>
          <torusGeometry args={[1.5 + i * 0.3, 0.1, 16, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#00ffff" : "#ff00ff"}
            transparent
            opacity={0.8 - i * 0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export function BlackHole() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const { setSelectedBody, shipPosition, triggerWormhole, isInWormhole, completeWormhole } = useSimulationStore()

  const blackHoleData = CELESTIAL_BODIES.find((b) => b.id === "blackhole")!
  const initialAngle = blackHoleData.initialAngle || 0
  const distance = getScaledDistance(blackHoleData.distanceFromSun)
  const positionArray: [number, number, number] = [
    Math.cos(initialAngle) * distance,
    0,
    Math.sin(initialAngle) * distance,
  ]

  const eventHorizonRadius = 3

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.15 + 0.85
      glowRef.current.scale.setScalar(pulse)
    }

    if (groupRef.current && !isInWormhole) {
      const bhPos = new THREE.Vector3(...positionArray)
      const shipPos = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
      const distanceToShip = bhPos.distanceTo(shipPos)

      if (distanceToShip < eventHorizonRadius) {
        triggerWormhole()
        // Teleport after a brief delay
        setTimeout(() => {
          completeWormhole()
        }, 1500)
      }
    }
  })

  return (
    <group ref={groupRef} position={positionArray}>
      {/* Event horizon - absolute black sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedBody(blackHoleData)
        }}
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Accretion disk */}
      <AccretionDisk />

      {/* Gravitational lensing */}
      <GravitationalLensing />

      {/* Relativistic jets */}
      <RelativisticJet direction={1} />
      <RelativisticJet direction={-1} />

      {/* Inner glow - Hawking radiation visualization */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Outer dark sphere for depth */}
      <mesh>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#050510" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Wormhole effect when entering */}
      <WormholeEffect active={isInWormhole} />

      {/* Lighting */}
      <pointLight color="#ff6600" intensity={3} distance={60} decay={2} />
      <pointLight color="#00ffff" intensity={2} distance={40} decay={2} position={[0, 10, 0]} />
      <pointLight color="#00ffff" intensity={2} distance={40} decay={2} position={[0, -10, 0]} />
    </group>
  )
}
