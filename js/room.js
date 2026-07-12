// Change your room password:
// 1. Pick a password
// 2. Run: echo -n "your-password" | shasum -a 256
// 3. Replace ROOM_PASSWORD_HASH below with the output

const ROOM_PASSWORD_HASH =
  "057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86"; // default: changeme

const SESSION_KEY = "room-auth";

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function showRoom() {
  document.getElementById("room-gate").classList.add("hidden");
  document.getElementById("room-content").classList.add("unlocked");
}

function showError() {
  document.getElementById("room-error").classList.add("visible");
}

function hideError() {
  document.getElementById("room-error").classList.remove("visible");
}

async function checkPassword(password) {
  const hash = await hashPassword(password);
  return hash === ROOM_PASSWORD_HASH;
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showRoom();
    return;
  }

  const form = document.getElementById("room-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const input = document.getElementById("room-password");
    const valid = await checkPassword(input.value);

    if (valid) {
      sessionStorage.setItem(SESSION_KEY, "true");
      showRoom();
    } else {
      showError();
      input.value = "";
      input.focus();
    }
  });
});
