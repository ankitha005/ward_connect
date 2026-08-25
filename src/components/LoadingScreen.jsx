import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const LOADING_STEPS = [
  'Connecting to ward database...',
  'Loading complaint records...',
  'Fetching announcements...',
  'Initializing AI systems...',
  'Almost ready...',
]

export default function LoadingScreen({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progress bar from 0 to 100 over 2.8s
    const progressTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressTimer); return 100 }
        return p + 2
      })
    }, 56)

    // Cycle loading text
    const textTimer = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1))
    }, 560)

    // Finish after 3s
    const doneTimer = setTimeout(() => {
      clearInterval(progressTimer)
      clearInterval(textTimer)
      onComplete()
    }, 3000)

    return () => {
      clearInterval(progressTimer)
      clearInterval(textTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0a0f1e]"
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #138808 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FF9933 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full">

        {/* Logo / Brand Mark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="relative"
        >
          {/* Outer pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #DC2626, #FF9933, #138808, #DC2626)', filter: 'blur(8px)' }}
          />
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl"
            style={{ background: 'conic-gradient(from 0deg, #DC2626, #FF9933, #138808, #DC2626)' }}
          >
            <div className="w-20 h-20 rounded-full bg-[#0a0f1e] flex items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tight">A</span>
            </div>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            ADDA<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #FF9933, #DC2626)' }}>_360</span>
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-2 tracking-widest uppercase">
            Ward Connect Platform
          </p>
        </motion.div>

        {/* Animated Indian Tricolor bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-40 h-1 rounded-full overflow-hidden flex"
        >
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full space-y-4"
        >
          {/* Status text */}
          <div className="h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center text-slate-400 text-xs font-mono"
              >
                {LOADING_STEPS[stepIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(to right, #DC2626, #FF9933, #138808)',
                boxShadow: '0 0 12px rgba(255,153,51,0.6)'
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Percentage */}
          <p className="text-center text-slate-500 text-xs font-mono">
            {Math.min(progress, 100)}%
          </p>
        </motion.div>

        {/* Floating dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-brand-orange"
            />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-slate-600 text-xs font-medium tracking-widest uppercase"
      >
        Empowering Bengaluru's Citizens
      </motion.p>
    </motion.div>
  )
}
