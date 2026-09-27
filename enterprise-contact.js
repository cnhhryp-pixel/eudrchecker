(()=>{
  const openBtn=document.getElementById("enterpriseContact");
  const modal=document.getElementById("enterpriseModal");
  if(!openBtn||!modal) return;

  const card=modal.querySelector(".contactModalCard");
  const firstField=modal.querySelector('input[name="Name"]');
  let lastFocus=null;

  function openModal(){
    lastFocus=document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modalOpen");
    setTimeout(()=>firstField?.focus(),30);
  }

  function closeModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("modalOpen");
    lastFocus?.focus();
  }

  openBtn.addEventListener("click",openModal);
  modal.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",closeModal));
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&modal.classList.contains("open")) closeModal();
  });

  document.addEventListener("keydown",e=>{
    if(e.key!=="Tab"||!modal.classList.contains("open")) return;
    const focusable=[...card.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled&&el.offsetParent!==null);
    if(!focusable.length) return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });

  const q=new URLSearchParams(location.search);
  if(q.get("inquiry")==="sent"){
    const note=document.createElement("div");
    note.className="wrap inquirySuccess";
    note.innerHTML='<b>Enterprise inquiry sent.</b><span>Thank you. We will review your project details and reply by email.</span>';
    document.querySelector("main")?.prepend(note);
    history.replaceState({},document.title,location.pathname);
  }
})();