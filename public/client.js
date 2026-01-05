const params = new URLSearchParams(location.search);
const room = params.get("room");

const roomLabel = document.getElementById("roomId");
const messages = document.getElementById("messages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const shareBtn = document.getElementById("shareBtn");

roomLabel.textContent = `Room ID: ${room}`;

sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage("you", text);
  input.value = "";
};

shareBtn.onclick = async () => {
  const url = location.href;
  if (navigator.share) {
    await navigator.share({ title: "Ghost Room", url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("Room link copied");
  }
};

function addMessage(type, text) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
