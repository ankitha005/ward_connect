import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import useComplaintsStore from '../store/complaintsStore'

export default function EmergencyTicker() {
  const [dismissed, setDismissed] = useState(false)
  const liveAlerts = useComplaintsStore(s => s.liveAlerts)

  const activeAlerts = liveAlerts.filter(a => a.active)

  if (dismissed || activeAlerts.length === 0) return null

  const repeated = [...activeAlerts, ...activeAlerts, ...activeAlerts]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white z-[60] overflow-hidden select-none"
      >
        <div className="flex items-center h-10">
          {/* Label pill */}
          <div className="shrink-0 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border-r border-white/20 px-4 h-full font-extrabold text-xs uppercase tracking-widest z-10">
            <AlertTriangle size={13} className="animate-pulse" />
            <span className="hidden sm:inline">LIVE ALERTS</span>
          </div>

          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              className="flex gap-20 whitespace-nowrap"
              animate={{ x: [0, '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              {repeated.map((alert, i) => (
                <span key={i} className="text-xs font-semibold inline-flex items-center gap-3 shrink-0">
                  {alert.text}
                  <span className="text-white/30 font-light">|</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 h-full px-4 hover:bg-white/10 transition-colors border-l border-white/20 flex items-center"
            aria-label="Close alerts"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
