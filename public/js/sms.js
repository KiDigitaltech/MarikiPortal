import { requireAuth } from "../../private/guards.js";
import { db, collection, onSnapshot, query, orderBy } from "../../private/firebase.js";
import { logSMS } from "../../private/admin.js";
import { renderShell, initLucide, toast, showLoader } from "./ui.js";
import { SMS_ENDPOINT, SMS_SEGMENT } from "../../private/config.js";
import { TANZANIA } from "./tanzania.js";

const { profile } = await requireAuth({ adminOnly: true });
await renderShell({ active: "sms" });

// Region dropdown
const regionFilter = document.getElementById("regionFilter");
Object.keys(TANZANIA).sort().forEach(r=>{
  const o = document.createElement("option"); o.value = r; o.textContent = r; regionFilter.appendChild(o);
});

// Live members snapshot (used for filter-add)
let allMembers = [];
onSnapshot(collection(db,"users"), (snap)=>{ allMembers = snap.docs.map(d=>d.data()); });

const recipients = new Set();
const recipientsEl = document.getElementById("recipients");
const countEl = document.getElementById("count");

function normalize(n){
  let v = String(n||"").replace(/[^\d+]/g,"");
  if (v.startsWith("+")) v = v.slice(1);
  if (v.startsWith("0")) v = "255" + v.slice(1);
  return v;
}
function add(num){
  const v = normalize(num);
  if (v.length >= 9) recipients.add(v);
}
function renderRecipients(){
  countEl.textContent = recipients.size;
  recipientsEl.innerHTML = [...recipients].map(n=>`
    <span class="glass px-2 py-1 text-xs flex items-center gap-1">
      ${n}<button class="opacity-70 hover:opacity-100" data-rm="${n}"><i data-lucide="x" class="w-3 h-3"></i></button>
    </span>`).join("") || '<div class="opacity-70 text-sm">No recipients yet.</div>';
  initLucide();
  recipientsEl.querySelectorAll("[data-rm]").forEach(b=> b.onclick = ()=>{ recipients.delete(b.dataset.rm); renderRecipients(); });
}
renderRecipients();

document.getElementById("addManual").onclick = ()=>{
  document.getElementById("manual").value.split(/[,\n;\s]+/).forEach(n=> n && add(n));
  document.getElementById("manual").value = "";
  renderRecipients();
};

document.getElementById("addFiltered").onclick = ()=>{
  const from = document.getElementById("fromDate").value;
  const to   = document.getElementById("toDate").value;
  const reg  = regionFilter.value;
  const fromMs = from ? new Date(from).getTime() : 0;
  const toMs   = to   ? new Date(to).getTime() + 86400000 : Infinity;
  let added = 0;
  allMembers.forEach(m=>{
    const t = m.createdAt?.seconds ? m.createdAt.seconds*1000 : 0;
    if (reg && m.region !== reg) return;
    if (t < fromMs || t > toMs) return;
    if (m.phone){ const before = recipients.size; add(m.phone); if (recipients.size>before) added++; }
  });
  renderRecipients();
  toast(`Added ${added} member(s)`);
};

document.getElementById("excel").addEventListener("change", async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header:1 });
  let added = 0;
  rows.forEach(r=>{ const v = r?.[0]; if (v){ const before = recipients.size; add(v); if (recipients.size>before) added++; } });
  renderRecipients();
  toast(`Added ${added} from file`);
  e.target.value = "";
});

document.getElementById("clearAll").onclick = ()=>{ recipients.clear(); renderRecipients(); };

// Char/segment counter
const msg = document.getElementById("message");
const charsEl = document.getElementById("chars");
const segsEl  = document.getElementById("segs");
msg.addEventListener("input", ()=>{
  charsEl.textContent = msg.value.length;
  segsEl.textContent  = Math.ceil(msg.value.length / SMS_SEGMENT) || 0;
});

// Send
document.getElementById("sendBtn").onclick = async ()=>{
  const text = msg.value.trim();
  if (!text) return toast("Message is empty","error");
  if (recipients.size === 0) return toast("No recipients","error");

  const r = await Swal.fire({
    title: "Send broadcast?",
    text: `${recipients.size} recipient(s) · ${Math.ceil(text.length/SMS_SEGMENT)} segment(s) each`,
    icon: "question", showCancelButton: true, confirmButtonText: "Send",
    background:"#0f172a", color:"#fff"
  });
  if (!r.isConfirmed) return;

  const btn = document.getElementById("sendBtn");
  btn.disabled = true; showLoader(true);
  try{
    const res = await fetch(SMS_ENDPOINT, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message: text, numbers: [...recipients] })
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.success === false) throw new Error(data.error || "SMS provider error");

    await logSMS({
      message: text, recipients: [...recipients],
      sent: data.sent || recipients.size, by: profile?.fullName || "Admin"
    });
    Swal.fire({ title:"Sent!", text:`Delivered to ${data.sent || recipients.size} number(s)`,
      icon:"success", background:"#0f172a", color:"#fff" });
    msg.value = ""; charsEl.textContent = 0; segsEl.textContent = 0;
    recipients.clear(); renderRecipients();
  }catch(err){
    Swal.fire({ title:"Failed", text: err.message, icon:"error", background:"#0f172a", color:"#fff" });
  }finally{
    btn.disabled = false; showLoader(false);
  }
};

// Logs
onSnapshot(query(collection(db,"smsLogs"), orderBy("createdAt","desc")), (snap)=>{
  const items = snap.docs.map(d=>d.data()).slice(0,30);
  document.getElementById("logs").innerHTML = items.length ? items.map(l=>`
    <div class="glass p-3">
      <div class="flex items-center justify-between text-xs opacity-70">
        <span>${l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString() : ""}</span>
        <span>${l.sent||l.recipients?.length||0} recipients · by ${l.by||"—"}</span>
      </div>
      <div class="text-sm mt-1 whitespace-pre-wrap">${(l.message||"").replace(/</g,"&lt;")}</div>
    </div>`).join("") : '<div class="opacity-70">No broadcasts yet.</div>';
});
