const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// In-memory room tracking (no database, privacy-first)
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: 0 };
    }

    rooms[roomId].users += 1;
    socket.to(roomId).emit("user-joined");
  });

  socket.on("send-message", ({ roomId, message }) => {
    // Message is never stored
    socket.to(roomId).emit("receive-message", {
      message,
      timestamp: Date.now()
    });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].users -= 1;
        if (rooms[roomId].users <= 0) {
          delete rooms[roomId]; // auto-destroy room
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Ghost Room backend running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
