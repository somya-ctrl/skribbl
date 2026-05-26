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

  console.log("User connected:", socket.id);

  // CREATE ROOM
  socket.on("create_room", ({ playerName }) => {

    const roomId = Math.random()
      .toString(36)
      .substring(2, 8);

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
    };

    room.players.push(player);

    socket.join(roomId);

    io.to(roomId).emit(
      "player_list",
      room.players
    );

    console.log(`${playerName} joined ${roomId}`);

  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {

      rooms[roomId].players =
        rooms[roomId].players.filter(
          (player) => player.id !== socket.id
        );

      io.to(roomId).emit(
        "player_list",
        rooms[roomId].players
      );

      // delete empty room
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
        console.log("Room deleted:", roomId);
      }
    }
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});