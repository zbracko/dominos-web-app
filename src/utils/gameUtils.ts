import { DominoTile, Player, GameState } from '../types'

export const createDominoSet = (): DominoTile[] => {
  const tiles: DominoTile[] = []
  let id = 0

  // Create all domino tiles (0-0 to 6-6)
  for (let left = 0; left <= 6; left++) {
    for (let right = left; right <= 6; right++) {
      tiles.push({
        id: `domino-${id++}`,
        leftDots: left,
        rightDots: right,
        isDouble: left === right
      })
    }
  }

  return shuffleTiles(tiles)
}

export const shuffleTiles = (tiles: DominoTile[]): DominoTile[] => {
  const shuffled = [...tiles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Fisher-Yates shuffle algorithm with optional seed for deterministic shuffling
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array]
  
  if (seed !== undefined) {
    // Use seeded random for deterministic shuffling in multiplayer
    let seedValue = seed
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280
      return seedValue / 233280
    }
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  } else {
    // Use normal random for single player
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  }
  
  return shuffled
}

export const dealTiles = (tiles: DominoTile[], playerCount: number): { hands: DominoTile[][], boneyard: DominoTile[] } => {
  const tilesPerPlayer = playerCount === 2 ? 7 : 6
  const hands: DominoTile[][] = []
  
  for (let i = 0; i < playerCount; i++) {
    hands.push(tiles.slice(i * tilesPerPlayer, (i + 1) * tilesPerPlayer))
  }
  
  const boneyard = tiles.slice(playerCount * tilesPerPlayer)
  return { hands, boneyard }
}

export const isRoundOver = (gameState: GameState): boolean => {
  // Check if any player has no tiles (went out)
  if (gameState.players.some(player => player.hand.length === 0)) {
    return true
  }
  
  // Check if game is blocked (no player can make a move and boneyard is empty)
  const playersCanPlay = gameState.players.some(player => 
    playerHasPlayableTile(player, gameState.board)
  )
  
  return !playersCanPlay && gameState.boneyard.length === 0
}

export const isGameOver = (gameState: GameState): boolean => {
  // Game is over when any player reaches the target score OR EXCEEDS it
  return gameState.players.some(player => player.score >= gameState.targetScore)
}

export const getRoundWinner = (gameState: GameState): Player | null => {
  // Player with empty hand wins the round
  const emptyHandPlayer = gameState.players.find(player => player.hand.length === 0)
  if (emptyHandPlayer) return emptyHandPlayer
  
  // In blocked game, player with lowest hand score wins the round
  const lowestScore = Math.min(...gameState.players.map(p => calculateHandScore(p.hand)))
  return gameState.players.find(p => calculateHandScore(p.hand) === lowestScore) || null
}

export const getGameWinner = (gameState: GameState): Player | null => {
  // CORRECT: When someone reaches target score, the winner is the player with the LOWEST total score
  const hasPlayerReachedTarget = gameState.players.some(p => p.score >= gameState.targetScore)
  if (!hasPlayerReachedTarget) return null
  
  const lowestScore = Math.min(...gameState.players.map(p => p.score))
  return gameState.players.find(p => p.score === lowestScore) || null
}

export const calculateRoundScoring = (gameState: GameState, roundWinner: Player): Player[] => {
  // CORRECT DOMINO SCORING: Round winner gets 0 penalty points, losers get penalty points equal to their hand value
  // The goal is to have the LOWEST total score when someone reaches the target
  return gameState.players.map(player => ({
    ...player,
    score: player.id === roundWinner.id 
      ? player.score  // Winner gets no additional penalty points
      : player.score + calculateHandScore(player.hand)  // Losers get penalty points added
  }))
}

export const canPlayTile = (tile: DominoTile, board: DominoTile[]): boolean => {
  if (board.length === 0) return true
  
  const leftEnd = board[0].leftDots
  const rightEnd = board[board.length - 1].rightDots
  
  return tile.leftDots === leftEnd || tile.rightDots === leftEnd ||
         tile.leftDots === rightEnd || tile.rightDots === rightEnd
}

export const getPlayablePositions = (tile: DominoTile, board: DominoTile[]): Array<'left' | 'right'> => {
  if (board.length === 0) return ['left']
  
  const positions: Array<'left' | 'right'> = []
  const leftEnd = board[0].leftDots
  const rightEnd = board[board.length - 1].rightDots
  
  if (tile.leftDots === leftEnd || tile.rightDots === leftEnd) {
    positions.push('left')
  }
  if (tile.leftDots === rightEnd || tile.rightDots === rightEnd) {
    positions.push('right')
  }
  
  return positions
}

export const getPlayablePosition = (tile: DominoTile, board: DominoTile[]): 'left' | 'right' | null => {
  const positions = getPlayablePositions(tile, board)
  return positions.length > 0 ? positions[0] : null
}

export const orientTileForPlacement = (tile: DominoTile, board: DominoTile[], position: 'left' | 'right'): DominoTile => {
  if (board.length === 0) {
    // First tile placement - return as is
    return tile
  }

  let orientedTile = { ...tile }
  
  if (position === 'left') {
    const leftEnd = board[0].leftDots
    // The right side of the new tile must match the left end of the board
    if (tile.rightDots === leftEnd) {
      // Tile is already correctly oriented
      orientedTile = tile
    } else if (tile.leftDots === leftEnd) {
      // Flip the tile so rightDots matches leftEnd
      orientedTile = { ...tile, leftDots: tile.rightDots, rightDots: tile.leftDots }
    }
  } else { // position === 'right'
    const rightEnd = board[board.length - 1].rightDots
    // The left side of the new tile must match the right end of the board
    if (tile.leftDots === rightEnd) {
      // Tile is already correctly oriented
      orientedTile = tile
    } else if (tile.rightDots === rightEnd) {
      // Flip the tile so leftDots matches rightEnd
      orientedTile = { ...tile, leftDots: tile.rightDots, rightDots: tile.leftDots }
    }
  }
  
  return orientedTile
}

export const playTile = (gameState: GameState, tileId: string, position: 'left' | 'right'): GameState => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId)
  
  if (tileIndex === -1) return gameState
  
  const tile = currentPlayer.hand[tileIndex]
  
  // Validate the move
  if (!canPlayTile(tile, gameState.board)) {
    return gameState
  }

  const playablePositions = getPlayablePositions(tile, gameState.board)
  if (!playablePositions.includes(position)) {
    return gameState
  }

  const newHand = currentPlayer.hand.filter(t => t.id !== tileId)
  
  // Orient tile correctly for board placement
  const orientedTile = orientTileForPlacement(tile, gameState.board, position)
  
  const newBoard = position === 'left' 
    ? [orientedTile, ...gameState.board]
    : [...gameState.board, orientedTile]
  
  const newPlayers = gameState.players.map((player, index) => 
    index === gameState.currentPlayerIndex 
      ? { ...player, hand: newHand }
      : player
  )
  
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
  
  return {
    ...gameState,
    players: newPlayers,
    board: newBoard,
    currentPlayerIndex: nextPlayerIndex
  }
}

export const playerHasPlayableTile = (player: Player, board: DominoTile[]): boolean => {
  return player.hand.some(tile => canPlayTile(tile, board))
}

export const calculateHandScore = (hand: DominoTile[]): number => {
  return hand.reduce((total, tile) => total + tile.leftDots + tile.rightDots, 0)
}

export const findStartingPlayer = (players: Player[]): number => {
  // Find player with highest double
  let highestDouble = -1
  let startingPlayerIndex = 0

  players.forEach((player, index) => {
    player.hand.forEach(tile => {
      if (tile.isDouble && tile.leftDots > highestDouble) {
        highestDouble = tile.leftDots
        startingPlayerIndex = index
      }
    })
  })

  // If no doubles found, find player with highest pip count tile
  if (highestDouble === -1) {
    let highestPips = -1
    players.forEach((player, index) => {
      player.hand.forEach(tile => {
        const pips = tile.leftDots + tile.rightDots
        if (pips > highestPips) {
          highestPips = pips
          startingPlayerIndex = index
        }
      })
    })
  }

  return startingPlayerIndex
}

export const mustPlayFirstTile = (): DominoTile | null => {
  // For simplicity and better user experience, allow any tile to be played first
  // The starting player can choose any tile from their hand
  return null
}

export const advanceToNextPlayer = (gameState: GameState): GameState => {
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
  return {
    ...gameState,
    currentPlayerIndex: nextPlayerIndex
  }
}