import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { DominoTile as DominoTileType } from '../types'
import DominoTile from './DominoTile'

interface SnakeDominoBoardProps {
  tiles: DominoTileType[]
  selectedTile: string | null
  selectedTileData: DominoTileType | null
  onPositionClick: (position: 'left' | 'right') => void
}

const SnakeDominoBoard: React.FC<SnakeDominoBoardProps> = ({
  tiles,
  selectedTile,
  selectedTileData,
  onPositionClick
}) => {
  const { layout, leftEnd, rightEnd, canPlaceLeft, canPlaceRight } = useMemo(() => {
    if (tiles.length === 0) {
      return { layout: [], leftEnd: null, rightEnd: null, canPlaceLeft: false, canPlaceRight: false }
    }

    // Calculate responsive layout
    const screenWidth = window.innerWidth - 32
    const tileWidth = 64
    const tileHeight = 32
    const gap = 8

    const tilesPerRow = Math.floor(screenWidth / (tileWidth + gap))
    const scale = tiles.length > tilesPerRow * 2 ? Math.max(0.7, tilesPerRow * 2 / tiles.length) : 1

    // Create proper domino line layout
    const tileLayout: Array<{ 
      tile: DominoTileType; 
      x: number; 
      y: number; 
      index: number;
      rotation: number;
      isConnected: boolean;
    }> = []
    
    let currentX = 0
    let currentY = 0
    let direction = 1 // 1 for right, -1 for left
    const scaledTileWidth = tileWidth * scale
    const scaledTileHeight = tileHeight * scale

    tiles.forEach((tile, index) => {
      // Check if this tile properly connects to the previous one
      let isConnected = true
      let rotation = 0

      if (index > 0) {
        const previousTile = tiles[index - 1]
        const expectedConnection = direction > 0 ? previousTile.rightDots : previousTile.leftDots
        const actualConnection = direction > 0 ? tile.leftDots : tile.rightDots
        
        isConnected = expectedConnection === actualConnection
        
        // If not connected, highlight the error
        if (!isConnected) {
          console.warn(`Tile ${index} doesn't connect properly:`, {
            previous: previousTile,
            current: tile,
            expectedConnection,
            actualConnection
          })
        }
      }

      // Handle line wrapping and direction changes
      if (currentX + scaledTileWidth > screenWidth - 32) {
        currentY += scaledTileHeight + gap
        currentX = direction > 0 ? screenWidth - 32 - scaledTileWidth : 0
        direction *= -1
        rotation = direction > 0 ? 0 : 180
      }

      tileLayout.push({
        tile,
        x: currentX,
        y: currentY,
        index,
        rotation,
        isConnected
      })

      currentX += direction * (scaledTileWidth + gap)
    })

    // Get open ends for position validation
    const leftEndValue = tiles.length > 0 ? tiles[0].leftDots : null
    const rightEndValue = tiles.length > 0 ? tiles[tiles.length - 1].rightDots : null

    // Check if selected tile can be placed
    let canPlaceLeftSide = false
    let canPlaceRightSide = false

    if (selectedTileData && leftEndValue !== null && rightEndValue !== null) {
      // Check if tile can connect to left end
      canPlaceLeftSide = selectedTileData.leftDots === leftEndValue || selectedTileData.rightDots === leftEndValue
      
      // Check if tile can connect to right end  
      canPlaceRightSide = selectedTileData.leftDots === rightEndValue || selectedTileData.rightDots === rightEndValue
    } else if (selectedTileData && tiles.length === 0) {
      // First tile can be placed anywhere
      canPlaceLeftSide = true
      canPlaceRightSide = false // Only show left for first tile
    }

    return {
      layout: tileLayout,
      leftEnd: leftEndValue,
      rightEnd: rightEndValue,
      canPlaceLeft: canPlaceLeftSide,
      canPlaceRight: canPlaceRightSide
    }
  }, [tiles, selectedTileData])

  if (tiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-domino-400">
          <p className="text-base mb-1">🎯</p>
          <p className="text-xs">Board is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[200px] bg-domino-900/20 rounded-lg border border-white/10">
      {/* Board container with proper sizing */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="relative" style={{ minWidth: '100%', minHeight: '100px' }}>
          {/* Debug info - show board state */}
          <div className="absolute top-0 left-0 text-xs text-green-400 bg-black/50 px-2 py-1 rounded z-30">
            Board: {tiles.length} tiles
          </div>

          {/* Left position indicator */}
          {selectedTile && layout.length > 0 && (
            <motion.button
              onClick={() => onPositionClick('left')}
              className={`absolute z-20 w-8 h-10 rounded border-2 border-dashed transition-colors ${
                canPlaceLeft 
                  ? 'bg-green-400/50 border-green-400 hover:bg-green-400/70' 
                  : 'bg-red-400/50 border-red-400 cursor-not-allowed'
              }`}
              style={{
                left: Math.max(0, (layout[0]?.x || 0) - 36),
                top: (layout[0]?.y || 0) + 2
              }}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              whileHover={canPlaceLeft ? { scale: 1.1 } : {}}
              title={`Place on left end (${leftEnd} dots)`}
            >
              <div className="text-xs text-white font-bold">L</div>
            </motion.button>
          )}

          {/* Domino tiles - MAIN ISSUE WAS HERE */}
          {layout.map(({ tile, x, y, index, rotation, isConnected }) => (
            <motion.div
              key={`board-tile-${tile.id}-${index}`}
              className="absolute z-10"
              style={{
                left: x + 40, // Add offset to ensure visibility
                top: y + 20,  // Add offset to ensure visibility
                transformOrigin: 'center center',
                minWidth: '64px',
                minHeight: '32px'
              }}
              initial={{ scale: 0, rotate: rotation + 180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: rotation,
                opacity: 1,
                filter: isConnected ? 'none' : 'hue-rotate(0deg) saturate(1.5)'
              }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="relative">
                <DominoTile 
                  tile={tile} 
                  size="medium"
                  className={`shadow-lg ${!isConnected ? 'ring-2 ring-red-500' : 'ring-1 ring-white/20'}`}
                />
                
                {/* Connection validation indicator */}
                {!isConnected && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    !
                  </motion.div>
                )}

                {/* Show dot values for debugging */}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-domino-300 font-mono">
                  {tile.leftDots}-{tile.rightDots}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Right position indicator */}
          {selectedTile && layout.length > 0 && (
            <motion.button
              onClick={() => onPositionClick('right')}
              className={`absolute z-20 w-8 h-10 rounded border-2 border-dashed transition-colors ${
                canPlaceRight 
                  ? 'bg-green-400/50 border-green-400 hover:bg-green-400/70' 
                  : 'bg-red-400/50 border-red-400 cursor-not-allowed'
              }`}
              style={{
                left: Math.max(0, (layout[layout.length - 1]?.x || 0) + 104),
                top: (layout[layout.length - 1]?.y || 0) + 22
              }}
              initial={{ scale: 0, x: 10 }}
              animate={{ scale: 1, x: 0 }}
              whileHover={canPlaceRight ? { scale: 1.1 } : {}}
              title={`Place on right end (${rightEnd} dots)`}
            >
              <div className="text-xs text-white font-bold">R</div>
            </motion.button>
          )}

          {/* Connection lines between tiles */}
          {layout.length > 1 && (
            <svg 
              className="absolute inset-0 pointer-events-none z-5"
              style={{ 
                width: '100%',
                height: '100%',
                minWidth: Math.max(...layout.map(l => l.x)) + 150,
                minHeight: Math.max(...layout.map(l => l.y)) + 80
              }}
            >
              {layout.slice(0, -1).map((current, index) => {
                const next = layout[index + 1]
                const isValidConnection = current.isConnected && next.isConnected
                
                return (
                  <motion.line
                    key={`connection-${index}`}
                    x1={current.x + 72}
                    y1={current.y + 36}
                    x2={next.x + 72}
                    y2={next.y + 36}
                    stroke={isValidConnection ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.7)"}
                    strokeWidth={2}
                    strokeDasharray={isValidConnection ? "none" : "4,4"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: (index + 1) * 0.15 }}
                  />
                )
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Board info panel - Enhanced */}
      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
        <div className="flex gap-4">
          <span className="text-green-400">Tiles: {tiles.length}</span>
          <span className="text-blue-400">Left: {leftEnd}</span>
          <span className="text-purple-400">Right: {rightEnd}</span>
        </div>
      </div>

      {/* Connection validation summary */}
      {layout.some(l => !l.isConnected) && (
        <motion.div
          className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ Invalid connections detected!
        </motion.div>
      )}
    </div>
  )
}

export default SnakeDominoBoard