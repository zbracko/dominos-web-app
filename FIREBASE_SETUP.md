# Firebase Setup for Online Multiplayer

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `dominos-multiplayer`
4. Continue through setup (disable Analytics if you want)

### Step 2: Enable Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for now)
4. Select your preferred location

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon `</>`
4. Register app name: `dominos-web`
5. Copy the `firebaseConfig` object

### Step 4: Update Your Code
Replace the config in `src/utils/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
}
```

### Step 5: Build & Deploy
```bash
npm run build
```

Upload the `dist` folder to Netlify.

## ✅ That's it!

Your friends can now:
- **Create rooms** from any device
- **Share 4-letter codes** 
- **Join from different devices/locations**
- **Play together in real-time**

## 🔧 Features Added

### Online Mode (Firebase)
- ✅ **Cross-device multiplayer** - friends can join from anywhere
- ✅ **Real-time synchronization** - instant updates when players join/leave
- ✅ **Room persistence** - rooms survive page refreshes
- ✅ **Automatic cleanup** - rooms deleted when empty

### Local Mode (Original)
- ✅ **Same-device multiplayer** - pass & play
- ✅ **No internet required** - works offline
- ✅ **Perfect for gatherings** - everyone around one device

### Smart Toggle
- Users can switch between **Online** and **Local** modes
- **Green WiFi icon** = Online mode (Firebase)
- **Orange WiFi-off icon** = Local mode (localStorage)

## 🎮 How It Works

**Your Netlify deployment will support BOTH:**

1. **Online Multiplayer:** Friends create/join rooms from different devices
2. **Local Multiplayer:** Multiple people share one device

The Firebase Realtime Database handles all the synchronization automatically!