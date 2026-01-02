const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const roomTitle = document.getElementById("roomTitle");

roomTitle.innerText = `Room: ${roomId}`;

function addMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.onclick = async () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  addMessage("You: " + msg);
  messageInput.value = "";

  await fetch("/api/index.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room: roomId, message: msg })
  });
};
