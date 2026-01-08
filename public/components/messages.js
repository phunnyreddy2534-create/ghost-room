// components/messages.js

import { supabase } from "../services/supabase.js";

let roomCode = null;
let channel = null;

const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

/* ------------------------------
   INIT
--------------------------------*/
export function initMessages() {
  roomCode = new URLSearchParams(location.search).get("room");

  if (!roomCode) {
    console.warn("No room code found");
    return;
  }

  loadHistory();
  initRealtime();
  bindSend();
}

/* ------------------------------
   LOAD HISTORY
--------------------------------*/
async function loadHistory() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Load messages failed:", error);
    return;
  }

  data.forEach(renderMessage);
  scrollBottom();
}

/* ------------------------------
   REALTIME
--------------------------------*/
function initRealtime() {
  channel = supabase
    .channel(`room-${roomCode}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_code=eq.${roomCode}`
      },
      payload => {
        renderMessage(payload.new);
        scrollBottom();
      }
    )
    .subscribe();
}

/* ------------------------------
   SEND MESSAGE
--------------------------------*/
function bindSend() {
  sendBtn.addEventListener("click", sendMessage);

  msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
}

async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = "";

  const { error } = await supabase.from("messages").insert({
    room_code: roomCode,
    content: text,
    sender: "anon"
  });

  if (error) {
    console.error("Send failed:", error);
  }
}

/* ------------------------------
   RENDER
--------------------------------*/
function renderMessage(message) {
  const bubble = document.createElement("div");

  bubble.className =
    message.sender === "anon" ? "msg you" : "msg other";

  bubble.textContent = message.content;
  messagesEl.appendChild(bubble);
}

/* ------------------------------
   HELPERS
--------------------------------*/
function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ------------------------------
   CLEANUP (future use)
--------------------------------*/
export function destroyMessages() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
}
