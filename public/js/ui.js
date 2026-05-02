// Shared UI helpers: nav, dark mode, lucide, toast
import { auth, db, onAuthStateChanged, doc, getDoc } from "../../private/firebase.js";
import { logoutUser } from "../../private/auth.js";
import { WHATSAPP_NUMBER } from "../../private/config.js";

export function initLucide(){ if (window.lucide) window.lucide.createIcons(); }

export function initDarkMode(){
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
  document.querySelectorAll("[data-toggle-theme]").forEach(b=>{
    b.addEventListener("click", ()=>{
      document.body.classList.toggle("light");
      localStorage.setItem("theme", document.body.classList.contains("light")?"light":"dark");
    });
  });
}

export function toast(msg, type="success"){
  const colors = { success:"#10b981", error:"#ef4444", info:"#3b82f6" };
  const el = document.createElement("div");
  el.className = "glass pop-in";
  el.style.cssText = `position:fixed;top:1rem;right:1rem;z-index:80;padding:.7rem 1rem;border-left:4px solid ${colors[type]||colors.info}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.transition="opacity .3s"; el.style.opacity=0; setTimeout(()=>el.remove(),300); }, 2400);
}

export function showLoader(on=true){
  let l = document.getElementById("__loader");
  if (!l){
    l = document.createElement("div");
    l.id = "__loader";
    l.className = "loader-overlay";
    l.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(l);
  }
  l.classList.toggle("active", on);
}

export function buildNav(active){
  const items = [
    { href:"dashboard.html",     icon:"layout-dashboard", label:"Dashboard", key:"dashboard" },
    { href:"members.html",       icon:"users",            label:"Members",   key:"members" },
    { href:"contributions.html", icon:"hand-coins",       label:"Contrib.",  key:"contrib" },
    { href:"announcements.html", icon:"megaphone",        label:"News",      key:"news" },
    { href:"sms.html",           icon:"send",             label:"SMS",       key:"sms", adminOnly:true }
  ];
  return { items, active };
}

export async function renderShell({ active }) {
  const profile = await new Promise((res)=>{
    onAuthStateChanged(auth, async (u)=>{
      if(!u){ res(null); return; }
      const s = await getDoc(doc(db,"users",u.uid));
      res(s.exists()?s.data():null);
    });
  });
  const { items } = buildNav(active);
  const visible = items.filter(i=> !i.adminOnly || profile?.role==="admin");

  const top = document.getElementById("topbar");
  if (top) top.innerHTML = `
    <div class="glass desktop-nav flex items-center justify-between px-4 py-3 mb-6 fade-in">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#6366f1,#06b6d4)">
          <i data-lucide="home" class="text-white"></i>
        </div>
        <div>
          <div class="font-bold">Mariki Family Portal</div>
          <div class="text-xs opacity-70">${profile?.fullName || ""} ${profile?.role==="admin"?"· Admin":""}</div>
        </div>
      </div>
      <nav class="flex items-center gap-1">
        ${visible.map(i=>`<a href="${i.href}" class="btn-ghost ${i.key===active?'tab-active':''} flex items-center gap-2"><i data-lucide="${i.icon}" class="w-4 h-4"></i>${i.label}</a>`).join("")}
        <button class="btn-ghost flex items-center gap-2" data-toggle-theme><i data-lucide="sun-moon" class="w-4 h-4"></i></button>
        <button class="btn-ghost flex items-center gap-2" id="logoutBtn"><i data-lucide="log-out" class="w-4 h-4"></i>Logout</button>
      </nav>
    </div>`;

  const bot = document.getElementById("bottombar");
  if (bot) bot.innerHTML = `
    <div class="bottom-nav glass mx-2 mb-2 px-2 py-2 justify-around">
      ${visible.map(i=>`<a href="${i.href}" class="flex flex-col items-center text-xs ${i.key===active?'opacity-100':'opacity-70'}"><i data-lucide="${i.icon}" class="w-5 h-5"></i>${i.label}</a>`).join("")}
      <button class="flex flex-col items-center text-xs opacity-70" data-toggle-theme><i data-lucide="sun-moon" class="w-5 h-5"></i>Theme</button>
      <button class="flex flex-col items-center text-xs opacity-70" id="logoutBtnMobile"><i data-lucide="log-out" class="w-5 h-5"></i>Out</button>
    </div>`;

  // WhatsApp FAB
  if (!document.getElementById("waFab")) {
    const a = document.createElement("a");
    a.id = "waFab"; a.className = "whatsapp-fab"; a.target = "_blank";
    a.href = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g,"")}`;
    a.innerHTML = '<i data-lucide="message-circle" class="text-white"></i>';
    document.body.appendChild(a);
  }

  document.getElementById("logoutBtn")?.addEventListener("click", async ()=>{ await logoutUser(); location.href="login.html"; });
  document.getElementById("logoutBtnMobile")?.addEventListener("click", async ()=>{ await logoutUser(); location.href="login.html"; });

  initDarkMode();
  initLucide();
  return profile;
}

// Offline indicator
window.addEventListener("offline", ()=> toast("You are offline","error"));
window.addEventListener("online",  ()=> toast("Back online","success"));
