/* ================================
   SUPABASE CONFIG
================================ */
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ-";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ================================
   STATE
================================ */
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const roomTitle = document.getElementById("roomTitle");

roomTitle.innerText = `Room: ${roomCode}`;

/* ================================
   UTIL
================================ */
function addMessage(text, system = false) {
  const div = document.createElement("div");
  div.className = system ? "system-msg" : "chat-msg";
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ================================
   LOAD HISTORY
================================ */
async function loadHistory() {
  const { data, error } = await supabase
    .from("messages")
    .select("content")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error(error);
    return;
  }

  chatBox.innerHTML = "";
  data.forEach((m) => addMessage(m.content));
}

/* ================================
   SEND MESSAGE
================================ */
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({
    room_code: roomCode,
    sender: "anon",
    content: text,
  });

  messageInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* ================================
   REALTIME SUBSCRIPTION
================================ */
supabase
  .channel(`room-${roomCode}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_code=eq.${roomCode}`,
    },
    (payload) => {
      addMessage(payload.new.content);
    }
  )
  .subscribe();

/* ================================
   INIT
================================ */
addMessage("Joined room", true);
loadHistory();
