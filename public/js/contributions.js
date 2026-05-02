import { requireAuth } from "../../private/guards.js";
import { db, collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp } from "../../private/firebase.js";
import { createContributionType } from "../../private/admin.js";
import { renderShell, initLucide, toast, showLoader } from "./ui.js";

const { user, profile } = await requireAuth();
await renderShell({ active: "contrib" });
const isAdmin = profile?.role === "admin";
if (isAdmin) document.getElementById("adminPanel").classList.remove("hidden");

document.getElementById("typeForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target).entries());
  fd.amount = Number(fd.amount);
  showLoader(true);
  try{ await createContributionType(fd); toast("Contribution type created"); e.target.reset(); }
  catch(err){ toast(err.message,"error"); }
  finally{ showLoader(false); }
});

let types = [];
onSnapshot(query(collection(db,"contributionTypes"), orderBy("createdAt","desc")), (snap)=>{
  types = snap.docs.map(d=>({ id:d.id, ...d.data() }));
  const el = document.getElementById("typesList");
  el.innerHTML = types.length ? types.map(t=>`
    <div class="glass p-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="font-semibold truncate">${t.title}</div>
        <div class="text-xs opacity-70 truncate">${t.description||""}</div>
        <div class="text-xs mt-1 opacity-80">${t.amount} ${t.unit}</div>
      </div>
      <button class="btn-primary" data-id="${t.id}"><i data-lucide="hand-coins" class="w-4 h-4 inline"></i> Submit</button>
    </div>`).join("") : '<div class="opacity-70">No contributions yet.</div>';
  initLucide();
  el.querySelectorAll("[data-id]").forEach(b=> b.onclick = ()=> submit(b.dataset.id));
});

async function submit(typeId){
  const t = types.find(x=>x.id===typeId); if(!t) return;
  const { value: amount } = await Swal.fire({
    title: t.title, input:"number", inputValue: t.amount, inputAttributes:{min:0,step:"0.01"},
    text: `Default: ${t.amount} ${t.unit}`, showCancelButton:true,
    background:"#0f172a", color:"#fff"
  });
  if (amount === undefined) return;
  showLoader(true);
  try{
    const docRef = await addDoc(collection(db,"contributions"), {
      userId: user.uid, userName: profile?.fullName || profile?.firstName || "Member",
      typeId, typeTitle: t.title, amount: Number(amount), unit: t.unit,
      status: "pending", createdAt: serverTimestamp()
    });
    showReceipt({ id: docRef.id, title:t.title, amount, unit:t.unit, name: profile?.fullName });
    toast("Contribution submitted");
  } catch(err){ toast(err.message,"error"); }
  finally{ showLoader(false); }
}

function showReceipt(r){
  const html = `
    <div style="text-align:left">
      <div><b>Receipt #:</b> ${r.id.slice(0,8).toUpperCase()}</div>
      <div><b>Member:</b> ${r.name||"—"}</div>
      <div><b>Type:</b> ${r.title}</div>
      <div><b>Amount:</b> ${r.amount} ${r.unit}</div>
      <div><b>Date:</b> ${new Date().toLocaleString()}</div>
      <div><b>Status:</b> Pending</div>
    </div>`;
  Swal.fire({
    title:"Contribution receipt", html, icon:"success",
    background:"#0f172a", color:"#fff",
    showDenyButton:true, denyButtonText:"Print PDF", confirmButtonText:"Close"
  }).then(res=>{
    if (res.isDenied) {
      const w = window.open("", "_blank");
      w.document.write(`<title>Receipt</title><body style="font-family:sans-serif;padding:24px">
        <h2>Mariki Family Portal — Receipt</h2>${html}<script>window.print()<\/script></body>`);
    }
  });
}

// History
onSnapshot(
  query(collection(db,"contributions"), where("userId","==", user.uid)),
  (snap)=>{
    const items = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b)=> (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    const el = document.getElementById("historyList");
    el.innerHTML = items.length ? items.map(i=>`
      <div class="glass p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">${i.typeTitle}</div>
          <div class="text-xs opacity-70">${i.createdAt?.toDate ? i.createdAt.toDate().toLocaleString() : ""}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold">${i.amount} ${i.unit}</div>
          <div class="text-xs opacity-70">${i.status}</div>
        </div>
      </div>`).join("") : '<div class="opacity-70">No submissions yet.</div>';
  }
);
