const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve frontend
app.use(express.static("public"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ghost-room" });
});

// In-memory rooms (MVP only)
const rooms = {};

io.on("connection", socket => {
  socket.on("join-room", roomId => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    socket.emit("chat-history", rooms[roomId]);
  });

  socket.on("message", data => {
    const { roomId, message } = data;

    const msg = {
      text: message,
      time: Date.now()
    };

    if (rooms[roomId]) {
      rooms[roomId].push(msg);
      if (rooms[roomId].length > 50) rooms[roomId].shift();
    }

    io.to(roomId).emit("message", msg);
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Ghost Room running on port", PORT);
});
