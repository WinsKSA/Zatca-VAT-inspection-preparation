// ================================================================ charts (SVG, single axis, thin marks, hover tooltips)
function niceMax(v){if(!(v>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
const tipAttr=t=>`data-tip="${esc(t)}"`;
function legend(series){return `<div class="legend">${series.map(s=>`<span class="lg"><i class="sw" style="background:var(--${s.c})"></i>${esc(s.name)}</span>`).join("")}</div>`}
// vertical grouped bars; series: [{name,c:'s1',values:[],type:'bar'|'line'}]
function columnChart(cats,series,{h=220,fmtv=fmt0,pct=false,id=""}={}){
  const W=680,H=h,padL=56,padR=12,padT=12,padB=28,iw=W-padL-padR,ih=H-padT-padB;
  const max=niceMax(Math.max(...series.flatMap(s=>s.values.map(v=>Math.max(0,v))),0)), y=v=>padT+ih-ih*Math.max(0,v)/max;
  const band=iw/cats.length, bars=series.filter(s=>s.type!=="line"), gw=band*0.66, bw=Math.max(3,Math.min(22,gw/Math.max(1,bars.length)-2));
  const ticks=[0,.25,.5,.75,1].map(f=>f*max);
  let g=ticks.map(t=>`<line x1="${padL}" x2="${W-padR}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${padL-8}" y="${y(t)+4}" class="tick" text-anchor="end">${pct?(t*100).toFixed(0)+"%":fmtK(t)}</text>`).join("");
  g+=`<line x1="${padL}" x2="${W-padR}" y1="${y(0)}" y2="${y(0)}" class="axis"/>`;
  cats.forEach((c,i)=>{const cx=padL+band*i+band/2;g+=`<text x="${cx}" y="${H-8}" class="tick" text-anchor="middle">${esc(c)}</text>`;
    const tot=bars.length*bw+(bars.length-1)*2;bars.forEach((s,k)=>{const v=s.values[i]||0,x=cx-tot/2+k*(bw+2),top=y(v),hgt=y(0)-top;
      if(hgt>0.5){const r=Math.min(4,bw/2,hgt);g+=`<path d="M${x},${y(0)} V${top+r} Q${x},${top} ${x+r},${top} H${x+bw-r} Q${x+bw},${top} ${x+bw},${top+r} V${y(0)} Z" fill="var(--${s.c})" class="mark"/>`}
      g+=`<rect x="${x-1}" y="${padT}" width="${bw+2}" height="${ih}" fill="transparent" ${tipAttr(`${tr(c)} · ${tr(s.name)}: ${pct?(v*100).toFixed(1)+"%":fmt(v)}`)}/>`})});
  series.filter(s=>s.type==="line").forEach(s=>{const pts=s.values.map((v,i)=>[padL+band*i+band/2,y(v)]);
    g+=`<polyline points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="var(--${s.c})" stroke-width="2"/>`;
    pts.forEach((p,i)=>{g+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--${s.c})" stroke="var(--surface)" stroke-width="2"/><circle cx="${p[0]}" cy="${p[1]}" r="11" fill="transparent" ${tipAttr(`${tr(cats[i])} · ${tr(s.name)}: ${pct?(s.values[i]*100).toFixed(1)+"%":fmt(s.values[i])}`)}/>`})});
  return `${legend(series)}<div class="chart" dir="ltr"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s=>tr(s.name)).join(", "))}" ${id?`id="${id}"`:""}>${g}</svg></div>`;
}
// horizontal bars (HTML, RTL-aware); items [{label,value,c}]
function barList(items,{fmtv=fmt}={}){const max=Math.max(...items.map(i=>Math.abs(i.value)),1);
  return `<div class="barlist">${items.map(i=>`<div class="bl-row" ${tipAttr(`${tr(i.label)}: ${fmtv(i.value)}`)}><span class="bl-lab">${esc(i.label)}</span><span class="bl-track"><span class="bl-bar" style="width:${Math.max(i.value?1.5:0,100*Math.abs(i.value)/max)}%;background:var(--${i.c||"s1"})"></span></span><span class="bl-val num">${fmtv(i.value)}</span></div>`).join("")}</div>`}
// tooltip layer
(function(){const tip=document.createElement("div");tip.className="tip";tip.hidden=true;document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(tip));
  document.addEventListener("mouseover",e=>{const t=e.target.closest&&e.target.closest("[data-tip]");if(!t){tip.hidden=true;return}tip.textContent=tr(t.getAttribute("data-tip"));tip.hidden=false});
  document.addEventListener("mousemove",e=>{if(tip.hidden)return;const w=tip.offsetWidth,x=Math.min(window.innerWidth-w-8,e.clientX+14),y=e.clientY+16;tip.style.left=Math.max(8,x)+"px";tip.style.top=y+"px"});
  document.addEventListener("scroll",()=>{tip.hidden=true},true)})();
