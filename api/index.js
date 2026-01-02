export default function handler(req, res) {
  global.rooms = global.rooms || {};

  const { room, message } = req.query;

  if (!room) {
    return res.json({ status: "ok", message: "Ghost Room API is running" });
  }

  if (!global.rooms[room]) {
    global.rooms[room] = { messages: [] };
  }

  if (message) {
    global.rooms[room].messages.push({
      text: message,
      time: Date.now(),
    });
  }

  return res.json({
    room,
    messages: global.rooms[room].messages,
  });
}
