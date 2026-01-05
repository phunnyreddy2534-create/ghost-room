// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co"; // your project URL
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ";       // sb_publishable_...

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// ROOM CODE
// ===============================
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

if (!roomCode) {
  alert("Room code missing");
  throw new Error("No room code");
}

// ===============================
// ELEMENTS
// ===============================
const messagesBox = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// ===============================
// SEND MESSAGE
// ===============================
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const { error } = await supabase.from("messages").insert({
    room_code: roomCode,
    content: text
  });

  if (error) {
    console.error(error);
    alert("Message failed");
    return;
  }

  input.value = "";
}

// Button click (mobile safe)
sendBtn.addEventListener("click", sendMessage);

// Enter key support
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

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
    console.error(error);
    return;
  }

  messagesBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = msg.content;
    messagesBox.appendChild(div);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ===============================
// START
// ===============================
fetchMessages();
setInterval(fetchMessages, 3000);
