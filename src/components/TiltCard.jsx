import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      
      const width = rect.width
      const height = rect.height
      
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const xPct = mouseX / width - 0.5
      const yPct = mouseY / height - 0.5
      
      // Maximum rotation of 15 degrees
      const x = yPct * -20
      const y = xPct * 20
      
      setRotation({ x, y })
    },
    []
  )

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      className={`relative w-full ${className}`}
    >
      <div 
        className="w-full h-full"
        style={{ transform: 'translateZ(30px)' }} // Lifts the inner content out towards viewer
      >
        {children}
      </div>

      {/* Dynamic 3D glare effect */}
      {isHovered && (
        <motion.div
          animate={{
            background: `radial-gradient(circle at ${50 + rotation.y * 2}% ${50 - rotation.x * 2}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
          }}
          className="absolute inset-x-0 top-0 h-full w-full pointer-events-none rounded-[inherit]"
          style={{ transform: 'translateZ(31px)' }}
        />
      )}
    </motion.div>
  )
}
