import { database } from './firebase'
import { ref, set, get, onValue, remove, update } from 'firebase/database'
import { GameRoom, RoomPlayer, GameSettings, User } from '../types'
import toast from 'react-hot-toast'

class FirebaseMultiplayerService {
  private static instance: FirebaseMultiplayerService
  private currentRoom: GameRoom | null = null
  private eventListeners: { [key: string]: Function[] } = {}
  private roomListeners: { [key: string]: () => void } = {}

  public static getInstance(): FirebaseMultiplayerService {
    if (!FirebaseMultiplayerService.instance) {
      FirebaseMultiplayerService.instance = new FirebaseMultiplayerService()
    }
    return FirebaseMultiplayerService.instance
  }

  // Create a new game room in Firebase
  public async createRoom(host: User, gameSettings: GameSettings): Promise<GameRoom> {
    const roomId = this.generateRoomCode()
    
    const room: GameRoom = {
      id: roomId,
      hostId: host.id,
      hostName: host.username,
      players: [{
        id: host.id,
        name: host.username,
        avatar: host.avatar || '👤',
        isHost: true,
        isReady: true,
        isConnected: true
      }],
      gameSettings,
      status: 'waiting',
      createdAt: new Date().toISOString()
    }

    try {
      // Save room to Firebase
      const roomRef = ref(database, `rooms/${roomId}`)
      await set(roomRef, room)
      
      this.currentRoom = room
      this.listenToRoomChanges(roomId)
      
      console.log('Firebase room created:', roomId, room)
      toast.success(`Room ${roomId} created! Share this code with friends.`)
      
      return room
    } catch (error) {
      console.error('Failed to create room:', error)
      if (error instanceof Error && error.message.includes('Firebase')) {
        toast.error('Firebase setup incomplete. Please check your database configuration.')
      } else {
        toast.error('Failed to create room. Please try again.')
      }
      throw error
    }
  }

  // Join an existing room from Firebase
  public async joinRoom(roomId: string, user: User): Promise<GameRoom | null> {
    console.log('Attempting to join Firebase room:', roomId)
    
    try {
      const roomRef = ref(database, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      
      if (!snapshot.exists()) {
        toast.error(`Room "${roomId}" not found! Make sure the code is correct.`)
        return null
      }

      const room = snapshot.val() as GameRoom
      
      if (room.status !== 'waiting') {
        toast.error('Game already in progress!')
        return null
      }

      if (room.players.length >= room.gameSettings.playerCount) {
        toast.error('Room is full!')
        return null
      }

      if (room.players.some(p => p.id === user.id)) {
        toast.error('You are already in this room!')
        return null
      }

      const newPlayer: RoomPlayer = {
        id: user.id,
        name: user.username,
        avatar: user.avatar || '👤',
        isHost: false,
        isReady: false,
        isConnected: true
      }

      // Add player to Firebase room
      const updatedPlayers = [...room.players, newPlayer]
      await update(roomRef, { players: updatedPlayers })
      
      room.players = updatedPlayers
      this.currentRoom = room
      this.listenToRoomChanges(roomId)
      
      console.log('Successfully joined Firebase room:', room)
      toast.success(`Joined room ${roomId}!`)
      this.emit('player_joined', { player: newPlayer })
      
      return room
    } catch (error) {
      console.error('Failed to join room:', error)
      toast.error('Failed to join room. Please try again.')
      return null
    }
  }

  // Leave current room
  public async leaveRoom(userId: string): Promise<void> {
    if (!this.currentRoom) return

    try {
      const roomRef = ref(database, `rooms/${this.currentRoom.id}`)
      const updatedPlayers = this.currentRoom.players.filter(p => p.id !== userId)
      
      if (updatedPlayers.length === 0) {
        // Delete room if no players left
        await remove(roomRef)
      } else {
        // If host left, make someone else host
        if (this.currentRoom.hostId === userId && updatedPlayers.length > 0) {
          const newHost = updatedPlayers[0]
          newHost.isHost = true
          await update(roomRef, { 
            players: updatedPlayers,
            hostId: newHost.id,
            hostName: newHost.name
          })
        } else {
          await update(roomRef, { players: updatedPlayers })
        }
      }

      this.stopListeningToRoom(this.currentRoom.id)
      this.emit('player_left', { userId })
      this.currentRoom = null
      
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  // Toggle player ready status
  public async toggleReady(userId: string): Promise<void> {
    if (!this.currentRoom) return

    try {
      const playerIndex = this.currentRoom.players.findIndex(p => p.id === userId)
      if (playerIndex === -1 || this.currentRoom.players[playerIndex].isHost) return

      const updatedPlayers = [...this.currentRoom.players]
      updatedPlayers[playerIndex].isReady = !updatedPlayers[playerIndex].isReady

      const roomRef = ref(database, `rooms/${this.currentRoom.id}`)
      await update(roomRef, { players: updatedPlayers })
      
    } catch (error) {
      console.error('Failed to toggle ready status:', error)
    }
  }

  // Check if all players are ready
  public canStartGame(): boolean {
    if (!this.currentRoom) return false
    return this.currentRoom.players.every(p => p.isReady || p.isHost)
  }

  // Start the game
  public async startGame(): Promise<void> {
    if (!this.currentRoom || !this.canStartGame()) return

    try {
      const roomRef = ref(database, `rooms/${this.currentRoom.id}`)
      await update(roomRef, { status: 'playing' })
      
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  // Listen to real-time room changes
  private listenToRoomChanges(roomId: string): void {
    const roomRef = ref(database, `rooms/${roomId}`)
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedRoom = snapshot.val() as GameRoom
        const previousRoom = this.currentRoom
        this.currentRoom = updatedRoom

        // Emit events based on changes
        if (previousRoom) {
          // Check for new players
          const newPlayers = updatedRoom.players.filter(p => 
            !previousRoom.players.some(pp => pp.id === p.id)
          )
          newPlayers.forEach(player => {
            this.emit('player_joined', { player })
          })

          // Check for removed players
          const removedPlayers = previousRoom.players.filter(p => 
            !updatedRoom.players.some(pp => pp.id === p.id)
          )
          removedPlayers.forEach(player => {
            this.emit('player_left', { userId: player.id })
          })

          // Check for game start
          if (previousRoom.status === 'waiting' && updatedRoom.status === 'playing') {
            this.emit('game_started', { room: updatedRoom })
          }
        }

        this.emit('room_updated', { room: updatedRoom })
      } else {
        // Room was deleted
        this.currentRoom = null
        this.emit('room_deleted', {})
      }
    })

    this.roomListeners[roomId] = unsubscribe
  }

  // Stop listening to room changes
  private stopListeningToRoom(roomId: string): void {
    if (this.roomListeners[roomId]) {
      this.roomListeners[roomId]()
      delete this.roomListeners[roomId]
    }
  }

  // Check if room exists
  public async roomExists(roomId: string): Promise<boolean> {
    try {
      const roomRef = ref(database, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      return snapshot.exists()
    } catch (error) {
      console.error('Failed to check room existence:', error)
      return false
    }
  }

  // Get room info without joining
  public async getRoomInfo(roomId: string): Promise<GameRoom | null> {
    try {
      const roomRef = ref(database, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      return snapshot.exists() ? snapshot.val() as GameRoom : null
    } catch (error) {
      console.error('Failed to get room info:', error)
      return null
    }
  }

  // Generate a 4-character room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Event system for real-time updates
  public on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  public off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data))
    }
  }

  // Getters
  public getCurrentRoom(): GameRoom | null {
    return this.currentRoom
  }

  public isInRoom(): boolean {
    return this.currentRoom !== null
  }

  // Cleanup method
  public cleanup(): void {
    Object.keys(this.roomListeners).forEach(roomId => {
      this.stopListeningToRoom(roomId)
    })
    this.currentRoom = null
    this.eventListeners = {}
  }
}

export default FirebaseMultiplayerService