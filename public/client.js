import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 Supabase config
const SUPABASE_URL = "https://ehvusinvfwsaxguuebfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_4VQ8U9nDCSA9T8wv2oJHRA_q8ANRMZ-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const roomTitle = document.getElementById("roomTitle");

// Get room from URL
const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

if (!roomId) {
  alert("Invalid room");
  window.location.href = "/";
}

roomTitle.innerText = `👻 Room: ${roomId}`;

// Add message to UI
function addMessage(text) {
  const div = document.createElement("div");
  div.className = "chat-msg";
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Load old messages
async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select("content")
    .eq("room_code", roomId)
    .order("created_at", { ascending: true });

  chatBox.innerHTML = "";
  data.forEach(m => addMessage(m.content));
}

// Send message
sendBtn.onclick = async () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  await supabase.from("messages").insert({
    room_code: roomId,
    content: msg
  });

  messageInput.value = "";
};

// Realtime listener
supabase
  .channel("room-" + roomId)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_code=eq.${roomId}`
    },
    payload => {
      addMessage(payload.new.content);
    }
  )
  .subscribe();

loadMessages();
