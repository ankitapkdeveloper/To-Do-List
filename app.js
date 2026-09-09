(() => {
const cfg = window.SUPABASE_CONFIG || {};
const configured = cfg.url && /^https:\/\/.+\.supabase\.co$/i.test(cfg.url) &&
                   cfg.anonKey && !cfg.anonKey.includes("PASTE_");
const sb = configured && window.supabase ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;

let authMode = "login", user = null, tasks = [], filter = "all";
let selectedCategory = "Work", reminder = false;

const $ = id => document.getElementById(id);
const authScreen=$("authScreen"), home=$("homeScreen"), add=$("addScreen");
const authError=$("authError");

function show(el){el.classList.remove("hidden")} function hide(el){el.classList.add("hidden")}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function formatDue(v){
 if(!v) return "No date";
 const d=new Date(v); if(Number.isNaN(d)) return "No date";
 return d.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" · "+d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
}
function isToday(v){ if(!v)return false; const d=new Date(v),n=new Date(); return d.toDateString()===n.toDateString(); }
function isFuture(v){ return v && new Date(v).toDateString()!==new Date().toDateString() && new Date(v)>new Date(); }

async function loadTasks(){
 if(!sb||!user)return;
 const {data,error}=await sb.from("tasks").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
 if(error){toastError(error.message);return}
 tasks=data||[]; render();
}
function visibleTasks(){
 return tasks.filter(t=>{
   if(filter==="completed") return t.completed;
   if(filter==="today") return !t.completed && isToday(t.due_at);
   if(filter==="upcoming") return !t.completed && isFuture(t.due_at);
   return !t.completed;
 });
}
function card(t){
 const title=esc(t.title), meta=esc(formatDue(t.due_at));
 return `<article class="task-card">
   <button class="check ${t.completed?'done':''}" data-check="${t.id}">${t.completed?'✓':''}</button>
   <div class="task-main"><div class="task-title ${t.completed?'done-text':''}">${title}</div><div class="task-meta">${meta}</div></div>
   <span class="badge ${esc(t.category)}">${esc(t.category||'Work')}</span>
 </article>`;
}
function render(){
 const v=visibleTasks(); $("taskList").innerHTML=v.map(card).join("");
 $("emptyState").classList.toggle("hidden",v.length>0);
 $("todayCount").textContent=tasks.filter(t=>!t.completed&&isToday(t.due_at)).length+" tasks";
 $("preview").innerHTML=tasks.filter(t=>!t.completed&&isToday(t.due_at)).slice(0,3).map(card).join("");
 document.querySelectorAll("[data-check]").forEach(b=>b.onclick=()=>toggleTask(b.dataset.check));
 document.querySelectorAll(".preview [data-check]").forEach(b=>b.onclick=()=>toggleTask(b.dataset.check));
}
async function toggleTask(id){
 const t=tasks.find(x=>x.id===id); if(!t)return;
 const next=!t.completed;
 const {error}=await sb.from("tasks").update({completed:next}).eq("id",id).eq("user_id",user.id);
 if(error){toastError(error.message);return}
 t.completed=next; render();
}
function toastError(msg){ authError.textContent=msg||"Something went wrong."; }

async function authenticate(){
 authError.textContent="";
 if(!configured){toastError("Supabase is not configured. Open config.js and paste your Publishable/Anon key.");return}
 const email=$("email").value.trim(), password=$("password").value;
 if(!email||!password){toastError("Enter your email and password.");return}
 $("authBtn").disabled=true; $("authBtn").textContent="Please wait...";
 try{
   if(authMode==="signup"){
     if(password.length<6) throw new Error("Password must be at least 6 characters.");
     const {data,error}=await sb.auth.signUp({email,password});
     if(error) throw error;
     if(!data.session){
       toastError("Account created. Check your email and confirm your account, then log in.");
       authMode="login"; updateAuthMode();
     } else { user=data.user; await openApp(); }
   } else {
     const {data,error}=await sb.auth.signInWithPassword({email,password});
     if(error) throw error;
     user=data.user; await openApp();
   }
 }catch(e){toastError(e.message||"Authentication failed.");}
 finally{$("authBtn").disabled=false;$("authBtn").textContent=authMode==="login"?"Log in":"Create account";}
}
function updateAuthMode(){
 $("authTitle").textContent=authMode==="login"?"Welcome back":"Create your account";
 $("authText").textContent=authMode==="login"?"Log in to access your tasks.":"Create an account to save tasks in the cloud.";
 $("authBtn").textContent=authMode==="login"?"Log in":"Create account";
 $("switchAuth").textContent=authMode==="login"?"Create a new account":"I already have an account";
 $("password").autocomplete=authMode==="login"?"current-password":"new-password";
 authError.textContent="";
}
async function openApp(){
 hide(authScreen); hide(add); show(home); await loadTasks();
}
function openAdd(){
 hide(home); show(add);
 $("titleInput").value=""; $("descInput").value="";
 $("dateInput").value=""; selectedCategory="Work"; reminder=false;
 document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("selected",c.dataset.cat==="Work"));
 $("reminderBtn").classList.remove("on"); render();
}
async function saveTask(){
 const title=$("titleInput").value.trim();
 if(!title){$("titleInput").focus();return}
 const due=$("dateInput").value ? new Date($("dateInput").value).toISOString() : null;
 const payload={user_id:user.id,title,description:$("descInput").value.trim(),due_at:due,category:selectedCategory,completed:false,reminder};
 const {data,error}=await sb.from("tasks").insert(payload).select().single();
 if(error){alert("Could not save task: "+error.message);return}
 tasks.unshift(data); hide(add);show(home);render();
}
async function logout(){await sb.auth.signOut();user=null;tasks=[];hide(home);hide(add);show(authScreen)}
async function clearAll(){
 if(!confirm("Delete all your tasks?"))return;
 const {error}=await sb.from("tasks").delete().eq("user_id",user.id);
 if(error){alert(error.message);return} tasks=[];render();hide($("menuPanel"));
}

$("authBtn").onclick=authenticate;
$("switchAuth").onclick=()=>{authMode=authMode==="login"?"signup":"login";updateAuthMode()};
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")authenticate()});
$("addBtn").onclick=openAdd; $("backBtn").onclick=()=>{hide(add);show(home)}; $("saveBtn").onclick=saveTask;
$("menuBtn").onclick=()=>$("menuPanel").classList.toggle("hidden"); $("logoutBtn").onclick=logout; $("clearBtn").onclick=clearAll;
$("fullscreenBtn").onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){}};
$("reminderBtn").onclick=()=>{reminder=!reminder;$("reminderBtn").classList.toggle("on",reminder)};
document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{selectedCategory=c.dataset.cat;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("selected",x===c))});
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("active",x===b));render()});
["calendarBtn","statsBtn","settingsBtn"].forEach(id=>$(id).onclick=()=>alert("This section can be added next. Your tasks and authentication are already connected to Supabase."));

(async function init(){
 if(!configured){show(authScreen); authError.textContent="Setup required: paste your Supabase Publishable/Anon key into config.js."; return}
 const {data:{session}}=await sb.auth.getSession();
 if(session){user=session.user;await openApp()}else show(authScreen);
 sb.auth.onAuthStateChange((_event,session)=>{if(!session&&user){user=null;tasks=[];hide(home);hide(add);show(authScreen)}});
})();
})();