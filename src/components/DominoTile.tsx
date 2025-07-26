import React from 'react'
import { motion } from 'framer-motion'
import { DominoTile as DominoTileType } from '../types'

interface DominoTileProps {
  tile: DominoTileType
  onClick?: () => void
  isPlayable?: boolean
  isSelected?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const DominoTile: React.FC<DominoTileProps> = ({
  tile,
  onClick,
  isPlayable = false,
  isSelected = false,
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-12 h-6',
    medium: 'w-16 h-8',
    large: 'w-20 h-10'
  }

  const dotSize = {
    small: 'w-1 h-1',
    medium: 'w-1.5 h-1.5',
    large: 'w-2 h-2'
  }

  const renderDots = (dots: number) => {
    if (dots === 0) return null

    const positions = {
      1: [{ top: '50%', left: '50%' }],
      2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
      3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
      4: [
        { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
        { top: '75%', left: '25%' }, { top: '75%', left: '75%' }
      ],
      5: [
        { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
        { top: '50%', left: '50%' },
        { top: '75%', left: '25%' }, { top: '75%', left: '75%' }
      ],
      6: [
        { top: '20%', left: '25%' }, { top: '20%', left: '75%' },
        { top: '50%', left: '25%' }, { top: '50%', left: '75%' },
        { top: '80%', left: '25%' }, { top: '80%', left: '75%' }
      ]
    }

    return positions[dots as keyof typeof positions]?.map((pos, index) => (
      <motion.div
        key={index}
        className={`domino-dot ${dotSize[size]}`}
        style={{
          top: pos.top,
          left: pos.left,
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 400 }}
      />
    ))
  }

  return (
    <motion.div
      className={`
        domino-tile ${sizeClasses[size]} select-none relative overflow-hidden
        ${isPlayable ? 'ring-2 ring-green-400 ring-opacity-60 shadow-green-400/25' : ''}
        ${isSelected ? 'ring-2 ring-blue-400 ring-opacity-80 shadow-blue-400/50' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      onClick={onClick}
      whileHover={onClick ? { 
        scale: 1.05, 
        y: -2,
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
      } : {}}
      whileTap={onClick ? { 
        scale: 0.95,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      } : {}}
      layout
      layoutId={tile.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Left side */}
      <div className="absolute left-0 top-0 w-1/2 h-full border-r border-domino-400/50">
        {renderDots(tile.leftDots)}
      </div>
      
      {/* Right side */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
        {renderDots(tile.rightDots)}
      </div>

      {/* Center divider for doubles */}
      {tile.isDouble && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-domino-500/60" />
      )}

      {/* Playable indicator */}
      {isPlayable && (
        <motion.div
          className="absolute inset-0 bg-green-400/20 rounded-lg"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-blue-400/30 rounded-lg border-2 border-blue-400/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Shine effect on hover */}
      {onClick && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
          }}
        />
      )}
    </motion.div>
  )
}

export default DominoTile