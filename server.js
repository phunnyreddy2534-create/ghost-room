const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create-room", ({ roomId, messageTTL, roomTTL }) => {
    if (rooms[roomId]) {
      socket.emit("room-error", "Room already exists");
      return;
    }

    rooms[roomId] = {
      creator: socket.id,
      messageTTL,
      expiresAt: Date.now() + roomTTL,
    };

    socket.join(roomId);
  });

  socket.on("join-room", ({ roomId }) => {
    if (!rooms[roomId]) {
      socket.emit("room-error", "Room not found");
      return;
    }

    socket.join(roomId);
  });

  socket.on("send-message", ({ roomId, message }) => {
    if (!rooms[roomId]) return;

    io.to(roomId).emit("receive-message", {
      message,
      expiresAt: Date.now() + rooms[roomId].messageTTL,
    });
  });

  socket.on("panic", ({ roomId, redirect }) => {
    io.to(roomId).emit("panic", {
      redirectTo: redirect,
    });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].creator === socket.id) {
        delete rooms[roomId];
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Ghost Room backend running");
});

module.exports = server;
