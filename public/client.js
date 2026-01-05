// 🔐 SUPABASE CONFIG (replace with your real values)
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// 🔗 ROOM ID
const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

document.getElementById("roomIdLabel").innerText =
  roomId ? `Room ID: ${roomId}` : "Unknown Room";

// 📥 DOM
const msgInput = document.getElementById("msg");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");

// 🚀 SEND MESSAGE
async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({
    room_id: roomId,
    content: text,
  });

  msgInput.value = "";
}

// Enter key support
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

// 📡 RECEIVE MESSAGES (REAL-TIME)
supabase
  .channel("room-" + roomId)
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      if (payload.new.room_id === roomId) {
        addMessage(payload.new.content);
      }
    }
  )
  .subscribe();

// 🧱 MESSAGE UI
function addMessage(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 🔗 SHARE (FIXED – real mobile share)
function shareRoom() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "Ghost Room",
      text: "Join my anonymous room",
      url,
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Room link copied!");
  }
}
