const SUPABASE_URL = "https://ehvusntvwsxguqebfc.supabase.co";
const SUPABASE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (!room) {
  alert("Room not found");
  location.href = "index.html";
}

document.getElementById("roomIdLabel").textContent = `Room ID: ${room}`;

const box = document.getElementById("messages");
const input = document.getElementById("msg");

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({
    room_code: room,
    content: text
  });

  input.value = "";
  loadMessages();
}

async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("room_code", room)
    .order("created_at", { ascending: true });

  box.innerHTML = "";
  data.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = m.content;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function shareRoom() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: "Ghost Room",
      text: "Join my anonymous Ghost Room",
      url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Room link copied");
  }
}

loadMessages();
setInterval(loadMessages, 3000);
