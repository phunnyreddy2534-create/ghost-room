// Create new room
document.getElementById("createBtn").addEventListener("click", () => {
  const roomId = Math.random().toString(36).substring(2, 8);
  window.location.href = `/room.html?room=${roomId}`;
});

// Join existing room
document.getElementById("joinBtn").addEventListener("click", () => {
  const roomInput = document.getElementById("roomInput");
  const roomId = roomInput.value.trim();

  if (!roomId) {
    alert("Enter a Room ID");
    return;
  }

  window.location.href = `/room.html?room=${roomId}`;
});
