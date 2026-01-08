// components/menu.js

let menuBtn;
let menuOverlay;
let shareBtn;
let exitBtn;

/* ------------------------------
   INIT
--------------------------------*/
export function initMenu() {
  menuBtn = document.getElementById("menuBtn");
  menuOverlay = document.getElementById("menuOverlay");
  shareBtn = document.getElementById("shareBtn");
  exitBtn = document.getElementById("exitBtn");

  if (!menuBtn || !menuOverlay) {
    console.warn("Menu elements missing");
    return;
  }

  bindMenu();
  bindShare();
  bindExit();
}

/* ------------------------------
   MENU OPEN / CLOSE
--------------------------------*/
function bindMenu() {
  menuBtn.addEventListener("click", () => {
    menuOverlay.style.display = "block";
  });

  menuOverlay.addEventListener("click", e => {
    if (e.target === menuOverlay) {
      menuOverlay.style.display = "none";
    }
  });
}

/* ------------------------------
   SHARE QUIETLY
--------------------------------*/
function bindShare() {
  if (!shareBtn) return;

  shareBtn.addEventListener("click", async () => {
    const url = location.href;

    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Room link copied quietly");
      }
    } catch (err) {
      console.warn("Share cancelled");
    }
  });
}

/* ------------------------------
   LEAVE ROOM
--------------------------------*/
function bindExit() {
  if (!exitBtn) return;

  exitBtn.addEventListener("click", () => {
    // soft fade (no CSS changes required)
    document.body.style.transition = "opacity .4s ease";
    document.body.style.opacity = "0";

    setTimeout(() => {
      location.href = "/";
    }, 420);
  });
}
