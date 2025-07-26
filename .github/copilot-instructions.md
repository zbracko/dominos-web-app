<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Dominos Web App - Custom Instructions

This is a mobile-first Dominos web application built with React, TypeScript, and Tailwind CSS.

## Project Structure
- **React + TypeScript + Vite** - Modern frontend framework
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for smooth interactions
- **Zustand** - State management (via contexts)
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications

## Key Features
- **Mobile-first responsive design** - Optimized for touch interactions
- **Multiplayer support** - 2-4 players with computer AI opponents
- **Game length settings** - 200, 300, 400, 500 points
- **User authentication** - Login/register with stats tracking
- **Game statistics** - Win/loss tracking and performance metrics
- **Beautiful animations** - Smooth domino tile interactions

## Game Rules Implementation
- Standard domino rules with 28-tile set (0-0 to 6-6)
- Players draw 7 tiles (2 players) or 6 tiles (3-4 players)
- Must match open ends of the board
- Winner determined by first to empty hand or lowest pip count
- Scoring system tracks cumulative points to target score

## Code Style Guidelines
- Use TypeScript interfaces for all data structures
- Mobile-first responsive design with Tailwind classes
- Implement smooth animations with Framer Motion
- Use React contexts for global state management
- Keep components modular and reusable
- Add proper error handling and loading states
- Use semantic HTML and accessibility best practices