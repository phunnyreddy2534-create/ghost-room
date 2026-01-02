const roomInput = document.getElementById("roomInput");
const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("msg");

let currentRoom = "";

async function createRoom() {
  currentRoom = Math.random().toString(36).substring(2, 8);
  roomInput.value = currentRoom;
  joinRoom();
}

async function joinRoom() {
  currentRoom = roomInput.value.trim();
  loadMessages();
}

async function sendMsg() {
  if (!currentRoom) return;

  await fetch(`/api?room=${currentRoom}&message=${encodeURIComponent(msgInput.value)}`);
  msgInput.value = "";
  loadMessages();
}

async function loadMessages() {
  const res = await fetch(`/api?room=${currentRoom}`);
  const data = await res.json();

  chatBox.innerHTML = "";
  data.messages.forEach(m => {
    const div = document.createElement("div");
    div.textContent = m.text;
    chatBox.appendChild(div);
  });
}
