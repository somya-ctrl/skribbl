const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rooms = require("./rooms");

const app = express();

app.use(cors());

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://skribbl-smoky.vercel.app",
];

const words = [
  "apple",
  "tiger",
  "car",
  "house",
  "pizza",
  "tree",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// TIMER FUNCTION
function startTimer(roomId) {

  const room = rooms[roomId];

  if (!room) return;

  // CLEAR OLD TIMER
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
  }

  room.timeLeft = 60;

  io.to(roomId).emit(
    "timer_update",
    room.timeLeft
  );

  room.timerInterval = setInterval(() => {

    if (!rooms[roomId]) {

      clearInterval(room.timerInterval);

      return;

    }

    room.timeLeft--;

    io.to(roomId).emit(
      "timer_update",
      room.timeLeft
    );

    // TIMER END
    if (room.timeLeft <= 0) {

      clearInterval(room.timerInterval);

      nextTurn(roomId);

      startTimer(roomId);

    }

  }, 1000);

}

// NEXT TURN FUNCTION
function nextTurn(roomId) {

  const room = rooms[roomId];

  if (!room) return;

  // NEXT DRAWER
  room.currentDrawerIndex =
    (room.currentDrawerIndex + 1) %
    room.players.length;

  room.currentDrawer =
    room.players[
      room.currentDrawerIndex
    ].id;

  // NEW WORD
  room.currentWord =
    words[
      Math.floor(
        Math.random() * words.length
      )
    ];

  // SEND WORD TO DRAWER
  io.to(room.currentDrawer).emit(
    "your_word",
    {
      word: room.currentWord,
    }
  );

  // UPDATE PLAYERS
  io.to(roomId).emit(
    "player_list",
    {
      players: room.players,
      currentDrawer:
        room.currentDrawer,
    }
  );

  // TURN MESSAGE
  const nextPlayer =
    room.players[
      room.currentDrawerIndex
    ];

  io.to(roomId).emit(
    "chat_message",
    {
      playerName: "SYSTEM",
      text:
        `${nextPlayer.name} is now drawing! ✏️`,
    }
  );

  // CLEAR CANVAS
  io.to(roomId).emit(
    "canvas_cleared"
  );

}

io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );

  // CREATE ROOM
  socket.on(
    "create_room",
    ({ playerName }) => {

      const roomId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      rooms[roomId] = {

        players: [
          {
            id: socket.id,
            name: playerName,
            score: 0,
          },
        ],

        currentDrawer: socket.id,

        currentDrawerIndex: 0,

        currentWord:
          words[
            Math.floor(
              Math.random() *
                words.length
            )
          ],

        timeLeft: 60,

        timerInterval: null,

        gameStarted: false,

      };

      socket.join(roomId);

      socket.emit(
        "room_created",
        {
          roomId,
          players:
            rooms[roomId].players,
          currentDrawer:
            rooms[roomId]
              .currentDrawer,
        }
      );

      // SEND WORD TO DRAWER
      socket.emit("your_word", {
        word:
          rooms[roomId].currentWord,
      });

      console.log(
        "Room created:",
        roomId
      );

    }
  );

  // JOIN ROOM
  socket.on(
    "join_room",
    ({ roomId, playerName }) => {

      const room = rooms[roomId];

      if (!room) {

        socket.emit(
          "error_message",
          "Room not found"
        );

        return;

      }

      const alreadyExists =
        room.players.find(
          (p) => p.id === socket.id
        );

      if (alreadyExists) {
        return;
      }

      const player = {
        id: socket.id,
        name: playerName,
        score: 0,
      };

      room.players.push(player);

      socket.join(roomId);

      io.to(roomId).emit(
        "player_list",
        {
          players: room.players,
          currentDrawer:
            room.currentDrawer,
        }
      );

      // START GAME WHEN 2 PLAYERS
      if (
        room.players.length >= 2 &&
        !room.gameStarted
      ) {

        room.gameStarted = true;

        io.to(roomId).emit(
          "chat_message",
          {
            playerName: "SYSTEM",
            text:
              "Game started! 🎮",
          }
        );

        startTimer(roomId);

      }

    }
  );

  // DRAW EVENT
  socket.on("draw", (data) => {

    const {
      roomId,
      x,
      y,
      prevX,
      prevY,
      color,
      brushSize,
    } = data;

    const room = rooms[roomId];

    if (!room) return;

    // ONLY DRAWER CAN DRAW
    if (
      socket.id !== room.currentDrawer
    ) {
      return;
    }

    io.to(roomId).emit("draw", {
      x,
      y,
      prevX,
      prevY,
      color,
      brushSize,
    });

  });

  // CLEAR CANVAS
  socket.on(
    "clear_canvas",
    ({ roomId }) => {

      const room = rooms[roomId];

      if (!room) return;

      // ONLY DRAWER CAN CLEAR
      if (
        socket.id !==
        room.currentDrawer
      ) {
        return;
      }

      io.to(roomId).emit(
        "canvas_cleared"
      );

    }
  );

  // CHAT + GUESSING
  socket.on(
    "chat_message",
    ({ roomId, playerName, text }) => {

      const room = rooms[roomId];

      if (!room) return;

      // DRAWER CANNOT GUESS
      if (
        socket.id ===
        room.currentDrawer
      ) {

        io.to(socket.id).emit(
          "chat_message",
          {
            playerName: "SYSTEM",
            text:
              "Drawer cannot send guesses.",
          }
        );

        return;

      }

      // CORRECT GUESS
      if (
        text.toLowerCase().trim() ===
        room.currentWord.toLowerCase()
      ) {

        // GIVE SCORE
        const guessedPlayer =
          room.players.find(
            (p) =>
              p.id === socket.id
          );

        if (guessedPlayer) {

          guessedPlayer.score += 10;

        }

        // SUCCESS MESSAGE
        io.to(roomId).emit(
          "chat_message",
          {
            playerName: "SYSTEM",
            text:
              `${playerName} guessed correctly! 🎉`,
          }
        );

        // UPDATE SCORES
        io.to(roomId).emit(
          "player_list",
          {
            players: room.players,
            currentDrawer:
              room.currentDrawer,
          }
        );

        // NEXT TURN
        nextTurn(roomId);

        // RESTART TIMER
        startTimer(roomId);

        return;

      }

      // NORMAL CHAT
      io.to(roomId).emit(
        "chat_message",
        {
          playerName,
          text,
        }
      );

    }
  );

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log(
      "User disconnected:",
      socket.id
    );

    for (const roomId in rooms) {

      rooms[roomId].players =
        rooms[roomId].players.filter(
          (player) =>
            player.id !== socket.id
        );

      io.to(roomId).emit(
        "player_list",
        {
          players:
            rooms[roomId].players,
          currentDrawer:
            rooms[roomId]
              .currentDrawer,
        }
      );

      // DELETE EMPTY ROOM
      if (
        rooms[roomId].players
          .length === 0
      ) {

        clearInterval(
          rooms[roomId].timerInterval
        );

        delete rooms[roomId];

      }

    }

  });

});

const PORT =
  process.env.PORT || 3000;

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});