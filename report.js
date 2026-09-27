(()=> {
  const form=document.getElementById("reportForm");
  const out=document.getElementById("reportOutput");
  const buy=document.getElementById("paypalBuy");
  const status=document.getElementById("paymentStatus");
  if(!form||!out) return;

  const cfg=window.EUDR_PAYMENT||{};
  const link=cfg.professionalReport||"";
  if(buy&&link){
    buy.href=link;
    buy.classList.remove("disabledLink");
    if(status) status.textContent="Secure one-time payment via PayPal. Professional report delivery follows payment confirmation.";
  } else if(buy){
    buy.addEventListener("click",e=>e.preventDefault());
  }

  const fields=["companyName","reportRole","reportSize","reportProduct","reportCode","reportCommodity","reportCountry","reportRisk","reportGeo","reportEvidence","reportNotes"];
  fields.forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    const key="eudr_report_"+id;
    const saved=localStorage.getItem(key);
    if(saved!==null) el.value=saved;
    el.addEventListener("input",()=>localStorage.setItem(key,el.value));
  });

  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const reportId=()=>{
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,"0");
    const day=String(d.getDate()).padStart(2,"0");
    const suffix=Math.random().toString(36).slice(2,6).toUpperCase();
    return "EUDR-"+y+m+day+"-"+suffix;
  };
  const riskLabel=v=>({low:"Low",standard:"Standard",high:"High",unknown:"Not checked"})[v]||v;
  const riskPill=v=>v==="low"?"in":v==="high"?"out":"review";

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const v=id=>document.getElementById(id).value.trim();
    const company=v("companyName"),role=v("reportRole"),size=v("reportSize"),product=v("reportProduct"),code=v("reportCode"),
      commodity=v("reportCommodity"),country=v("reportCountry"),risk=v("reportRisk"),geo=v("reportGeo"),
      evidence=v("reportEvidence"),notes=v("reportNotes");

    const id=reportId();
    const generated=new Date();
    const deadline=size==="small"?"30 June 2027":"30 December 2026";

    let readiness=20;
    const gaps=[];
    const priorities=[];

    if(code){readiness+=15}else{gaps.push("Exact CN / HS code has not been entered.");priorities.push(["High","Confirm exact CN/HS code and Annex I scope."])}
    if(risk!=="unknown"){readiness+=15}else{gaps.push("Country risk classification still needs to be checked.");priorities.push(["High","Confirm the current country benchmarking classification."])}
    if(geo==="Collected and validated"){readiness+=25}
    else if(geo==="Collected but not validated"){readiness+=12;gaps.push("Geolocation data is collected but still needs validation.");priorities.push(["High","Validate GeoJSON / production-location geometry."])}
    else {gaps.push("Geolocation evidence is not yet fully collected and validated.");priorities.push(["Critical","Collect and validate required production geolocation."])}

    if(evidence==="Complete"){readiness+=25}
    else if(evidence==="Partially complete"){readiness+=12;gaps.push("Supplier evidence package is only partially complete.");priorities.push(["High","Close supplier evidence and legality-document gaps."])}
    else {gaps.push("Supplier evidence package is not yet complete.");priorities.push(["Critical","Collect supplier, legality and deforestation-free evidence."])}

    const readinessLabel=readiness>=85?"Advanced preparation":readiness>=65?"Moderate preparation":"Material gaps remain";
    const article9=[
      ["Product description & commodity",Boolean(product&&commodity)],
      ["Exact CN / HS classification",Boolean(code)],
      ["Quantity / transaction data",false],
      ["Country of production",Boolean(country)],
      ["Geolocation",geo==="Collected and validated"],
      ["Supplier / customer details",evidence==="Complete"],
      ["Deforestation-free evidence",evidence==="Complete"],
      ["Legality evidence",evidence==="Complete"]
    ];
    const article9Done=article9.filter(x=>x[1]).length;

    const matrix=[
      ["Product scope",code?"Review exact Annex I match":"High attention",code?"review":"out"],
      ["Country benchmark",riskLabel(risk),riskPill(risk)],
      ["Geolocation",geo==="Collected and validated"?"Validated":"Incomplete",geo==="Collected and validated"?"in":"out"],
      ["Supplier evidence",evidence,evidence==="Complete"?"in":evidence==="Partially complete"?"review":"out"],
      ["Role clarity",role?"Defined":"Missing",role?"in":"out"],
      ["Deadline",deadline,"review"]
    ];

    if(!priorities.length) priorities.push(["Medium","Verify the completeness and reliability of all supporting records."]);

    const plan30=[
      "Confirm exact product scope and CN classification.",
      "Close missing Article 9 information fields.",
      "Validate plot or establishment geolocation."
    ];
    const plan60=[
      "Complete supplier evidence review and legality checks.",
      "Document the applicable Article 10 risk assessment.",
      "Resolve inconsistencies between supplier, product and geolocation data."
    ];
    const plan90=[
      "Document Article 11 mitigation where risk is more than negligible.",
      "Prepare the applicable DDS / simplified-declaration workflow.",
      "Set up the required five-year evidence-retention process."
    ];

    const riskText=risk==="low"
      ?"Low-risk origin may support simplified due diligence when all legal conditions are met, but required information still needs to be collected and retained."
      :risk==="standard"
      ?"Standard-risk origin should be treated as requiring the normal due-diligence risk assessment unless another rule applies."
      :risk==="high"
      ?"High-risk origin warrants enhanced attention to evidence quality, risk assessment, mitigation and enforcement exposure."
      :"Country risk classification should be confirmed before relying on the workflow.";

    out.innerHTML=
    '<article id="printReport" class="printReport professionalDoc">'+
      '<section class="pdfCover">'+
        '<div>'+
          '<div class="pdfCoverBrand"><span class="logo">EC</span><div><b>EUDRChecker.com</b><small>Independent compliance workflow tool</small></div></div>'+
          '<div class="eyebrow" style="margin-top:45px">EUDR screening report</div>'+
          '<h1>'+esc(company)+'</h1>'+
          '<p class="lead">'+esc(product)+(code?' • CN/HS '+esc(code):'')+'</p>'+
        '</div>'+
        '<div class="pdfCoverMeta">'+
          '<div><span>Report ID</span><b>'+id+'</b></div>'+
          '<div><span>Version</span><b>1.0</b></div>'+
          '<div><span>Generated</span><b>'+generated.toLocaleDateString()+'</b></div>'+
          '<div><span>Status</span><b>Preliminary screening</b></div>'+
        '</div>'+
        '<p class="pdfFooterNote">This document is a preliminary compliance aid. It is not legal advice, a Due Diligence Statement, or certification of EUDR compliance.</p>'+
      '</section>'+

      '<section class="pdfSection">'+
        '<div class="reportHeader"><div><span class="eyebrow">Executive overview</span><h2>'+esc(company)+'</h2><p>'+esc(product)+'</p></div><div class="reportStamp">'+id+'<br>v1.0</div></div>'+
        '<div class="readinessBlock"><div><span>Preparation score</span><strong>'+readiness+'%</strong><small>'+readinessLabel+'</small></div><div class="readinessTrack"><i style="width:'+readiness+'%"></i></div><p>Workflow-readiness indicator only — not a legal compliance score.</p></div>'+
        '<div class="reportSummary">'+
          '<div><span>Commodity</span><b>'+esc(commodity)+'</b></div>'+
          '<div><span>Role</span><b>'+esc(role)+'</b></div>'+
          '<div><span>Production country</span><b>'+esc(country)+'</b></div>'+
          '<div><span>Country risk</span><b>'+esc(riskLabel(risk))+'</b></div>'+
          '<div><span>Geolocation</span><b>'+esc(geo)+'</b></div>'+
          '<div><span>Application date</span><b>'+deadline+'</b></div>'+
        '</div>'+
        '<h3>Executive summary</h3>'+
        '<p>The current inputs indicate that this transaction should continue through product-scope confirmation, Article 9 information collection and the applicable risk-assessment workflow before any DDS or simplified-declaration step is treated as complete.</p>'+
        '<p>'+riskText+'</p>'+
      '</section>'+

      '<section class="pdfSection pdfPageBreak">'+
        '<h2>1. Scope & Risk Assessment</h2>'+
        '<div class="matrix proMatrix">'+matrix.map(([name,value,state])=>'<div><b>'+esc(name)+'</b><span class="scopeTag '+state+'">'+esc(value)+'</span></div>').join("")+'</div>'+
        '<h3>Scope note</h3><p>Product coverage must be confirmed against the current Annex I wording and exact CN classification. Where Annex I uses “ex”, only part of a customs heading may be covered.</p>'+
      '</section>'+

      '<section class="pdfSection">'+
        '<h2>2. Article 9 Information Snapshot</h2>'+
        '<div class="miniChecklist">'+article9.map(([name,ok])=>'<div class="'+(ok?'done':'gap')+'"><span>'+(ok?'✓':'!')+'</span><b>'+esc(name)+'</b></div>').join("")+'</div>'+
        '<p>'+article9Done+' of '+article9.length+' core information categories appear addressed from the current inputs.</p>'+
      '</section>'+

      '<section class="pdfSection">'+
        '<h2>3. Evidence Gap Priorities</h2>'+
        '<div class="priorityList">'+priorities.map(([level,text])=>'<div><span class="priority '+level.toLowerCase()+'">'+level+'</span><p>'+esc(text)+'</p></div>').join("")+'</div>'+
        (gaps.length?'<ul>'+gaps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'<p>No major gaps were indicated in the form. Underlying evidence should still be verified for reliability and completeness.</p>')+
      '</section>'+

      '<section class="pdfSection pdfPageBreak">'+
        '<h2>4. 30 / 60 / 90 Day Action Plan</h2>'+
        '<div class="timeline">'+
          '<div><span>0–30 days</span><ul>'+plan30.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>'+
          '<div><span>31–60 days</span><ul>'+plan60.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>'+
          '<div><span>61–90 days</span><ul>'+plan90.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>'+
        '</div>'+
      '</section>'+

      '<section class="pdfSection">'+
        '<h2>5. Recommended Due-Diligence Workflow</h2>'+
        '<ol><li>Confirm exact Annex I product scope and CN classification.</li><li>Complete required product, quantity, supplier/customer and origin information.</li><li>Validate required production geolocation.</li><li>Assess legality and deforestation-free evidence.</li><li>Apply the applicable Article 10 risk assessment.</li><li>Document Article 11 mitigation where risk is more than negligible.</li><li>Prepare the applicable DDS or simplified-declaration workflow.</li><li>Retain required records for the applicable five-year period.</li></ol>'+
      '</section>'+

      (notes?'<section class="pdfSection"><h2>6. Notes</h2><p>'+esc(notes)+'</p></section>':'')+

      '<section class="pdfSection">'+
        '<h2>Official Sources</h2>'+
        '<ul class="sourceList"><li><a href="https://green-forum.ec.europa.eu/nature-and-biodiversity/deforestation-regulation-implementation/understand-due-diligence_en" target="_blank" rel="noopener">European Commission — Understand due diligence ↗</a></li><li><a href="https://green-forum.ec.europa.eu/countries-and-partnerships/country-classification-list_en" target="_blank" rel="noopener">European Commission — Country classification ↗</a></li><li><a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02023R1115-20251226" target="_blank" rel="noopener">EUR-Lex — consolidated EUDR text ↗</a></li></ul>'+
        '<p class="pdfFooterNote">Report '+id+' • Version 1.0 • Generated '+generated.toLocaleDateString()+' • EUDRChecker.com</p>'+
      '</section>'+
    '</article>'+

    '<section class="proPreview"><div class="eyebrow">Professional report</div><h3>€49 Professional version</h3><div class="proPreviewGrid"><div><b>Formal cover & report ID</b><p>Client-ready report identity and versioning.</p></div><div><b>Scope & Risk Matrix</b><p>Structured review of scope, origin and evidence readiness.</p></div><div><b>Priority Evidence Gaps</b><p>Critical / High / Medium priorities.</p></div><div><b>30/60/90 Action Plan</b><p>Sequenced remediation and preparation steps.</p></div><div><b>Official Source References</b><p>Key Commission and EUR-Lex references.</p></div><div><b>PDF-ready delivery</b><p>A4 layout suitable for browser Print → Save as PDF.</p></div></div><a class="btn primary" href="'+(link||'/pricing/')+'" '+(link?'target="_blank" rel="noopener"':'')+'>Get Professional Report — €49</a><a class="sampleLink" href="/professional-report-sample/">View sample →</a></section>'+

    '<div class="reportActions"><button id="printReportBtn" class="btn secondary">Print / Save as PDF</button><button id="copyReportBtn" class="btn secondary">Copy report summary</button><a class="btn primary" href="/pricing/">Pricing</a></div>';

    document.getElementById("printReportBtn")?.addEventListener("click",()=>window.print());
    document.getElementById("copyReportBtn")?.addEventListener("click",async()=>{
      const text=document.getElementById("printReport").innerText;
      try{await navigator.clipboard.writeText(text);document.getElementById("copyReportBtn").textContent="Copied"}catch(err){}
    });
    out.scrollIntoView({behavior:"smooth",block:"start"});
  });
})();