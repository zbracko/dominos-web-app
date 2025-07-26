import { GameRoom, RoomPlayer, GameSettings, User } from '../types'
import toast from 'react-hot-toast'

class MultiplayerService {
  private static instance: MultiplayerService
  private currentRoom: GameRoom | null = null
  private eventListeners: { [key: string]: Function[] } = {}

  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService()
    }
    return MultiplayerService.instance
  }

  // Enhanced room creation with better persistence
  public createRoom(host: User, gameSettings: GameSettings): GameRoom {
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

    this.currentRoom = room
    this.saveRoomToStorage(room)
    
    // Log room creation for debugging
    console.log('Room created:', roomId, room)
    toast.success(`Room ${roomId} created! Share this code with friends.`)
    
    return room
  }

  // Enhanced room joining with better error messages
  public joinRoom(roomId: string, user: User): GameRoom | null {
    console.log('Attempting to join room:', roomId)
    
    const room = this.loadRoomFromStorage(roomId)
    if (!room) {
      console.log('Room not found in storage')
      // Check if room exists in active rooms list
      const activeRooms = this.getActiveRooms()
      const foundRoom = activeRooms.find(r => r.id === roomId)
      if (!foundRoom) {
        toast.error(`Room "${roomId}" not found! Make sure the code is correct.`)
        return null
      }
      console.log('Room found in active list')
    }

    const targetRoom = room || this.getActiveRooms().find(r => r.id === roomId)
    if (!targetRoom) {
      toast.error('Room not found!')
      return null
    }

    if (targetRoom.status !== 'waiting') {
      toast.error('Game already in progress!')
      return null
    }

    if (targetRoom.players.length >= targetRoom.gameSettings.playerCount) {
      toast.error('Room is full!')
      return null
    }

    if (targetRoom.players.some(p => p.id === user.id)) {
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

    targetRoom.players.push(newPlayer)
    this.currentRoom = targetRoom
    this.saveRoomToStorage(targetRoom)
    
    console.log('Successfully joined room:', targetRoom)
    toast.success(`Joined room ${roomId}!`)
    this.emit('player_joined', { player: newPlayer })
    return targetRoom
  }

  // Add method to check room existence
  public roomExists(roomId: string): boolean {
    const room = this.loadRoomFromStorage(roomId)
    if (room) return true
    
    const activeRooms = this.getActiveRooms()
    return activeRooms.some(r => r.id === roomId)
  }

  // Add method to get room info without joining
  public getRoomInfo(roomId: string): GameRoom | null {
    const room = this.loadRoomFromStorage(roomId)
    if (room) return room
    
    const activeRooms = this.getActiveRooms()
    return activeRooms.find(r => r.id === roomId) || null
  }

  // Leave current room
  public leaveRoom(userId: string): void {
    if (!this.currentRoom) return

    this.currentRoom.players = this.currentRoom.players.filter(p => p.id !== userId)
    
    if (this.currentRoom.players.length === 0) {
      this.deleteRoom(this.currentRoom.id)
    } else {
      // If host left, make someone else host
      if (this.currentRoom.hostId === userId && this.currentRoom.players.length > 0) {
        const newHost = this.currentRoom.players[0]
        newHost.isHost = true
        this.currentRoom.hostId = newHost.id
        this.currentRoom.hostName = newHost.name
      }
      this.saveRoomToStorage(this.currentRoom)
    }

    this.emit('player_left', { userId })
    this.currentRoom = null
  }

  // Toggle player ready status
  public toggleReady(userId: string): void {
    if (!this.currentRoom) return

    const player = this.currentRoom.players.find(p => p.id === userId)
    if (player && !player.isHost) {
      player.isReady = !player.isReady
      this.saveRoomToStorage(this.currentRoom)
      this.emit('player_ready_changed', { player })
    }
  }

  // Check if all players are ready
  public canStartGame(): boolean {
    if (!this.currentRoom) return false
    return this.currentRoom.players.every(p => p.isReady || p.isHost)
  }

  // Start the game
  public startGame(): void {
    if (!this.currentRoom || !this.canStartGame()) return

    this.currentRoom.status = 'playing'
    this.saveRoomToStorage(this.currentRoom)
    this.emit('game_started', { room: this.currentRoom })
  }

  // Send a move to other players
  public sendMove(playerId: string, tileId: string, position: 'left' | 'right'): void {
    if (!this.currentRoom) return

    const move = {
      playerId,
      tileId,
      position,
      timestamp: Date.now()
    }

    this.emit('move_made', move)
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

  // Storage methods (using localStorage for now)
  private saveRoomToStorage(room: GameRoom): void {
    try {
      localStorage.setItem(`dominos_room_${room.id}`, JSON.stringify(room))
      // Also save to active rooms list
      const activeRooms = this.getActiveRooms()
      const existingIndex = activeRooms.findIndex(r => r.id === room.id)
      if (existingIndex >= 0) {
        activeRooms[existingIndex] = room
      } else {
        activeRooms.push(room)
      }
      localStorage.setItem('dominos_active_rooms', JSON.stringify(activeRooms))
    } catch (error) {
      console.warn('Failed to save room:', error)
    }
  }

  private loadRoomFromStorage(roomId: string): GameRoom | null {
    try {
      const saved = localStorage.getItem(`dominos_room_${roomId}`)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('Failed to load room:', error)
      return null
    }
  }

  private deleteRoom(roomId: string): void {
    try {
      localStorage.removeItem(`dominos_room_${roomId}`)
      const activeRooms = this.getActiveRooms().filter(r => r.id !== roomId)
      localStorage.setItem('dominos_active_rooms', JSON.stringify(activeRooms))
    } catch (error) {
      console.warn('Failed to delete room:', error)
    }
  }

  public getActiveRooms(): GameRoom[] {
    try {
      const saved = localStorage.getItem('dominos_active_rooms')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      return []
    }
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
}

export default MultiplayerService