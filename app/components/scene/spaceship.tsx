"use client"

import { useRef, useEffect, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useSimulationStore, SPEED_MODES, type SpeedMode } from "../../store/simulation-store"

interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  rollLeft: boolean
  rollRight: boolean
}

export function Spaceship() {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const baseFOVRef = useRef(75)
  const currentFOVRef = useRef(75)

  const {
    speedMode,
    cameraMode,
    setShipPosition,
    setShipVelocity,
    setVelocityFraction,
    setSpeedMode,
    updateTime,
    isInWormhole,
    shipPosition,
  } = useSimulationStore()

  const keysRef = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    rollLeft: false,
    rollRight: false,
  })

  const rotationRef = useRef(new THREE.Euler(0, 0, 0))
  const velocityRef = useRef(new THREE.Vector3())
  const positionRef = useRef(new THREE.Vector3(0, 5, 50))
  const targetSpeedRef = useRef(0)

  useEffect(() => {
    if (isInWormhole) return // Don't sync during teleportation
    const storePos = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
    if (positionRef.current.distanceTo(storePos) > 10) {
      // Large difference = teleportation occurred
      positionRef.current.copy(storePos)
      targetSpeedRef.current = 0
    }
  }, [shipPosition, isInWormhole])

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isInWormhole) return

      switch (e.code) {
        case "KeyW":
          keysRef.current.forward = true
          break
        case "KeyS":
          keysRef.current.backward = true
          break
        case "KeyA":
          keysRef.current.left = true
          break
        case "KeyD":
          keysRef.current.right = true
          break
        case "Space":
          keysRef.current.up = true
          break
        case "ShiftLeft":
        case "ShiftRight":
          keysRef.current.down = true
          break
        case "KeyQ":
          keysRef.current.rollLeft = true
          break
        case "KeyE":
          keysRef.current.rollRight = true
          break
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
          const mode = Number.parseInt(e.code.replace("Digit", "")) as SpeedMode
          setSpeedMode(mode)
          break
      }
    },
    [setSpeedMode, isInWormhole],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
        keysRef.current.forward = false
        break
      case "KeyS":
        keysRef.current.backward = false
        break
      case "KeyA":
        keysRef.current.left = false
        break
      case "KeyD":
        keysRef.current.right = false
        break
      case "Space":
        keysRef.current.up = false
        break
      case "ShiftLeft":
      case "ShiftRight":
        keysRef.current.down = false
        break
      case "KeyQ":
        keysRef.current.rollLeft = false
        break
      case "KeyE":
        keysRef.current.rollRight = false
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (isInWormhole) {
      // Spin effect during transit
      if (meshRef.current) {
        meshRef.current.rotation.z += delta * 10
      }
      return
    }

    const keys = keysRef.current
    const modeConfig = SPEED_MODES[speedMode]

    // Rotation (turning)
    const rotationSpeed = 1.5 * delta
    if (keys.left) rotationRef.current.y += rotationSpeed
    if (keys.right) rotationRef.current.y -= rotationSpeed
    if (keys.rollLeft) rotationRef.current.z += rotationSpeed
    if (keys.rollRight) rotationRef.current.z -= rotationSpeed

    // Calculate thrust direction based on ship orientation
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyEuler(rotationRef.current)

    const maxSpeedFraction = modeConfig.maxVelocity
    const accelerationRate = modeConfig.thrustMultiplier * 0.001

    if (keys.forward) {
      targetSpeedRef.current = Math.min(targetSpeedRef.current + accelerationRate * delta * 60, maxSpeedFraction)
    } else if (keys.backward) {
      targetSpeedRef.current = Math.max(
        targetSpeedRef.current - accelerationRate * delta * 60 * 2,
        -maxSpeedFraction * 0.5,
      )
    } else {
      targetSpeedRef.current *= 0.995
      if (Math.abs(targetSpeedRef.current) < 0.0001) targetSpeedRef.current = 0
    }

    targetSpeedRef.current = Math.max(-maxSpeedFraction * 0.5, Math.min(targetSpeedRef.current, maxSpeedFraction))

    const worldSpeedMultiplier = 1000
    const currentWorldSpeed = targetSpeedRef.current * worldSpeedMultiplier

    velocityRef.current.copy(direction).multiplyScalar(currentWorldSpeed * delta)

    const upDirection = new THREE.Vector3(0, 1, 0)
    upDirection.applyEuler(rotationRef.current)
    const verticalSpeed = maxSpeedFraction * worldSpeedMultiplier * 0.3 * delta
    if (keys.up) velocityRef.current.addScaledVector(upDirection, verticalSpeed)
    if (keys.down) velocityRef.current.addScaledVector(upDirection, -verticalSpeed)

    const velocityFraction = Math.abs(targetSpeedRef.current)
    setVelocityFraction(Math.min(velocityFraction, 0.9999))

    positionRef.current.add(velocityRef.current)

    setShipPosition(positionRef.current.clone())
    setShipVelocity(velocityRef.current.clone())

    meshRef.current.position.copy(positionRef.current)
    meshRef.current.rotation.copy(rotationRef.current)

    updateTime(delta)

    // Camera follow
    if (cameraMode === "follow") {
      const cameraOffset = new THREE.Vector3(0, 2, 8)
      cameraOffset.applyEuler(rotationRef.current)
      const targetCameraPos = positionRef.current.clone().add(cameraOffset)
      camera.position.lerp(targetCameraPos, 0.1)
      camera.lookAt(positionRef.current)

      if (camera instanceof THREE.PerspectiveCamera) {
        const maxFOVIncrease = 30
        const fovIncrease = (velocityFraction / 0.9999) * maxFOVIncrease
        const targetFOV = baseFOVRef.current + fovIncrease
        currentFOVRef.current = THREE.MathUtils.lerp(currentFOVRef.current, targetFOV, 0.05)

        if (Math.abs(camera.fov - currentFOVRef.current) > 0.01) {
          camera.fov = currentFOVRef.current
          camera.updateProjectionMatrix()
        }
      }
    }
  })

  return (
    <group ref={meshRef} position={[0, 5, 50]}>
      {/* Spaceship body */}
      <mesh>
        <coneGeometry args={[0.3, 1.2, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.1, -0.2]}>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
      </mesh>

      {/* Wings */}
      <mesh position={[0.5, -0.2, 0.2]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.5, -0.2, 0.2]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Engine glow */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <pointLight position={[0, -0.6, 0]} color="#06b6d4" intensity={1} distance={5} />
    </group>
  )
}
