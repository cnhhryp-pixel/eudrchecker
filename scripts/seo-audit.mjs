import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const ignoreDirs=new Set([".git",".github","node_modules"]);
const htmlFiles=[];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const rel=path.relative(root,p).replaceAll("\\","/");
    const st=fs.statSync(p);
    if(st.isDirectory()){
      if(!ignoreDirs.has(name)) walk(p);
    }else if(name.endsWith(".html")) htmlFiles.push(rel);
  }
}
walk(root);

const files=new Set();
(function collect(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const rel=path.relative(root,p).replaceAll("\\","/");
    const st=fs.statSync(p);
    if(st.isDirectory()){
      if(!ignoreDirs.has(name)) collect(p);
    } else files.add(rel);
  }
})(root);

const pages=new Map();
const titleMap=new Map();
const descMap=new Map();
const inbound=new Map();
const problems=[];

const extract=(html,rx)=>(html.match(rx)||[])[1]?.trim()||"";
const routeFor=file=>file==="index.html"?"/":"/"+file.replace(/index\.html$/,"").replace(/\.html$/,"");
const normalizeRoute=href=>{
  let x=href.split("#")[0].split("?")[0];
  if(!x) return null;
  if(!x.startsWith("/")) return null;
  if(x==="/") return "/";
  return x.endsWith("/")?x:x+"/";
};

for(const file of htmlFiles){
  const html=fs.readFileSync(file,"utf8");
  const title=extract(html,/<title>(.*?)<\/title>/is);
  const desc=extract(html,/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/is);
  const canonical=extract(html,/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/is);
  const robots=extract(html,/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/is);
  const route=routeFor(file);
  const hrefs=[...html.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]);
  pages.set(route,{file,title,desc,canonical,robots,hrefs});
  inbound.set(route,0);

  if(file!=="404.html"){
    if(!title) problems.push(`ERROR ${file}: missing <title>`);
    if(!desc && !["privacy/index.html","terms/index.html"].includes(file)) problems.push(`WARN  ${file}: missing meta description`);
    if(!canonical) problems.push(`ERROR ${file}: missing canonical`);
  }
  if(title){
    if(title.length<25) problems.push(`WARN  ${file}: short title (${title.length})`);
    if(title.length>65) problems.push(`WARN  ${file}: long title (${title.length})`);
    titleMap.set(title,[...(titleMap.get(title)||[]),file]);
  }
  if(desc){
    if(desc.length<90 && !["privacy/index.html","terms/index.html"].includes(file)) problems.push(`WARN  ${file}: short description (${desc.length})`);
    if(desc.length>170) problems.push(`WARN  ${file}: long description (${desc.length})`);
    descMap.set(desc,[...(descMap.get(desc)||[]),file]);
  }
}

for(const [title,list] of titleMap) if(list.length>1) problems.push(`WARN  duplicate title: "${title}" -> ${list.join(", ")}`);
for(const [desc,list] of descMap) if(list.length>1) problems.push(`WARN  duplicate description -> ${list.join(", ")}`);

for(const {file,hrefs} of pages.values()){
  for(const href of hrefs){
    if(/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) continue;
    const bare=href.split("#")[0].split("?")[0];
    if(!bare) continue;
    if(bare.startsWith("/")){
      if(/\.(css|js|svg|xml|txt|png|jpg|jpeg|webp|ico)$/i.test(bare)){
        const fp=bare.slice(1);
        if(!files.has(fp)) problems.push(`ERROR ${file}: broken asset link ${href}`);
        continue;
      }
      const route=normalizeRoute(href);
      if(route && pages.has(route)) inbound.set(route,(inbound.get(route)||0)+1);
      else if(route) problems.push(`ERROR ${file}: broken internal link ${href}`);
    }
  }
}

const orphanIgnore=new Set(["/","/privacy/","/terms/","/about/"]);
for(const [route,count] of inbound){
  if(count===0 && !orphanIgnore.has(route)) problems.push(`WARN  orphan page: ${route}`);
}

const sitemapPath=path.join(root,"sitemap.xml");
if(fs.existsSync(sitemapPath)){
  const xml=fs.readFileSync(sitemapPath,"utf8");
  const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  const seen=new Set();
  for(const url of urls){
    if(seen.has(url)) problems.push(`ERROR duplicate sitemap URL: ${url}`);
    seen.add(url);
    const route=new URL(url).pathname;
    if(!pages.has(route)) problems.push(`ERROR sitemap URL has no page: ${route}`);
  }
  for(const [route,{file,robots}] of pages){
    if(file==="404.html"||robots.toLowerCase().includes("noindex")||["/privacy/","/terms/"].includes(route)) continue;
    const full="https://eudrchecker.com"+route;
    if(!seen.has(full)) problems.push(`WARN  indexable page missing from sitemap: ${route}`);
  }
}

const errors=problems.filter(x=>x.startsWith("ERROR"));
console.log(`SEO audit: ${htmlFiles.length} HTML files, ${problems.length} findings, ${errors.length} errors.`);
for(const p of problems) console.log(p);
if(errors.length) process.exit(1);
