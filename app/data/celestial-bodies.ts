import type { CelestialBody } from "../store/simulation-store"

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: "sun",
    name: "Sun",
    radius: 696340,
    distanceFromSun: 0,
    orbitalPeriod: 0,
    temperature: 5778,
    description:
      "The Sun is the star at the center of our Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
    color: "#FDB813",
    type: "star",
    initialAngle: 0,
  },
  {
    id: "mercury",
    name: "Mercury",
    radius: 2439.7,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    temperature: 440,
    description:
      "Mercury is the smallest planet in our Solar System and the closest to the Sun. It has no atmosphere to retain heat, resulting in extreme temperature variations.",
    color: "#B5B5B5",
    type: "planet",
    initialAngle: 0.8,
  },
  {
    id: "venus",
    name: "Venus",
    radius: 6051.8,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    temperature: 737,
    description:
      "Venus is the second planet from the Sun and is Earth's closest planetary neighbor. It has a thick, toxic atmosphere filled with carbon dioxide and clouds of sulfuric acid.",
    color: "#E6C229",
    type: "planet",
    initialAngle: 2.4,
  },
  {
    id: "earth",
    name: "Earth",
    radius: 6371,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    temperature: 288,
    description:
      "Earth is our home planet and the only place we know of so far that's inhabited by living things. It's the third planet from the Sun and the fifth largest planet.",
    color: "#6B93D6",
    type: "planet",
    initialAngle: 0,
  },
  {
    id: "moon",
    name: "Moon",
    radius: 1737.4,
    distanceFromSun: 149.6,
    orbitalPeriod: 27.3,
    temperature: 250,
    description:
      "The Moon is Earth's only natural satellite. It is the fifth largest satellite in the Solar System and the largest and most massive relative to its parent planet.",
    color: "#C4C4C4",
    type: "moon",
    parentId: "earth",
    initialAngle: 1.2,
  },
  {
    id: "mars",
    name: "Mars",
    radius: 3389.5,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    temperature: 210,
    description:
      "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. It's often called the 'Red Planet' because of its reddish appearance.",
    color: "#C1440E",
    type: "planet",
    initialAngle: 3.8,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    radius: 69911,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    temperature: 165,
    description:
      "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all other planets combined.",
    color: "#D8CA9D",
    type: "planet",
    initialAngle: 4.5,
  },
  {
    id: "saturn",
    name: "Saturn",
    radius: 58232,
    distanceFromSun: 1432,
    orbitalPeriod: 10759,
    temperature: 134,
    description:
      "Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is known for its prominent ring system made of ice and rock particles.",
    color: "#F4D59E",
    type: "planet",
    initialAngle: 5.2,
  },
  {
    id: "uranus",
    name: "Uranus",
    radius: 25362,
    distanceFromSun: 2867,
    orbitalPeriod: 30687,
    temperature: 76,
    description:
      "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System.",
    color: "#D1E7E7",
    type: "planet",
    initialAngle: 1.8,
  },
  {
    id: "neptune",
    name: "Neptune",
    radius: 24622,
    distanceFromSun: 4515,
    orbitalPeriod: 60190,
    temperature: 72,
    description:
      "Neptune is the eighth and farthest known Solar planet from the Sun. It is the fourth-largest planet by diameter and the third-most-massive planet.",
    color: "#5B5DDF",
    type: "planet",
    initialAngle: 5.9,
  },
  {
    id: "blackhole",
    name: "Cygnus X-1",
    radius: 22000000,
    distanceFromSun: 100000,
    orbitalPeriod: 0,
    temperature: 0,
    description:
      "A stellar-mass black hole that acts as a wormhole in this simulation. Enter its event horizon to be transported back to the inner solar system. Travel at light speed to reach it!",
    color: "#000000",
    type: "blackhole",
    initialAngle: Math.PI,
  },
]

export function getScaledDistance(distanceFromSun: number): number {
  if (distanceFromSun === 0) return 0
  // Base offset ensures minimum distance from sun
  const baseOffset = 8
  // Logarithmic scaling spreads out inner planets while keeping outer planets reasonable
  return baseOffset + Math.log10(distanceFromSun) * 15
}

export function getScaledRadius(radius: number, type: string): number {
  if (type === "star") {
    return 3 // Fixed sun size that doesn't swallow planets
  }
  if (type === "moon") {
    return 0.15
  }
  // Logarithmic scaling for planet sizes with a minimum
  return Math.max(0.2, Math.log10(radius) * 0.4)
}

export const SCALE_FACTOR = 0.015
export const SIZE_SCALE = 0.0001
