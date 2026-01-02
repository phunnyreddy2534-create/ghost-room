const socket = io({
  path: "/api/socket",
});

let currentRoom = null;

const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const chatBox = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Utility
function addMessage(text, type = "user") {
  const div = document.createElement("div");
  div.className = type === "system" ? "system-msg" : "chat-msg";
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Create Room
createBtn.addEventListener("click", () => {
  const roomId = Math.random().toString(36).substring(2, 8);
  roomInput.value = roomId;
  joinRoom(roomId);
});

// Join Room
joinBtn.addEventListener("click", () => {
  const roomId = roomInput.value.trim();
  if (!roomId) return alert("Enter room ID");
  joinRoom(roomId);
});

function joinRoom(roomId) {
  currentRoom = roomId;
  chatBox.innerHTML = "";
  addMessage(`Joined room: ${roomId}`, "system");
  socket.emit("join-room", roomId);
}

// Send Message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg || !currentRoom) return;

  socket.emit("message", {
    roomId: currentRoom,
    message: msg,
  });

  messageInput.value = "";
}

// Receive history
socket.on("chat-history", (messages) => {
  messages.forEach((m) => {
    addMessage(m.text);
  });
});

// Receive new messages
socket.on("message", (msg) => {
  addMessage(msg.text);
});

// System messages
socket.on("system", (msg) => {
  addMessage(msg, "system");
});
