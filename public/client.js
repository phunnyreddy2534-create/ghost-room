const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ";

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
}

async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("room_code", room)
    .order("created_at", { ascending: true });

  box.innerHTML = "";
  data.forEach(m => {
    const d = document.createElement("div");
    d.className = "msg";
    d.textContent = m.content;
    box.appendChild(d);
  });

  box.scrollTop = box.scrollHeight;
}

function shareRoom() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert("Room link copied");
}

loadMessages();
setInterval(loadMessages, 3000);
