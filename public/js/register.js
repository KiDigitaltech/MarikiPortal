import { registerUser } from "../../private/auth.js";
import { redirectIfAuthed } from "../../private/guards.js";
import { showLoader } from "./ui.js";
import { fillRegions, fillDistricts } from "./tanzania.js";

redirectIfAuthed();

const regionEl = document.getElementById("region");
const districtEl = document.getElementById("district");
fillRegions(regionEl);
regionEl.addEventListener("change", ()=> fillDistricts(regionEl, districtEl));

const relEl = document.getElementById("relationship");
const partnerBlock = document.getElementById("partnerBlock");
relEl.addEventListener("change", ()=> partnerBlock.classList.toggle("hidden", relEl.value === "none"));

function preview(input, img){
  input.addEventListener("change", ()=>{
    const f = input.files?.[0]; if(!f) return;
    const url = URL.createObjectURL(f);
    img.src = url; img.style.display="block";
  });
}
preview(document.getElementById("profileFile"), document.getElementById("profilePreview"));
preview(document.getElementById("partnerFile"),  document.getElementById("partnerPreview"));

document.getElementById("regForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const fd = new FormData(e.target);
  const form = Object.fromEntries(fd.entries());
  const profileFile = document.getElementById("profileFile").files[0];
  const partnerFile = document.getElementById("partnerFile").files[0];

  btn.disabled = true; showLoader(true);
  try{
    await registerUser(form, profileFile, partnerFile);
    Swal.fire({ title:"Account created", text:"Welcome to the family portal.",
      icon:"success", background:"#0f172a", color:"#fff", timer:1500, showConfirmButton:false });
    setTimeout(()=> location.href = "dashboard.html", 1200);
  }catch(err){
    Swal.fire({ title:"Registration failed", text: err.message, icon:"error",
      background:"#0f172a", color:"#fff" });
  }finally{
    btn.disabled = false; showLoader(false);
  }
});
