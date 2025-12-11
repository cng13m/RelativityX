// Einstein's Special Relativity calculations

export const SPEED_OF_LIGHT = 299792458 // m/s

/**
 * Calculate the Lorentz factor (gamma)
 * γ = 1 / sqrt(1 - v²/c²)
 */
export function calculateLorentzFactor(velocityFraction: number): number {
  if (velocityFraction >= 1) return Number.POSITIVE_INFINITY
  return 1 / Math.sqrt(1 - velocityFraction * velocityFraction)
}

/**
 * Calculate time dilation
 * t_ship = t_earth * sqrt(1 - v²/c²)
 * or t_ship = t_earth / γ
 */
export function calculateTimeDilation(earthTime: number, velocityFraction: number): number {
  const gamma = calculateLorentzFactor(velocityFraction)
  return earthTime / gamma
}

/**
 * Calculate relativistic mass increase
 * m_rel = m_rest * γ
 */
export function calculateRelativisticMass(restMass: number, velocityFraction: number): number {
  const gamma = calculateLorentzFactor(velocityFraction)
  return restMass * gamma
}

/**
 * Calculate length contraction
 * L = L_0 / γ
 */
export function calculateLengthContraction(properLength: number, velocityFraction: number): number {
  const gamma = calculateLorentzFactor(velocityFraction)
  return properLength / gamma
}

/**
 * Format time as HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format velocity as percentage of c
 */
export function formatVelocity(velocityFraction: number): string {
  return `${(velocityFraction * 100).toFixed(4)}% c`
}
