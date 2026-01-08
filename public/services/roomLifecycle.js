// services/roomLifecycle.js

let lastActivity = Date.now();
let idleInterval = null;
let exitTimeout = null;
let activeChannel = null;

const IDLE_FADE_TIME = 60 * 1000;     // 1 min
const AUTO_EXIT_TIME = 30 * 60 * 1000; // 30 min

/* --------------------------------
   INIT ROOM LIFECYCLE
---------------------------------*/
export function initRoomLifecycle({
  channel,
  onFade,
  onRestore,
  onExit
}) {
  activeChannel = channel;

  trackActivity();
  startIdleWatcher(onFade, onRestore, onExit);
}

/* --------------------------------
   ACTIVITY TRACKING
---------------------------------*/
function trackActivity() {
  const reset = () => {
    lastActivity = Date.now();
  };

  ["click", "keydown", "touchstart"].forEach(evt => {
    document.addEventListener(evt, reset, { passive: true });
  });
}

/* --------------------------------
   IDLE / EXIT WATCHER
---------------------------------*/
function startIdleWatcher(onFade, onRestore, onExit) {
  idleInterval = setInterval(() => {
    const idle = Date.now() - lastActivity;

    if (idle > IDLE_FADE_TIME) {
      onFade?.();
    } else {
      onRestore?.();
    }

    if (idle > AUTO_EXIT_TIME) {
      cleanup();
      onExit?.();
    }
  }, 1200);
}

/* --------------------------------
   CLEANUP
---------------------------------*/
export function cleanup() {
  if (idleInterval) clearInterval(idleInterval);
  if (exitTimeout) clearTimeout(exitTimeout);

  if (activeChannel) {
    try {
      activeChannel.unsubscribe();
    } catch (_) {}
  }

  idleInterval = null;
  exitTimeout = null;
  activeChannel = null;
}
