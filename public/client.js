const socket = io();

let currentRoom = null;

function joinRoom() {
  const room = document.getElementById("room").value.trim();
  if (!room) return alert("Enter room ID");

  currentRoom = room;
  document.getElementById("chat").innerHTML = "";

  socket.emit("join-room", room);
}

function sendMessage() {
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text || !currentRoom) return;

  socket.emit("message", {
    roomId: currentRoom,
    message: text
  });

  input.value = "";
}

socket.on("message", msg => {
  const div = document.createElement("div");
  div.textContent = msg.text;
  document.getElementById("chat").appendChild(div);
});

socket.on("chat-history", messages => {
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.textContent = msg.text;
    document.getElementById("chat").appendChild(div);
  });
});
