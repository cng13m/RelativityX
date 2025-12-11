"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useSimulationStore } from "../../store/simulation-store"

export function InfoPanel() {
  const { selectedBody, setSelectedBody } = useSimulationStore()

  return (
    <AnimatePresence>
      {selectedBody && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-4 right-[240px] w-[320px] pointer-events-auto"
        >
          <div className="bg-background/90 backdrop-blur-md border border-primary/30 rounded-lg overflow-hidden">
            {/* Header */}
            <div
              className="p-4 border-b border-primary/20"
              style={{
                background: `linear-gradient(135deg, ${selectedBody.color}20, transparent)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-primary/30"
                    style={{ backgroundColor: selectedBody.color }}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{selectedBody.name}</h3>
                    <span className="text-xs text-muted-foreground capitalize">{selectedBody.type}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedBody(null)} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Radius</div>
                  <div className="font-mono text-sm">{selectedBody.radius.toLocaleString()} km</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Temperature</div>
                  <div className="font-mono text-sm">
                    {selectedBody.temperature > 0 ? `${selectedBody.temperature} K` : "N/A"}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Distance from Sun</div>
                  <div className="font-mono text-sm">
                    {selectedBody.distanceFromSun > 0 ? `${selectedBody.distanceFromSun} M km` : "Center"}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Orbital Period</div>
                  <div className="font-mono text-sm">
                    {selectedBody.orbitalPeriod > 0 ? `${selectedBody.orbitalPeriod} days` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-primary/10">
                <div className="text-xs text-muted-foreground mb-2">Description</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{selectedBody.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
