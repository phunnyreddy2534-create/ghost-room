export function initMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("menuOverlay");
  const exitBtn = document.getElementById("exitBtn");
  const shareBtn = document.getElementById("shareBtn");

  menuBtn.onclick = () => overlay.style.display = "block";
  overlay.onclick = e => {
    if (e.target === overlay) overlay.style.display = "none";
  };

  shareBtn.onclick = async () => {
    if (navigator.share) {
      await navigator.share({ url: location.href });
    } else {
      await navigator.clipboard.writeText(location.href);
      alert("Room link copied");
    }
  };

  exitBtn.onclick = () => {
    overlay.style.display = "none";
    location.href = "/";
  };
}
