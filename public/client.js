// ===============================
// SUPABASE CONFIG
// ===============================

const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ-";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// ROOM CODE
// ===============================

// room code passed like: room.html?room=ABC123
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

if (!roomCode) {
  alert("Invalid room");
  throw new Error("Room code missing");
}

// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;

  const { error } = await supabase
    .from("messages")
    .insert({
      room_code: roomCode,
      content: text
    });

  if (error) {
    console.error("Send error:", error);
    alert("Message failed");
  }

  input.value = "";
}

// ===============================
// FETCH MESSAGES (POLLING)
// ===============================

async function fetchMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("content, created_at")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  const box = document.getElementById("messages");
  box.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.textContent = msg.content;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

// ===============================
// START POLLING
// ===============================

fetchMessages();
setInterval(fetchMessages, 3000);
