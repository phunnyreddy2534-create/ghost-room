import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  window.IRA_CONFIG.SUPABASE_URL,
  window.IRA_CONFIG.SUPABASE_ANON_KEY
);

let roomCode;
let channel;

export function initMessages(validRoomCode){
  roomCode = validRoomCode;

  const messagesEl = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.onclick = sendMessage;
  input.onkeydown = e => e.key === "Enter" && sendMessage();

  loadHistory();
  subscribe();

  async function sendMessage(){
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    await supabase.from("messages").insert({
      room_code: roomCode,
      content: text
    });
  }

  function render(msg){
    const d = document.createElement("div");
    d.className = "msg other";
    d.textContent = msg.content;
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function loadHistory(){
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room_code", roomCode)
      .order("created_at");

    data?.forEach(render);
  }

  function subscribe(){
    channel = supabase
      .channel(`room-${roomCode}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_code=eq.${roomCode}`
      }, payload => render(payload.new))
      .subscribe();
  }
}
