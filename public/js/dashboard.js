import { requireAuth } from "../../private/guards.js";
import { db, collection, onSnapshot, query, orderBy } from "../../private/firebase.js";
import { renderShell, initLucide } from "./ui.js";

const { profile } = await requireAuth();
await renderShell({ active: "dashboard" });

document.getElementById("welcome").textContent = `Welcome, ${profile?.firstName || "Member"}`;
document.getElementById("subWelcome").textContent = profile?.role === "admin"
  ? "You have admin privileges." : "Glad to have you here.";

// Animated welcome popup once per session
if (!sessionStorage.getItem("welcomed")) {
  sessionStorage.setItem("welcomed","1");
  Swal.fire({
    title: `Hello, ${profile?.firstName || "Member"}!`,
    text: "Welcome back to Mariki Family Portal.",
    icon: "success", timer: 1600, showConfirmButton: false,
    background:"#0f172a", color:"#fff"
  });
}

// Realtime stats
let totalAmount = 0;
let contribCount = 0;
const cache = { members:[], contribs:[], news:[] };

onSnapshot(collection(db, "users"), (snap)=>{
  cache.members = snap.docs.map(d=>d.data());
  document.getElementById("statMembers").textContent = snap.size;
});
onSnapshot(query(collection(db,"contributions"), orderBy("createdAt","desc")), (snap)=>{
  cache.contribs = snap.docs.map(d=>({id:d.id, ...d.data()}));
  contribCount = snap.size;
  totalAmount = cache.contribs.reduce((a,c)=> a + (Number(c.amount)||0), 0);
  document.getElementById("statContribs").textContent = contribCount;
  document.getElementById("statTotal").textContent = totalAmount.toLocaleString() + " Tsh";
  renderActivity();
});
onSnapshot(query(collection(db,"announcements"), orderBy("createdAt","desc")), (snap)=>{
  cache.news = snap.docs.map(d=>({id:d.id, ...d.data()}));
  document.getElementById("statNews").textContent = snap.size;
  renderActivity();
});

function renderActivity(){
  const items = [
    ...cache.contribs.slice(0,5).map(c=>({t:"Contribution", txt:`${c.userName||"Member"} — ${c.typeTitle||""} ${c.amount||""} ${c.unit||""}`, time:c.createdAt})),
    ...cache.news.slice(0,5).map(n=>({t:"Announcement", txt:n.title, time:n.createdAt})),
  ].sort((a,b)=> (b.time?.seconds||0) - (a.time?.seconds||0)).slice(0,8);
  const el = document.getElementById("activity");
  el.innerHTML = items.length ? items.map(i=>`
    <div class="flex items-center justify-between glass px-3 py-2">
      <div><span class="opacity-70 mr-2">[${i.t}]</span>${i.txt||""}</div>
      <div class="opacity-60 text-xs">${i.time?.toDate ? i.time.toDate().toLocaleString() : ""}</div>
    </div>`).join("") : '<div class="opacity-70">No activity yet.</div>';
  initLucide();
}

document.getElementById("exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(cache, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "mariki-export.json"; a.click();
});
