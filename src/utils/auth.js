const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const USER_KEY = "soulify_user";
const GUEST_ID_KEY = "soulify_user_id";

export function getLoggedInUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (user?.id || user?.email) return user;
  } catch {
    return null;
  }
  return null;
}

/** MongoDB user id (or email fallback for legacy sessions). Null if not logged in. */
export function getUserId() {
  const user = getLoggedInUser();
  if (!user) return null;
  if (user.id) return user.id;
  if (user.email) return user.email;
  return null;
}

export function isLoggedIn() {
  return !!getUserId();
}

export function persistLogin(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getGuestUserId() {
  return localStorage.getItem(GUEST_ID_KEY) || null;
}

export function clearGuestUserId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

/** After login: attach guest/email chat sessions to the real account. */
export async function finalizeLogin(user) {
  if (!user) return;
  persistLogin(user);
  const realId = user.id;
  if (!realId) {
    clearGuestUserId();
    return;
  }

  const sources = new Set();
  const guestId = getGuestUserId();
  if (guestId && guestId !== realId) sources.add(guestId);
  if (user.email && user.email !== realId) sources.add(user.email);

  for (const fromUserId of sources) {
    try {
      await fetch(`${API_BASE}/chat/migrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: realId })
      });
    } catch (err) {
      console.warn("Could not migrate chat sessions:", err);
    }
  }
  clearGuestUserId();
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  clearGuestUserId();
  sessionStorage.removeItem("soulify_session_id");
}
