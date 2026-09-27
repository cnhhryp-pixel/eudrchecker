(()=>{const btn=document.getElementById('menuBtn'),nav=document.getElementById('nav');if(btn&&nav)btn.onclick=()=>nav.classList.toggle('open');const f=document.getElementById('form'),r=document.getElementById('result');if(!f||!r)return;f.onsubmit=e=>{e.preventDefault();const c=document.getElementById('commodity').value,role=document.getElementById('role').value,risk=document.getElementById('country').value,size=document.getElementById('size').value,p=document.getElementById('product').value.trim(),newScope=document.getElementById('newScope').checked;let date=size==='large'||size==='small-eutr'?'30 Dec 2026':size==='small'?'30 Jun 2027':'Confirm category';if(newScope)date='30 Dec 2027';let headline=c==='Unsure'?'Confirm the exact product and Annex I CN code first.':role==='supplier'?'Your EU customer may require EUDR evidence from you.':role==='trader'?'Your downstream obligations depend on your exact role.':'Your answers indicate a clear EUDR compliance workflow to review.';let riskText=risk==='low'?'Low risk':risk==='standard'?'Standard risk':risk==='high'?'High risk':'Check official list';let actions=['Confirm the exact product against the current EUDR Annex I and CN code.','Collect product, supplier and country-of-production information.','Prepare geolocation and legality evidence for relevant production locations.'];if(risk!=='low')actions.push('Document risk assessment and mitigation where required.');if(['operator','importer','exporter'].includes(role))actions.push('Prepare the Due Diligence Statement workflow before the relevant placing/export activity.');r.innerHTML='<span class="resultBadge">Preliminary result</span><h3>'+headline+'</h3>'+(p?'<p>Product entered: <b>'+esc(p)+'</b></p>':'')+'<div class="metrics"><div class="metric"><span>Commodity</span><b>'+c+'</b></div><div class="metric"><span>Role</span><b>'+roleLabel(role)+'</b></div><div class="metric"><span>Origin risk</span><b>'+riskText+'</b></div><div class="metric"><span>Application date</span><b>'+date+'</b></div></div><p class="note">This is preliminary screening only. Product scope ultimately depends on the current Annex I CN code, and country classifications/timetables can change.</p><h4>Recommended next steps</h4><ul>'+actions.map(x=>'<li>'+x+'</li>').join('')+'</ul><p><a href="https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en" target="_blank" rel="noopener"><b>Verify with the European Commission ↗</b></a></p>'};function roleLabel(v){return({operator:'Operator / first placer',importer:'EU importer',exporter:'EU exporter',trader:'Downstream trader',supplier:'Non-EU supplier',unsure:'Needs confirmation'})[v]||v}function esc(v){return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}})();
;(()=>{
  const path=location.pathname;
  if(path==="/") return;
  const header=document.querySelector(".top");
  if(!header||document.querySelector(".breadcrumbs")) return;

  const parts=path.split("/").filter(Boolean);
  const labelMap={
    "guides":"Guides","cn-code":"CN Code Index","commodities":"Commodities",
    "country-risk":"Country Risk","product-checker":"Product Checker",
    "geojson-validator":"GeoJSON Validator","supplier-checklist":"Supplier Checklist",
    "report":"Report","pricing":"Pricing","glossary":"Glossary","about":"About",
    "privacy":"Privacy","terms":"Terms","deadlines":"Deadlines",
    "professional-report-sample":"Professional Report Sample"
  };
  const crumbs=[{name:"Home",url:"/"}];
  let acc="";
  parts.forEach((seg,i)=>{
    acc+="/"+seg;
    const isLast=i===parts.length-1;
    let name=labelMap[seg]||seg.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
    if(isLast){
      const h1=document.querySelector("h1");
      if(h1&&h1.textContent.trim()) name=h1.textContent.trim();
    }
    crumbs.push({name,url:acc+"/"});
  });

  const nav=document.createElement("nav");
  nav.className="breadcrumbs";
  nav.setAttribute("aria-label","Breadcrumb");
  nav.innerHTML='<div class="wrap breadcrumbInner">'+crumbs.map((c,i)=>
    i===crumbs.length-1
      ? '<span aria-current="page">'+escapeBread(c.name)+'</span>'
      : '<a href="'+c.url+'">'+escapeBread(c.name)+'</a><i aria-hidden="true">›</i>'
  ).join("")+'</div>';
  header.insertAdjacentElement("afterend",nav);

  const hasBreadcrumbSchema=[...document.querySelectorAll('script[type="application/ld+json"]')].some(s=>s.textContent.includes('"BreadcrumbList"'));
  if(!hasBreadcrumbSchema){
    const schema=document.createElement("script");
    schema.type="application/ld+json";
    schema.textContent=JSON.stringify({
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement":crumbs.map((c,i)=>({
        "@type":"ListItem","position":i+1,"name":c.name,
        "item":"https://eudrchecker.com"+c.url
      }))
    });
    document.head.appendChild(schema);
  }
  function escapeBread(v){return v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
})();
;(()=>{
  const nav=document.getElementById("nav");
  if(!nav) return;
  const additions=[["/cn-code/","CN Codes"],["/report/","Report"]];
  additions.forEach(([href,label])=>{
    if(!nav.querySelector('a[href="'+href+'"]')){
      const a=document.createElement("a");
      a.href=href;a.textContent=label;nav.appendChild(a);
    }
  });
})();