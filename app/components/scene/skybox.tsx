"use client"

import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import * as THREE from "three"

export function Skybox() {
  const { scene } = useThree()

  useEffect(() => {
    // Create starfield texture
    const canvas = document.createElement("canvas")
    canvas.width = 2048
    canvas.height = 2048
    const ctx = canvas.getContext("2d")!

    // Dark space background
    ctx.fillStyle = "#050510"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add stars
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 1.5
      const brightness = Math.random()

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
      ctx.fill()
    }

    // Add some colored stars
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 2
      const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#a29bfe"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }

    // Add nebula effect
    const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024)
    gradient.addColorStop(0, "rgba(100, 50, 150, 0.1)")
    gradient.addColorStop(0.5, "rgba(50, 100, 150, 0.05)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.mapping = THREE.EquirectangularReflectionMapping

    scene.background = texture

    return () => {
      texture.dispose()
    }
  }, [scene])

  return null
}
