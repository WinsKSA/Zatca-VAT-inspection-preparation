// ================================================================ phone layout: bottom tab bar + "More" sheet with every page
// On wide screens the side rail is used; below 820px the rail is hidden and this bar takes over.
const MTABS=["dash","hub","tests","find"];
function mtabBar(C){
  let bar=document.getElementById("mtab");
  if(!bar){bar=document.createElement("nav");bar.id="mtab";bar.setAttribute("aria-label",L("Main","الرئيسية"));document.body.appendChild(bar);
    bar.addEventListener("click",e=>{const b=e.target.closest("[data-mv]");if(!b)return;if(b.dataset.mv==="more"){openMore();return}closeMore();go(b.dataset.mv)})}
  const n=navCounts(C),inTabs=MTABS.includes(cur);
  const btn=(id,ic,t)=>`<button type="button" data-mv="${id}" aria-current="${id===cur||(id==="more"&&!inTabs)}">${icon(ic)}<span>${esc(t)}</span>${n[id]?`<i class="mt-b">${n[id]}</i>`:""}</button>`;
  bar.innerHTML=MTABS.map(id=>{const v=VIEWS.find(x=>x.id===id)||{i:"home",t:id};return btn(id,v.i,v.t)}).join("")+btn("more","more",L("More","المزيد"));
}
IC.more='<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>';
function openMore(){
  closeMore();const C=compute(),n=navCounts(C);
  const back=document.createElement("div");back.className="msheet-back";back.id="msheet";
  let html="",open=false;
  VIEWS.filter(v=>(!v.admin||isAdmin())).forEach(v=>{
    if(v.g){if(open)html+="</div>";html+=`<h4>${esc(v.g)}</h4><div class="ms-grid">`;open=true;return}
    if(!open){html+=`<div class="ms-grid">`;open=true}
    html+=`<button type="button" data-msv="${v.id}" aria-current="${v.id===cur}"><span class="ms-ic">${icon(v.i)}${n[v.id]?`<i class="mt-b">${n[v.id]}</i>`:""}</span><span>${esc(v.t)}</span></button>`});
  if(open)html+="</div>";
  back.innerHTML=`<div class="msheet" role="dialog" aria-modal="true" aria-label="${esc(L("All pages","كل الصفحات"))}"><div class="ms-grab"></div>
    <div class="ms-head"><div><b data-notr>${esc(S.setup.company||"—")}</b><small class="num">${esc(S.setup.vat||"")}</small></div><button type="button" class="wp-x ms-x" aria-label="${esc(L("Close","إغلاق"))}">×</button></div>${html}</div>`;
  document.body.appendChild(back);
  back.addEventListener("click",e=>{if(e.target===back||e.target.closest(".ms-x")){closeMore();return}const b=e.target.closest("[data-msv]");if(b){closeMore();go(b.dataset.msv)}});
  document.addEventListener("keydown",moreEsc);
}
function moreEsc(e){if(e.key==="Escape")closeMore()}
function closeMore(){const m=document.getElementById("msheet");if(m){m.classList.add("out");setTimeout(()=>m.remove(),260)}document.removeEventListener("keydown",moreEsc)}
{const _rn=renderNav;renderNav=function(C){_rn(C);mtabBar(C)}}
