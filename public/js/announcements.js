import { requireAuth } from "../../private/guards.js";
import { db, collection, onSnapshot, query, orderBy } from "../../private/firebase.js";
import { postAnnouncement } from "../../private/admin.js";
import { renderShell, initLucide, toast, showLoader } from "./ui.js";

const { profile } = await requireAuth();
await renderShell({ active: "news" });
if (profile?.role === "admin") document.getElementById("adminPanel").classList.remove("hidden");

document.getElementById("newsForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target).entries());
  showLoader(true);
  try{ await postAnnouncement({ ...fd, author: profile?.fullName || "Admin" }); toast("Posted"); e.target.reset(); }
  catch(err){ toast(err.message,"error"); }
  finally{ showLoader(false); }
});

const lastSeen = Number(localStorage.getItem("news:lastSeen") || 0);
let newest = lastSeen;

onSnapshot(query(collection(db,"announcements"), orderBy("createdAt","desc")), (snap)=>{
  const items = snap.docs.map(d=>({id:d.id, ...d.data()}));
  const el = document.getElementById("list");
  el.innerHTML = items.length ? items.map(a=>`
    <div class="glass p-4 fade-in">
      <div class="flex items-center justify-between">
        <div class="font-semibold">${a.title||""}</div>
        <div class="text-xs opacity-70">${a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""}</div>
      </div>
      <div class="text-sm opacity-90 mt-1 whitespace-pre-wrap">${(a.body||"").replace(/</g,"&lt;")}</div>
      <div class="text-xs opacity-60 mt-2">— ${a.author||"Admin"}</div>
    </div>`).join("") : '<div class="opacity-70">No announcements yet.</div>';
  initLucide();

  // Notification badge for new since lastSeen
  newest = Math.max(...items.map(i=> i.createdAt?.seconds || 0), 0);
  const unread = items.filter(i=> (i.createdAt?.seconds||0) > lastSeen).length;
  const badge = document.getElementById("badge");
  if (unread > 0){ badge.textContent = unread; badge.classList.remove("hidden"); } else { badge.classList.add("hidden"); }
  // Mark seen on viewing
  setTimeout(()=> localStorage.setItem("news:lastSeen", String(newest)), 1500);
});
