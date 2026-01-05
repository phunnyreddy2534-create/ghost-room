// ===== SUPABASE CONFIG =====
// 🔴 IMPORTANT: replace with YOUR actual values
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ";

const supabase = supabaseJs.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===== ROOM SETUP =====
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (!room) {
  alert("Room ID missing");
  location.href = "/";
}

const roomLabel = document.getElementById("roomId");
const messagesBox = document.getElementById("messages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const shareBtn = document.getElementById("shareBtn");

roomLabel.innerText = `Room ID: ${room}`;

// ===== SEND MESSAGE =====
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  const { error } = await supabase
    .from("messages")
    .insert([
      {
        room_code: room,
        sender: "anon",
        content: text
      }
    ]);

  if (error) {
    console.error("Insert error:", error.message);
    alert("Message failed");
  }
};

// ===== RECEIVE MESSAGES (REALTIME) =====
supabase
  .channel("room-" + room)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_code=eq.${room}`
    },
    payload => {
      addMessage(payload.new.content);
    }
  )
  .subscribe();

// ===== UI HELPERS =====
function addMessage(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerText = text;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ===== SHARE =====
shareBtn.onclick = async () => {
  const url = location.href;
  if (navigator.share) {
    await navigator.share({ title: "Ghost Room", url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("Room link copied");
  }
};
