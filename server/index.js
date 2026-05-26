const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rooms = require("./rooms");
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  socket.on("create_room", ({ playerName }) => {
  const roomId = Math.random().toString(36).substring(2, 8);

  rooms[roomId] = {
    players: [
      {
        id: socket.id,
        name: playerName,
      },
    ],
  };

  socket.join(roomId);

  socket.emit("room_created", {
    roomId,
    players: rooms[roomId].players,
  });

  console.log("Room created:", roomId);
});
  socket.on("join_room", ({ roomId, playerName }) => {
  const room = rooms[roomId];

  if (!room) {
    socket.emit("error_message", "Room not found");
    return;
  }

  const player = {
    id: socket.id,
    name: playerName,
  };

  room.players.push(player);

  socket.join(roomId);

  io.to(roomId).emit("player_list", room.players);

  console.log(`${playerName} joined ${roomId}`);
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});