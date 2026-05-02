import { loginUser } from "../../private/auth.js";
import { redirectIfAuthed } from "../../private/guards.js";
import { showLoader } from "./ui.js";

redirectIfAuthed();

document.getElementById("loginForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const fd = new FormData(e.target);
  btn.disabled = true; showLoader(true);
  try{
    const profile = await loginUser(fd.get("email"), fd.get("password"));
    Swal.fire({
      title: `Welcome${profile?.firstName?", "+profile.firstName:""}!`,
      icon: "success", timer: 1200, showConfirmButton: false,
      background: "#0f172a", color: "#fff"
    });
    setTimeout(()=> location.href = "dashboard.html", 900);
  }catch(err){
    Swal.fire({ title:"Login failed", text: err.message, icon:"error",
      background:"#0f172a", color:"#fff" });
  }finally{
    btn.disabled = false; showLoader(false);
  }
});
