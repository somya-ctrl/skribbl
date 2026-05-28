# 🎨 Skribbl Clone – Real-Time Multiplayer Drawing Game

A real-time multiplayer drawing and guessing game inspired by Skribbl.io, built using React, Node.js, Express, Socket.IO, and HTML5 Canvas.

## 🚀 Live Demo

Frontend: https://skribbl-smoky.vercel.app/

Backend: https://skribbl-oxp6.onrender.com

---

# ✨ Features

* Real-time multiplayer gameplay
* Shared drawing canvas using HTML5 Canvas API
* WebSocket-based live synchronization
* Room creation and joining with unique room codes
* Turn-based drawing system
* Real-time chat and guessing
* Scoreboard and winner detection
* Configurable:

  * draw time
  * rounds
  * max players
  * word choices
* Word selection system
* Play Again functionality
* Canvas clear and eraser tool
* Responsive modern UI

---

# 🛠️ Tech Stack

## Frontend

* React
* Tailwind CSS
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# 📦 Installation

## Clone Repository

```bash
git https://github.com/somya-ctrl/skribbl.git
cd skribbl
```

---

# Backend Setup

```bash
cd server
npm install
npm start
```

Server runs on:

```bash
http://localhost:3000
```

---

# Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🎮 Gameplay Flow

1. User creates or joins a room (through unique code visible on top)
2. Game starts when minimum 2 players join
3. Drawer selects a word
4. Other players guess through chat
5. Correct guesses earn points
6. Turns rotate automatically
7. Winner is declared after rounds complete

---


# 👨‍💻 Author

Built by Somya  Agarwal
