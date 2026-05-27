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

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // CREATE ROOM
  socket.on("create_room", ({ playerName }) => {

    const roomId = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    rooms[roomId] = {
      players: [
        {
          id: socket.id,
          name: playerName,
          score:0,
        },
      ],
      currentDrawer: socket.id,
      currentDrawerIndex: 0,
      currentWord:
  words[
    Math.floor(
      Math.random() * words.length
    )
  ],
    };

    socket.join(roomId);

    socket.emit("room_created", {
      roomId,
      players: rooms[roomId].players,
      currentDrawer: rooms[roomId].currentDrawer,
    });
    socket.emit("your_word", {
  word: rooms[roomId].currentWord,
});

    console.log("Room created:", roomId);
    console.log(rooms);

  });

  // JOIN ROOM
  socket.on("join_room", ({ roomId, playerName }) => {

    console.log("Trying to join:", roomId);

    const room = rooms[roomId];

    if (!room) {
      socket.emit("error_message", "Room not found");
      console.log("Room not found");
      return;
    }

    const alreadyExists = room.players.find(
      (p) => p.id === socket.id
    );

    if (alreadyExists) {
      console.log("Player already exists");
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      score:0,
    };

    room.players.push(player);

    socket.join(roomId);

    io.to(roomId).emit("player_list", {
      players: room.players,
      currentDrawer: room.currentDrawer,
    });

    console.log(`${playerName} joined ${roomId}`);

  });

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

    // only current drawer can draw
    if (socket.id !== room.currentDrawer) {
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
   socket.on("clear_canvas", ({ roomId }) => {

  const room = rooms[roomId];

  if (!room) return;

  // only current drawer can clear
  if (socket.id !== room.currentDrawer) {
    return;
  }

  io.to(roomId).emit("canvas_cleared");

});
  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {

      rooms[roomId].players =
        rooms[roomId].players.filter(
          (player) => player.id !== socket.id
        );

      io.to(roomId).emit("player_list", {
        players: rooms[roomId].players,
        currentDrawer: rooms[roomId].currentDrawer,
      });

      // delete empty room
      if (rooms[roomId].players.length === 0) {

        delete rooms[roomId];

        console.log("Room deleted:", roomId);

      }
    }
  });
  socket.on("next_turn", ({ roomId }) => {

  const room = rooms[roomId];

  if (!room) return;

  room.currentDrawerIndex =
    (room.currentDrawerIndex + 1) %
    room.players.length;

  room.currentDrawer =
    room.players[
      room.currentDrawerIndex
    ].id;

  io.to(roomId).emit("player_list", {
    players: room.players,
    currentDrawer: room.currentDrawer,
  });

});
socket.on(
  "chat_message",
  ({ roomId, playerName, text }) => {

    const room = rooms[roomId];

    if (!room) return;

    // DRAWER CANNOT CHAT WORD
    if (socket.id === room.currentDrawer) {

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
      const guessedPlayer =
  room.players.find(
    (p) => p.id === socket.id
  );

if (guessedPlayer) {
  guessedPlayer.score += 10;
}
      io.to(roomId).emit(
        "chat_message",
        {
          playerName: "SYSTEM",
          text:
            `${playerName} guessed correctly! 🎉`,
        }
      );
      io.to(roomId).emit("player_list", {
  players: room.players,
  currentDrawer: room.currentDrawer,
});

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
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});