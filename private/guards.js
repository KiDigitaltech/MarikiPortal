// Route guards: protect private pages, role-based access
import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase.js";

export function requireAuth({ adminOnly = false } = {}) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.exists() ? snap.data() : null;
      if (adminOnly && profile?.role !== "admin") {
        window.location.href = "dashboard.html";
        return;
      }
      resolve({ user, profile });
    });
  });
}

export function redirectIfAuthed() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? snap.data().role : "member";
      window.location.href = role === "admin" ? "dashboard.html" : "dashboard.html";
    }
  });
}
