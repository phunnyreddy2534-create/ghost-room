// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodnVzaW52ZndzYXhndXVlYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTcyMzYsImV4cCI6MjA4MjkzMzIzNn0.6W8OrbTz6RhN3P3R0KIN80Ec9GlkoMF4F0-Q4xRyy48";

// ✅ Correct global access (UMD)
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===== ROOM =====
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (!room) {
  alert("Room ID missing");
  location.href = "/";
}

// ===== ELEMENTS =====
const roomLabel = document.getElementById("roomId");
const messagesBox = document.getElementById("messages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const shareBtn = document.getElementById("shareBtn");

roomLabel.innerText = `Room ID: ${room}`;

// ===== SEND MESSAGE =====
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  const { error } = await supabase.from("messages").insert({
    room_code: room,
    content: text
  });

  if (error) {
    alert("Message failed");
  }
});

// ===== RECEIVE MESSAGES (REALTIME) =====
supabase
  .channel(`room-${room}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_code=eq.${room}`
    },
    payload => {
      const div = document.createElement("div");
      div.className = "msg";
      div.innerText = payload.new.content;
      messagesBox.appendChild(div);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  )
  .subscribe();

// ===== SHARE =====
shareBtn.addEventListener("click", async () => {
  const url = location.href;
  if (navigator.share) {
    await navigator.share({ title: "Ghost Room", url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("Room link copied");
  }
});
