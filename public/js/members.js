import { requireAuth } from "../../private/guards.js";
import { db, collection, onSnapshot } from "../../private/firebase.js";
import { updateMember, deleteMember } from "../../private/admin.js";
import { renderShell, initLucide, toast } from "./ui.js";

const { profile } = await requireAuth();
await renderShell({ active: "members" });
const isAdmin = profile?.role === "admin";

let members = [];
const grid = document.getElementById("grid");
const search = document.getElementById("search");
const filterGender = document.getElementById("filterGender");

onSnapshot(collection(db,"users"), (snap)=>{
  members = snap.docs.map(d=>({ id:d.id, ...d.data() }));
  render();
});

function render(){
  const q = search.value.trim().toLowerCase();
  const g = filterGender.value;
  const list = members.filter(m=>{
    const text = `${m.fullName||""} ${m.region||""} ${m.district||""} ${m.email||""}`.toLowerCase();
    return (!q || text.includes(q)) && (!g || m.gender === g);
  });
  grid.innerHTML = list.length ? list.map(m=>`
    <div class="glass p-5 fade-in">
      <div class="flex items-center gap-3">
        <img src="${m.photoURL||'assets/avatar.svg'}" class="w-14 h-14 rounded-xl object-cover border border-white/10" onerror="this.src='assets/avatar.svg'"/>
        <div class="flex-1 min-w-0">
          <div class="font-semibold truncate">${m.fullName||"—"}</div>
          <div class="text-xs opacity-70 truncate">${m.occupation||""}</div>
        </div>
        ${m.role==="admin"?'<span class="badge" style="background:#6366f1">Admin</span>':''}
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${m.region||"—"}</div>
        <div><i data-lucide="building-2" class="w-3 h-3 inline"></i> ${m.district||"—"}</div>
        <div><i data-lucide="phone" class="w-3 h-3 inline"></i> ${m.phone||"—"}</div>
        <div><i data-lucide="mail" class="w-3 h-3 inline"></i> <span class="truncate">${m.email||"—"}</span></div>
      </div>
      ${m.partner ? `
        <div class="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          <img src="${m.partner.photoURL||'assets/avatar.svg'}" class="w-9 h-9 rounded-lg object-cover" onerror="this.src='assets/avatar.svg'"/>
          <div class="text-xs">
            <div class="opacity-70">${m.relationship}</div>
            <div class="font-medium">${[m.partner.firstName,m.partner.lastName].filter(Boolean).join(" ")||"—"}</div>
          </div>
        </div>` : ''}
      ${isAdmin ? `
        <div class="mt-3 flex gap-2">
          <button data-edit="${m.id}" class="btn-ghost text-xs"><i data-lucide="pencil" class="w-3 h-3 inline"></i> Edit role</button>
          <button data-del="${m.id}" class="btn-ghost text-xs" style="border-color:#ef4444;color:#ef4444"><i data-lucide="trash" class="w-3 h-3 inline"></i> Delete</button>
        </div>` : ''}
    </div>`).join("") : '<div class="opacity-70">No members found.</div>';
  initLucide();

  grid.querySelectorAll("[data-edit]").forEach(b=> b.onclick = ()=> editRole(b.dataset.edit));
  grid.querySelectorAll("[data-del]").forEach(b=> b.onclick = ()=> removeMember(b.dataset.del));
}

async function editRole(id){
  const m = members.find(x=>x.id===id);
  const { value: role } = await Swal.fire({
    title:"Set role", input:"select",
    inputOptions: { member:"Member", admin:"Admin" },
    inputValue: m?.role || "member",
    background:"#0f172a", color:"#fff", showCancelButton:true
  });
  if(role){ await updateMember(id, { role }); toast("Role updated"); }
}
async function removeMember(id){
  const r = await Swal.fire({ title:"Delete member?", text:"This removes the user record.", icon:"warning",
    showCancelButton:true, background:"#0f172a", color:"#fff", confirmButtonColor:"#ef4444" });
  if(r.isConfirmed){ await deleteMember(id); toast("Member deleted"); }
}

search.addEventListener("input", render);
filterGender.addEventListener("change", render);

document.getElementById("exportCsv").addEventListener("click", ()=>{
  const cols = ["fullName","gender","phone","email","region","district","occupation","relationship","role"];
  const rows = [cols.join(",")].concat(members.map(m=> cols.map(c=> `"${(m[c]??"").toString().replace(/"/g,'""')}"`).join(",")));
  const blob = new Blob([rows.join("\n")], { type:"text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "members.csv"; a.click();
});
