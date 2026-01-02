let currentRoom = null;

const roomInput = document.getElementById("roomInput");
const chatBox = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");

document.getElementById("joinBtn").onclick = joinRoom;
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("createRoomBtn").onclick = createRoom;

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

function createRoom() {
  const roomId = generateRoomId();
  roomInput.value = roomId;
  joinRoom();
}

async function joinRoom() {
  const roomId = roomInput.value.trim();
  if (!roomId) return alert("Enter Room ID");

  currentRoom = roomId;
  chatBox.innerHTML = `<p><em>Joined room: ${roomId}</em></p>`;
}

async function sendMessage() {
  if (!currentRoom) return alert("Join a room first");

  const text = messageInput.value.trim();
  if (!text) return;

  const res = await fetch("/api/index.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room: currentRoom, message: text }),
  });

  const data = await res.json();

  chatBox.innerHTML += `<p>${data.message}</p>`;
  messageInput.value = "";
}
