// 🔗 CHANGE THIS AFTER DEPLOYING BACKEND
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL);

let currentRoom = null;
let isCreator = false;

// CREATE ROOM
function createRoom() {
  const roomId = document.getElementById("roomId").value.trim();
  if (!roomId) {
    alert("Enter Room ID");
    return;
  }

  isCreator = true;
  currentRoom = roomId;

  socket.emit("create-room", {
    roomId,
    messageTTL: 30000, // 30 seconds
    roomTTL: 10 * 60 * 1000 // 10 minutes
  });

  openChat();
}

// JOIN ROOM
function joinRoom() {
  const roomId = document.getElementById("roomId").value.trim();
  if (!roomId) {
    alert("Enter Room ID");
    return;
  }

  currentRoom = roomId;
  isCreator = false;

  socket.emit("join-room", { roomId });
  openChat();
}

// SEND MESSAGE
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentRoom) return;

  socket.emit("send-message", {
    roomId: currentRoom,
    message: text
  });

  addMessage("You: " + text, 30000);
  input.value = "";
}

// RECEIVE MESSAGE
socket.on("receive-message", (data) => {
  addMessage("Stranger: " + data.message, data.expiresAt - Date.now());
});

// ADD MESSAGE WITH AUTO DELETE
function addMessage(text, ttl) {
  const msgBox = document.createElement("div");
  msgBox.className = "message";
  msgBox.textContent = text;

  document.getElementById("messages").appendChild(msgBox);

  setTimeout(() => {
    msgBox.remove();
  }, ttl || 30000);
}

// PANIC / KILL SWITCH
function panic() {
  if (!currentRoom) return;

  socket.emit("panic", {
    roomId: currentRoom,
    redirect: "https://www.youtube.com"
  });
}

// HANDLE PANIC EVENT
socket.on("panic", (data) => {
  window.location.href = data.redirectTo;
});

// UI
function openChat() {
  document.getElementById("room-controls").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
}

// ERROR HANDLING
socket.on("room-error", (msg) => {
  alert(msg);
  location.reload();
});
