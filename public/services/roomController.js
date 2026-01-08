// services/roomController.js
import { supabase } from "./supabase.js";
import { initRoomLifecycle, cleanup } from "./roomLifecycle.js";

/* --------------------------------
   DOM
---------------------------------*/
const qs = id => document.getElementById(id);

const menuBtn     = qs("menuBtn");
const menuOverlay = qs("menuOverlay");
const sendBtn     = qs("sendBtn");
const msgInput    = qs("msgInput");
const messagesEl  = qs("messages");
const shareBtn    = qs("shareBtn");
const exitBtn     = qs("exitBtn");

/* --------------------------------
   ROOM
---------------------------------*/
const roomCode = new URLSearchParams(location.search).get("room");
if (!roomCode) location.href = "/";

/* --------------------------------
   MENU
---------------------------------*/
menuBtn.onclick = () => {
  menuOverlay.style.display = "block";
};

menuOverlay.onclick = e => {
  if (e.target === menuOverlay) {
    menuOverlay.style.display = "none";
  }
};

/* --------------------------------
   SHARE
---------------------------------*/
shareBtn.onclick = async () => {
  try {
    if (navigator.share) {
      await navigator.share({ url: location.href });
    } else {
      await navigator.clipboard.writeText(location.href);
      alert("Room link copied");
    }
  } catch (_) {}
};

/* --------------------------------
   EXIT
---------------------------------*/
exitBtn.onclick = () => {
  cleanup();
  location.href = "/";
};

/* --------------------------------
   SEND MESSAGE
---------------------------------*/
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = "";

  await supabase.from("messages").insert({
    room_code: roomCode,
    content: text
  });
};

/* --------------------------------
   RENDER MESSAGE
---------------------------------*/
function renderMessage(msg) {
  const d = document.createElement("div");
  d.className = "msg other";
  d.textContent = msg.content;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* --------------------------------
   LOAD HISTORY
---------------------------------*/
async function loadHistory() {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: true });

  data?.forEach(renderMessage);
}

/* --------------------------------
   REALTIME
---------------------------------*/
const channel = supabase
  .channel("room-" + roomCode)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room_code=eq.${roomCode}`
    },
    payload => renderMessage(payload.new)
  )
  .subscribe();

/* --------------------------------
   LIFECYCLE
---------------------------------*/
initRoomLifecycle({
  channel,
  onFade() {
    document.body.classList.add("fading");
    document.querySelectorAll(".msg").forEach(m => m.classList.add("faded"));
  },
  onRestore() {
    document.body.classList.remove("fading");
    document.querySelectorAll(".msg").forEach(m => m.classList.remove("faded"));
  },
  onExit() {
    cleanup();
    location.href = "/";
  }
});

/* --------------------------------
   START
---------------------------------*/
loadHistory();

/* --------------------------------
   SAFETY
---------------------------------*/
window.addEventListener("beforeunload", cleanup);
