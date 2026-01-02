const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// serve frontend
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ghost-room" });
});

let server;
let io;

module.exports = (req, res) => {
  if (!server) {
    server = http.createServer(app);
    io = new Server(server, {
      cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  server.emit("request", req, res);
};
