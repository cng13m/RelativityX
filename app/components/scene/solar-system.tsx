"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Line } from "@react-three/drei"
import { CELESTIAL_BODIES, getScaledDistance, getScaledRadius } from "../../data/celestial-bodies"
import { useSimulationStore } from "../../store/simulation-store"
import type { CelestialBody } from "../../store/simulation-store"

interface PlanetProps {
  body: CelestialBody
  onClick: (body: CelestialBody) => void
}

function Planet({ body, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  const scaledRadius = getScaledRadius(body.radius, body.type)
  const scaledDistance = getScaledDistance(body.distanceFromSun)
  const initialAngle = body.initialAngle || 0

  const orbitPoints = useMemo(() => {
    if (body.distanceFromSun === 0) return null
    const points: [number, number, number][] = []
    const segments = 256
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push([Math.cos(angle) * scaledDistance, 0, Math.sin(angle) * scaledDistance])
    }
    return points
  }, [scaledDistance, body.distanceFromSun])

  useFrame(({ clock }) => {
    if (!meshRef.current || body.orbitalPeriod === 0) return

    const speed = (2 * Math.PI) / (body.orbitalPeriod * 10)
    const angle = initialAngle + clock.getElapsedTime() * speed

    if (body.type === "moon" && body.parentId) {
      const parent = CELESTIAL_BODIES.find((b) => b.id === body.parentId)
      if (parent) {
        const parentDistance = getScaledDistance(parent.distanceFromSun)
        const parentInitialAngle = parent.initialAngle || 0
        const parentSpeed = (2 * Math.PI) / (parent.orbitalPeriod * 10)
        const parentAngle = parentInitialAngle + clock.getElapsedTime() * parentSpeed

        const parentX = Math.cos(parentAngle) * parentDistance
        const parentZ = Math.sin(parentAngle) * parentDistance

        const moonOrbitRadius = 1.2
        meshRef.current.position.x = parentX + Math.cos(angle * 10) * moonOrbitRadius
        meshRef.current.position.z = parentZ + Math.sin(angle * 10) * moonOrbitRadius
      }
    } else if (body.distanceFromSun > 0) {
      meshRef.current.position.x = Math.cos(angle) * scaledDistance
      meshRef.current.position.z = Math.sin(angle) * scaledDistance

      // Update rings position for Saturn
      if (ringsRef.current) {
        ringsRef.current.position.x = meshRef.current.position.x
        ringsRef.current.position.z = meshRef.current.position.z
      }
      // Update atmosphere position
      if (atmosphereRef.current) {
        atmosphereRef.current.position.x = meshRef.current.position.x
        atmosphereRef.current.position.z = meshRef.current.position.z
      }
      // Update clouds position
      if (cloudsRef.current) {
        cloudsRef.current.position.x = meshRef.current.position.x
        cloudsRef.current.position.z = meshRef.current.position.z
        cloudsRef.current.rotation.y += 0.001
      }
    }

    // Planet rotation
    meshRef.current.rotation.y += 0.002
  })

  const initialX = body.distanceFromSun > 0 ? Math.cos(initialAngle) * scaledDistance : 0
  const initialZ = body.distanceFromSun > 0 ? Math.sin(initialAngle) * scaledDistance : 0

  const getPlanetMaterial = () => {
    switch (body.id) {
      case "earth":
        return <meshStandardMaterial color="#4A90D9" roughness={0.7} metalness={0.1} />
      case "mars":
        return <meshStandardMaterial color="#CD5C5C" roughness={0.9} metalness={0.1} />
      case "venus":
        return <meshStandardMaterial color="#DEB887" roughness={0.6} metalness={0.1} />
      case "jupiter":
        return <meshStandardMaterial color="#D4A574" roughness={0.8} metalness={0.05} />
      case "saturn":
        return <meshStandardMaterial color="#F4D59E" roughness={0.8} metalness={0.05} />
      case "uranus":
        return <meshStandardMaterial color="#AFDBF5" roughness={0.7} metalness={0.1} />
      case "neptune":
        return <meshStandardMaterial color="#5B5DDF" roughness={0.7} metalness={0.1} />
      case "mercury":
        return <meshStandardMaterial color="#8B8B8B" roughness={0.95} metalness={0.2} />
      case "moon":
        return <meshStandardMaterial color="#B8B8B8" roughness={0.95} metalness={0.1} />
      default:
        return <meshStandardMaterial color={body.color} roughness={0.8} metalness={0.2} />
    }
  }

  const hasAtmosphere = ["earth", "venus", "mars", "jupiter", "saturn", "uranus", "neptune"].includes(body.id)
  const atmosphereColor =
    {
      earth: "#87CEEB",
      venus: "#FFD700",
      mars: "#FFB6C1",
      jupiter: "#DEB887",
      saturn: "#F5DEB3",
      uranus: "#E0FFFF",
      neptune: "#4169E1",
    }[body.id] || "#FFFFFF"

  return (
    <group>
      {/* Orbit line */}
      {orbitPoints && body.type !== "moon" && (
        <Line points={orbitPoints} color="#4A5568" lineWidth={1} transparent opacity={0.4} />
      )}

      {/* Planet/Star mesh */}
      <mesh
        ref={meshRef}
        position={[initialX, 0, initialZ]}
        onClick={(e) => {
          e.stopPropagation()
          onClick(body)
        }}
      >
        <sphereGeometry args={[scaledRadius, 64, 64]} />
        {body.type === "star" ? <meshBasicMaterial color="#FDB813" /> : getPlanetMaterial()}
      </mesh>

      {body.type === "star" && (
        <>
          <pointLight position={[0, 0, 0]} color="#FFF5E0" intensity={3} distance={200} decay={1} />
          {/* Inner corona */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[scaledRadius * 1.1, 32, 32]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
          </mesh>
          {/* Outer corona */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[scaledRadius * 1.3, 32, 32]} />
            <meshBasicMaterial color="#FFA500" transparent opacity={0.15} />
          </mesh>
          {/* Solar flare glow */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[scaledRadius * 1.6, 32, 32]} />
            <meshBasicMaterial color="#FF6B00" transparent opacity={0.05} />
          </mesh>
        </>
      )}

      {hasAtmosphere && body.type === "planet" && (
        <mesh ref={atmosphereRef} position={[initialX, 0, initialZ]}>
          <sphereGeometry args={[scaledRadius * 1.08, 32, 32]} />
          <meshBasicMaterial color={atmosphereColor} transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
      )}

      {body.id === "earth" && (
        <mesh ref={cloudsRef} position={[initialX, 0, initialZ]}>
          <sphereGeometry args={[scaledRadius * 1.02, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.35} roughness={1} />
        </mesh>
      )}

      {body.id === "saturn" && (
        <group ref={ringsRef} position={[initialX, 0, initialZ]} rotation={[Math.PI / 2.5, 0, 0]}>
          {/* Inner ring - darker */}
          <mesh>
            <ringGeometry args={[scaledRadius * 1.3, scaledRadius * 1.6, 128]} />
            <meshStandardMaterial color="#A0896C" side={THREE.DoubleSide} opacity={0.7} transparent />
          </mesh>
          {/* Middle ring - brightest */}
          <mesh>
            <ringGeometry args={[scaledRadius * 1.6, scaledRadius * 2.0, 128]} />
            <meshStandardMaterial color="#D4C4A8" side={THREE.DoubleSide} opacity={0.85} transparent />
          </mesh>
          {/* Outer ring - faint */}
          <mesh>
            <ringGeometry args={[scaledRadius * 2.0, scaledRadius * 2.4, 128]} />
            <meshStandardMaterial color="#C9B896" side={THREE.DoubleSide} opacity={0.4} transparent />
          </mesh>
          {/* Cassini Division gap indicator */}
          <mesh>
            <ringGeometry args={[scaledRadius * 1.58, scaledRadius * 1.62, 128]} />
            <meshBasicMaterial color="#000000" side={THREE.DoubleSide} opacity={0.3} transparent />
          </mesh>
        </group>
      )}

      {body.id === "uranus" && (
        <mesh position={[initialX, 0, initialZ]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <ringGeometry args={[scaledRadius * 1.5, scaledRadius * 2.0, 64]} />
          <meshStandardMaterial color="#708090" side={THREE.DoubleSide} opacity={0.25} transparent />
        </mesh>
      )}

      {body.id === "jupiter" && (
        <mesh position={[initialX, 0, initialZ]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scaledRadius * 1.3, scaledRadius * 1.5, 64]} />
          <meshStandardMaterial color="#8B7355" side={THREE.DoubleSide} opacity={0.15} transparent />
        </mesh>
      )}
    </group>
  )
}

function AsteroidBelt() {
  const asteroidsRef = useRef<THREE.InstancedMesh>(null)
  const asteroidCount = 800

  const { positions, scales } = useMemo(() => {
    const positions: THREE.Matrix4[] = []
    const scales: number[] = []

    // Asteroid belt between Mars and Jupiter
    const innerRadius = getScaledDistance(300) // Between Mars (227) and Jupiter (778)
    const outerRadius = getScaledDistance(500)

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const height = (Math.random() - 0.5) * 2

      const matrix = new THREE.Matrix4()
      matrix.setPosition(Math.cos(angle) * radius, height, Math.sin(angle) * radius)

      const scale = 0.02 + Math.random() * 0.06
      matrix.scale(new THREE.Vector3(scale, scale, scale))

      positions.push(matrix)
      scales.push(scale)
    }

    return { positions, scales }
  }, [])

  // Set initial matrices
  useMemo(() => {
    if (!asteroidsRef.current) return
    positions.forEach((matrix, i) => {
      asteroidsRef.current!.setMatrixAt(i, matrix)
    })
    asteroidsRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame(({ clock }) => {
    if (!asteroidsRef.current) return

    const time = clock.getElapsedTime() * 0.02

    for (let i = 0; i < asteroidCount; i++) {
      const matrix = new THREE.Matrix4()
      positions[i].decompose(new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3())

      const originalPos = new THREE.Vector3()
      positions[i].decompose(originalPos, new THREE.Quaternion(), new THREE.Vector3())

      const angle = Math.atan2(originalPos.z, originalPos.x) + time
      const radius = Math.sqrt(originalPos.x ** 2 + originalPos.z ** 2)

      matrix.setPosition(Math.cos(angle) * radius, originalPos.y, Math.sin(angle) * radius)
      matrix.scale(new THREE.Vector3(scales[i], scales[i], scales[i]))

      asteroidsRef.current.setMatrixAt(i, matrix)
    }
    asteroidsRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={asteroidsRef} args={[undefined, undefined, asteroidCount]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#6B6B6B" roughness={0.9} metalness={0.3} />
    </instancedMesh>
  )
}

function KuiperBelt() {
  const asteroidsRef = useRef<THREE.InstancedMesh>(null)
  const asteroidCount = 500

  const { positions, scales } = useMemo(() => {
    const positions: THREE.Matrix4[] = []
    const scales: number[] = []

    // Kuiper belt beyond Neptune
    const innerRadius = getScaledDistance(4600)
    const outerRadius = getScaledDistance(8000)

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const height = (Math.random() - 0.5) * 4

      const matrix = new THREE.Matrix4()
      matrix.setPosition(Math.cos(angle) * radius, height, Math.sin(angle) * radius)

      const scale = 0.03 + Math.random() * 0.08
      matrix.scale(new THREE.Vector3(scale, scale, scale))

      positions.push(matrix)
      scales.push(scale)
    }

    return { positions, scales }
  }, [])

  useMemo(() => {
    if (!asteroidsRef.current) return
    positions.forEach((matrix, i) => {
      asteroidsRef.current!.setMatrixAt(i, matrix)
    })
    asteroidsRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame(({ clock }) => {
    if (!asteroidsRef.current) return

    const time = clock.getElapsedTime() * 0.005 // Slower orbit

    for (let i = 0; i < asteroidCount; i++) {
      const originalPos = new THREE.Vector3()
      positions[i].decompose(originalPos, new THREE.Quaternion(), new THREE.Vector3())

      const angle = Math.atan2(originalPos.z, originalPos.x) + time
      const radius = Math.sqrt(originalPos.x ** 2 + originalPos.z ** 2)

      const matrix = new THREE.Matrix4()
      matrix.setPosition(Math.cos(angle) * radius, originalPos.y, Math.sin(angle) * radius)
      matrix.scale(new THREE.Vector3(scales[i], scales[i], scales[i]))

      asteroidsRef.current.setMatrixAt(i, matrix)
    }
    asteroidsRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={asteroidsRef} args={[undefined, undefined, asteroidCount]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4A4A5A" roughness={0.95} metalness={0.1} />
    </instancedMesh>
  )
}

export function SolarSystem() {
  const setSelectedBody = useSimulationStore((state) => state.setSelectedBody)

  const planetsAndSun = CELESTIAL_BODIES.filter((b) => b.type !== "blackhole")

  return (
    <group>
      {/* Ambient light for overall visibility */}
      <ambientLight intensity={0.1} />

      {planetsAndSun.map((body) => (
        <Planet key={body.id} body={body} onClick={setSelectedBody} />
      ))}

      <AsteroidBelt />
      <KuiperBelt />
    </group>
  )
}
