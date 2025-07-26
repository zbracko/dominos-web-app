import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, ChevronRight, BookOpen, Target, Users, Gamepad2 } from 'lucide-react'

const RulesPage: React.FC = () => {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]))

  const toggleSection = (index: number) => {
    const newOpenSections = new Set(openSections)
    if (newOpenSections.has(index)) {
      newOpenSections.delete(index)
    } else {
      newOpenSections.add(index)
    }
    setOpenSections(newOpenSections)
  }

  const ruleSections = [
    {
      title: 'Game Overview',
      icon: BookOpen,
      color: 'text-blue-400',
      content: (
        <div className="space-y-4">
          <p className="text-domino-300">
            Dominoes is a classic tile-based game where players match tiles with the same number of dots (pips) to form a continuous line.
          </p>
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">🎯 Objective</h4>
            <p className="text-domino-300">
              Be the first player to play all your tiles, or have the lowest pip count when the game is blocked.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Setup & Deal',
      icon: Users,
      color: 'text-green-400',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">🎲 Tile Set</h4>
              <p className="text-domino-300 text-sm">
                Standard set of 28 tiles (0-0 through 6-6)
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">👥 Players</h4>
              <p className="text-domino-300 text-sm">
                2-4 players (human or computer)
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">📋 Initial Deal</h4>
            <ul className="text-domino-300 text-sm space-y-1">
              <li>• <strong>2 players:</strong> Each draws 7 tiles</li>
              <li>• <strong>3-4 players:</strong> Each draws 6 tiles</li>
              <li>• Remaining tiles form the "boneyard"</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'How to Play',
      icon: Gamepad2,
      color: 'text-purple-400',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">1️⃣ Starting the Game</h4>
              <p className="text-domino-300 text-sm">
                The first player places any tile to start the line. In subsequent rounds, the player with the highest double goes first.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">2️⃣ Making Moves</h4>
              <p className="text-domino-300 text-sm mb-2">
                Players take turns adding tiles to either end of the line. The tile must match the number of pips on the open end.
              </p>
              <div className="bg-blue-500/10 rounded p-2 text-xs text-blue-300">
                💡 Example: If the line ends with 5 pips, you can only play a tile that has 5 pips on one side.
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">3️⃣ When You Can't Play</h4>
              <ul className="text-domino-300 text-sm space-y-1">
                <li>• Draw a tile from the boneyard if available</li>
                <li>• If no tiles in boneyard, pass your turn</li>
                <li>• Continue until you can play or all players pass</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Winning & Scoring',
      icon: Target,
      color: 'text-red-400',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">🏆 Round Winner</h4>
              <ul className="text-domino-300 text-sm space-y-1">
                <li>• <strong>Domino:</strong> First player to use all tiles</li>
                <li>• <strong>Blocked Game:</strong> Player with lowest pip count in hand</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">🔢 Scoring</h4>
              <ul className="text-domino-300 text-sm space-y-1">
                <li>• Winner scores 0 points for the round</li>
                <li>• Other players add up pips in their remaining tiles</li>
                <li>• Those points are added to their total score</li>
                <li>• <strong>Goal:</strong> Reach target score (200/300/400/500)</li>
              </ul>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2">👑 Game Winner</h4>
              <p className="text-domino-300 text-sm">
                First player to reach the target score wins the entire game!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Special Rules & Tips',
      icon: ChevronRight,
      color: 'text-yellow-400',
      content: (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">🎯 Strategic Tips</h4>
            <ul className="text-domino-300 text-sm space-y-1">
              <li>• Play doubles early to avoid getting stuck</li>
              <li>• Keep track of which numbers have been played</li>
              <li>• Try to play tiles that give you more options</li>
              <li>• Block opponents by playing tiles they can't match</li>
            </ul>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-orange-400 font-semibold mb-2">🤖 Computer Players</h4>
            <ul className="text-domino-300 text-sm space-y-1">
              <li>• <strong>Easy:</strong> Plays randomly from available tiles</li>
              <li>• <strong>Medium:</strong> Prefers higher-value tiles</li>
              <li>• <strong>Hard:</strong> Uses strategic blocking and counting</li>
            </ul>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">⚠️ Common Mistakes</h4>
            <ul className="text-domino-300 text-sm space-y-1">
              <li>• Forgetting to draw when you can't play</li>
              <li>• Not paying attention to which tiles are left</li>
              <li>• Holding onto doubles too long</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">How to Play</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Introduction */}
        <motion.div
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-4xl mb-3"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎲
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Dominoes!</h2>
          <p className="text-domino-300">
            Learn the rules and strategies to become a domino master
          </p>
        </motion.div>

        {/* Rule Sections */}
        <div className="space-y-3">
          {ruleSections.map((section, index) => {
            const Icon = section.icon
            const isOpen = openSections.has(index)
            
            return (
              <motion.div
                key={section.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={section.color} />
                    <h3 className="text-white font-semibold text-left">{section.title}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} className="text-domino-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-white/10">
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-domino-300 mb-4">
            Ready to start playing?
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/settings" className="game-button">
              Start Game
            </Link>
            <Link 
              to="/" 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default RulesPage