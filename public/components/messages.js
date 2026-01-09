import { supabase } from "../services/supabase.js";

export function initMessages() {
  const roomCode = new URLSearchParams(location.search).get("room");
  const messagesEl = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");
  const emptyHint = document.getElementById("emptyHint");

  if (!roomCode || !sendBtn || !input) {
    console.error("Missing room or UI elements");
    return;
  }

  /* ===== LOAD EXISTING MESSAGES ===== */
  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Load messages error:", error);
      return;
    }

    if (data.length > 0) {
      emptyHint.style.display = "none";
    }

    data.forEach(addMessage);
  }

  /* ===== ADD MESSAGE TO UI ===== */
  function addMessage(msg) {
    emptyHint.style.display = "none";

    const div = document.createElement("div");
    div.className = "message";
    div.textContent = msg.content;

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ===== SEND MESSAGE ===== */
  sendBtn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    const { error } = await supabase.from("messages").insert({
      room_code: roomCode,
      content: text
    });

    if (error) {
      console.error("Insert failed:", error);
      alert("Message failed to send");
    }
  };

  /* ===== REALTIME ===== */
  supabase
    .channel(`room-${roomCode}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_code=eq.${encodeURIComponent(roomCode)}`
      },
      payload => {
        addMessage(payload.new);
      }
    )
    .subscribe();

  loadMessages();
}
