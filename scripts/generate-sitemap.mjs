import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const ignore=new Set([".git",".github","node_modules"]);
const skip=new Set(["404.html","privacy/index.html","terms/index.html"]);
const pages=[];

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const rel=path.relative(root,p).split(path.sep).join("/");
    const st=fs.statSync(p);
    if(st.isDirectory()){
      if(!ignore.has(name)) walk(p);
    }else if(name==="index.html" && !skip.has(rel)){
      pages.push(rel);
    }
  }
}
walk(root);

function route(file){ return file==="index.html" ? "/" : "/"+file.replace(/index\.html$/,""); }
function priority(r){
  if(r==="/") return "1.0";
  if(r==="/product-checker/") return "0.95";
  if(["/report/","/geojson-validator/","/country-risk/","/cn-code/"].includes(r)) return "0.90";
  if(r.startsWith("/guides/")||r.startsWith("/cn-code/")||r.startsWith("/commodities/")) return "0.82";
  return "0.75";
}
const today=new Date().toISOString().slice(0,10);
const routes=pages.map(route).sort((a,b)=>a==="/" ? -1 : b==="/" ? 1 : a.localeCompare(b));
const rows=routes.map(r=>"  <url><loc>https://eudrchecker.com"+r+"</loc><lastmod>"+today+"</lastmod><priority>"+priority(r)+"</priority></url>");
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+rows.join("\n")+'\n</urlset>\n';
fs.writeFileSync(path.join(root,"sitemap.xml"),xml);
console.log("Generated sitemap.xml with "+routes.length+" URLs.");