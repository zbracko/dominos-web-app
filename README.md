# 🎲 Dominos Web App

A modern, mobile-first dominos game built with React, TypeScript, and Tailwind CSS. Features authentic domino gameplay with smart AI opponents, multiplayer support, and beautiful animations.

## ✨ Features

- **🎯 Authentic Domino Rules** - Standard 28-tile set (0-0 to 6-6) with proper matching validation
- **🤖 Smart AI Opponents** - Three difficulty levels with strategic gameplay
- **📱 Mobile-First Design** - Optimized for touch interactions and responsive across all devices
- **👥 Multiplayer Support** - 2-4 players with local and online multiplayer
- **📊 Statistics Tracking** - Win/loss ratios, scoring, and performance metrics
- **🎨 Beautiful Animations** - Smooth tile interactions with Framer Motion
- **⚙️ Customizable Settings** - Game length (200-500 points), player count, difficulty
- **🔐 User Authentication** - Login/register system with persistent game data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dominos-web-app.git
cd dominos-web-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 How to Play

1. **Start a Game** - Choose number of players, difficulty, and target score
2. **Match Tiles** - Connect dominoes by matching dot values on open ends
3. **Strategic Play** - Block opponents while emptying your hand first
4. **Scoring** - Lowest total score wins when someone reaches the target

## 🛠️ Technology Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts for state management
├── pages/           # Route components
├── types/           # TypeScript interfaces
├── utils/           # Game logic and utilities
└── hooks/           # Custom React hooks
```

## 🎯 Game Rules

- **Setup**: 2 players get 7 tiles, 3-4 players get 6 tiles each
- **Objective**: Be first to play all tiles or have lowest pip count
- **Matching**: Tiles must connect by matching dot values
- **Scoring**: Penalty points based on remaining tiles in hand
- **Winning**: Lowest total score when target is reached

## 🚀 Deployment

The app is configured for easy deployment on:

- **Vercel** - `npm run build` then deploy dist folder
- **Netlify** - Connect GitHub repo for automatic deployment
- **Firebase Hosting** - Use provided Firebase configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🎨 Screenshots

*Add screenshots of the game interface here*

---

Built with ❤️ for domino enthusiasts worldwide