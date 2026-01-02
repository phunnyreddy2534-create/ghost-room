const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

/**
 * rooms structure:
 * {
 *   roomId: {
 *     creator: socketId,
 *     users: number,
 *     messageTTL: ms,
 *     roomExpiry: timestamp
 *   }
 * }
 */
const rooms = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // CREATE ROOM
  socket.on("create-room", ({ roomId, messageTTL, roomTTL }) => {
    rooms[roomId] = {
      creator: socket.id,
      users: 1,
      messageTTL: messageTTL || 30000, // default 30s
      roomExpiry: Date.now() + (roomTTL || 10 * 60 * 1000) // default 10 min
    };

    socket.join(roomId);
    socket.emit("room-created", rooms[roomId]);
  });

  // JOIN ROOM
  socket.on("join-room", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("room-error", "Room does not exist");
      return;
    }

    if (Date.now() > room.roomExpiry) {
      delete rooms[roomId];
      socket.emit("room-error", "Room expired");
      return;
    }

    socket.join(roomId);
    room.users += 1;
    socket.emit("room-joined", room);
    socket.to(roomId).emit("user-joined");
  });

  // SEND MESSAGE (EPHEMERAL)
  socket.on("send-message", ({ roomId, message }) => {
    const room = rooms[roomId];
    if (!room) return;

    io.to(roomId).emit("receive-message", {
      message,
      expiresAt: Date.now() + room.messageTTL
    });
  });

  // UPDATE TIMERS (CREATOR ONLY)
  socket.on("update-room-settings", ({ roomId, messageTTL, roomTTL }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.creator !== socket.id) return;

    if (messageTTL) room.messageTTL = messageTTL;
    if (roomTTL) room.roomExpiry = Date.now() + roomTTL;

    io.to(roomId).emit("room-updated", room);
  });

  // KILL SWITCH / PANIC MODE
  socket.on("panic", ({ roomId, redirect }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.creator !== socket.id) return;

    io.to(roomId).emit("panic", {
      redirectTo: redirect || "https://www.youtube.com"
    });
  });

  // DISCONNECT HANDLING
  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      room.users -= 1;
      if (room.users <= 0) {
        delete rooms[roomId];
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Ghost Room backend running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
