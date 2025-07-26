// OpenAI configuration and smack talk service
const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';

interface SmackTalkContext {
  playerName: string
  action: 'good_move' | 'bad_move' | 'winning' | 'losing' | 'blocked' | 'draw_tile' | 'game_start' | 'game_end'
  gameState?: {
    playerScore: number
    opponentScore: number
    tilesLeft: number
    isWinning: boolean
  }
}

class SmackTalkService {
  private static instance: SmackTalkService
  private fallbackMessages: Record<string, string[]> = {
    good_move: [
      "Nice move! You're getting the hang of this! 🎯",
      "Smooth play! The dominoes are aligning in your favor! ✨",
      "That was actually... not terrible! 😏",
      "Look who's showing off now! 🔥",
      "I see you've been practicing! 👑"
    ],
    bad_move: [
      "Ooof, that's gonna hurt later! 😬",
      "Are you sure about that move? 🤔",
      "Bold strategy... let's see how it plays out! 😅",
      "That's... one way to play dominoes! 🙃",
      "I would have done the same... if I wanted to lose! 😈"
    ],
    winning: [
      "Don't get too cocky now! 😤",
      "Beginner's luck is strong with this one! 🍀",
      "Enjoy it while it lasts! 😏",
      "The tide can turn quickly in dominoes! 🌊",
      "Someone's feeling confident! 💪"
    ],
    losing: [
      "Don't worry, everyone has rough games! 🫂",
      "The comeback starts now! 📈",
      "It's not over until it's over! 💪",
      "Time to dig deep and fight back! ⚔️",
      "This is where legends are made! 🌟"
    ],
    blocked: [
      "Looks like someone's stuck! 😏",
      "Time to hit the boneyard! 🦴",
      "No moves? That's rough buddy! 😅",
      "The dominoes have spoken! 🎲",
      "Sometimes the tiles just don't cooperate! 🤷‍♂️"
    ],
    draw_tile: [
      "Hope this one's better than the last! 🤞",
      "Fishing in the boneyard again? 🎣",
      "Maybe this tile will save you! ⭐",
      "The boneyard is your friend today! 💀",
      "Drawing tiles like there's no tomorrow! 🏃‍♂️"
    ],
    game_start: [
      "Let the domino battle begin! ⚔️",
      "May the best strategist win! 🧠",
      "Time to see what you're made of! 💎",
      "Game on! Let's make this interesting! 🎯",
      "Ready to get schooled in dominoes? 📚"
    ],
    game_end: [
      "What a game! Respect! 🙏",
      "GG! That was intense! 🔥",
      "Well played! Ready for round two? 🔄",
      "That's how dominoes is done! 👑",
      "Epic game! The rivalry continues! ⚡"
    ]
  }

  public static getInstance(): SmackTalkService {
    if (!SmackTalkService.instance) {
      SmackTalkService.instance = new SmackTalkService()
    }
    return SmackTalkService.instance
  }

  private getRandomFallback(action: string): string {
    const messages = this.fallbackMessages[action] || this.fallbackMessages.good_move
    return messages[Math.floor(Math.random() * messages.length)]
  }

  public async generateSmackTalk(context: SmackTalkContext): Promise<string> {
    // If no API key, use fallback messages
    if (!OPENAI_API_KEY) {
      return this.getRandomFallback(context.action)
    }

    try {
      // For now, we'll use enhanced fallback messages with context
      // You can uncomment the OpenAI integration below when you have an API key
      return this.generateContextualFallback(context)
      
      /* OpenAI integration (uncomment when API key is available):
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({ 
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true 
      })

      const prompt = this.buildPrompt(context)
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.8
      })

      return response.choices[0]?.message?.content?.trim() || this.getRandomFallback(context.action)
      */
    } catch (error) {
      console.warn('SmackTalk generation failed, using fallback:', error)
      return this.getRandomFallback(context.action)
    }
  }

  private generateContextualFallback(context: SmackTalkContext): string {
    const { action, playerName, gameState } = context
    const messages = this.fallbackMessages[action] || []
    let message = messages[Math.floor(Math.random() * messages.length)]

    // Add contextual elements
    if (gameState) {
      if (action === 'winning' && gameState.isWinning) {
        message = `${playerName} is dominating! ${message}`
      } else if (action === 'losing' && !gameState.isWinning) {
        message = `Hang in there ${playerName}! ${message}`
      } else if (gameState.tilesLeft <= 2) {
        message = `${message} Only ${gameState.tilesLeft} tiles left!`
      }
    }

    return message
  }
}

export default SmackTalkService