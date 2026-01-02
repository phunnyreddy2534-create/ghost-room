import { Server } from "socket.io";

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    const rooms = {};

    io.on("connection", (socket) => {
      socket.on("join-room", (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = [];

        socket.emit("chat-history", rooms[roomId]);

        io.to(roomId).emit("system", "A user joined the room");
      });

      socket.on("message", ({ roomId, message }) => {
        const msg = {
          text: message,
          time: new Date().toISOString(),
        };

        rooms[roomId].push(msg);
        if (rooms[roomId].length > 50) rooms[roomId].shift();

        io.to(roomId).emit("message", msg);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
