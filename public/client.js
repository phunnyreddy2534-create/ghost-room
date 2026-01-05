alert("client.js loaded");

// ===== ROOM TEST =====
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

alert("Room param = " + room);

const roomLabel = document.getElementById("roomId");
roomLabel.innerText = "Room ID: " + room;

document.getElementById("sendBtn").addEventListener("click", () => {
  alert("Send button clicked");
});

document.getElementById("shareBtn").addEventListener("click", () => {
  alert("Share button clicked");
});
