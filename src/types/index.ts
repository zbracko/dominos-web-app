export interface DominoTile {
  id: string
  leftDots: number
  rightDots: number
  isDouble: boolean
}

export interface Player {
  id: string
  name: string
  hand: DominoTile[]
  score: number
  isComputer?: boolean
  avatar?: string
}

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  board: DominoTile[]
  boneyard: DominoTile[]
  gameStatus: 'waiting' | 'playing' | 'finished'
  targetScore: 200 | 300 | 400 | 500
  round: number
  winner?: Player | null
}

export interface GameSettings {
  playerCount: 2 | 3 | 4
  targetScore: 200 | 300 | 400 | 500
  hasComputerPlayers: boolean
  computerCount: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  stats: UserStats
  createdAt: string
}

export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  totalScore: number
  averageScore: number
  bestScore: number
  winRate: number
  favoriteGameLength: 200 | 300 | 400 | 500
  winStreak: number
  totalPointsScored: number
}

export interface GameMove {
  playerId: string
  tile: DominoTile
  position: 'left' | 'right'
  timestamp: number
}

export interface GameHistory {
  id: string
  players: Player[]
  winner: Player
  moves: GameMove[]
  duration: number
  targetScore: number
  finalScores: Record<string, number>
  createdAt: string
  gameSettings: GameSettings
}

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar?: string
  stats: UserStats
  preferences: UserPreferences
  createdAt: string
  lastActive: string
  gameHistory: GameHistory[]
  achievements: Achievement[]
  friends: string[] // User IDs of friends
}

export interface UserPreferences {
  favoriteTargetScore: 200 | 300 | 400 | 500
  preferredDifficulty: 'easy' | 'medium' | 'hard'
  soundEnabled: boolean
  smackTalkEnabled: boolean
  notifications: boolean
  theme: 'dark' | 'light' | 'auto'
  animationsEnabled: boolean
  autoSave: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: 'wins' | 'games' | 'streak' | 'special'
  requirement: number
  progress: number
}

export interface GameSession {
  id: string
  gameHistory: GameHistory
  playerStats: Record<string, PlayerSessionStats>
  highlights: GameHighlight[]
}

export interface PlayerSessionStats {
  playerId: string
  tilesPlayed: number
  averageMoveTime: number
  blockedTurns: number
  doublesPlayed: number
  highestScoringTile: number
  boneyardDraws: number
}

export interface GameHighlight {
  type: 'perfect_round' | 'comeback' | 'blocked_opponent' | 'double_six_start' | 'last_tile_win'
  playerId: string
  description: string
  timestamp: number
}

export interface GameRoom {
  id: string
  hostId: string
  hostName: string
  players: RoomPlayer[]
  gameSettings: GameSettings
  status: 'waiting' | 'playing' | 'finished'
  createdAt: string
  gameStartedAt?: string
  gameState?: GameState
}

export interface RoomPlayer {
  id: string
  name: string
  avatar: string
  isHost: boolean
  isReady: boolean
  isConnected: boolean
}

export interface MultiplayerMove {
  playerId: string
  tileId: string
  position: 'left' | 'right'
  timestamp: number
}

export interface RoomMessage {
  type: 'player_joined' | 'player_left' | 'game_started' | 'move_made' | 'game_ended'
  data: any
  timestamp: number
}

export interface SavedGameData {
  gameState: GameState
  gameSettings: GameSettings
  isMultiplayerGame: boolean
  timestamp: number
}

export interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  updateStats: (newStats: UserStats) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  saveGameState: (gameData: SavedGameData) => void
  loadGameState: () => SavedGameData | null
  clearGameState: () => void
  addFriend: (friendId: string) => Promise<boolean>
  removeFriend: (friendId: string) => Promise<boolean>
  unlockAchievement: (achievementId: string) => void
}