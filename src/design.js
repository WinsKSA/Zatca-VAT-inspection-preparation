// ================================================================ command-center banner on the dashboard (brand, company, animated readiness ring)
function dashBanner(C){
  const sc=C.score,R=46,CIRC=2*Math.PI*R,off=sc==null?CIRC:CIRC*(1-sc/100),cls=sc==null?"":sc>=85?"ok":sc>=65?"warn":"bad";
  const fails=C.tests.filter(t=>t.status==="fail").length,applied=C.tests.filter(t=>t.status!=="na").length,E=C.exposure;
  const logo=S.setup.logo?`<img src="${esc(S.setup.logo)}" alt="">`:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="18" cy="18" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M24 24l7 7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M14.5 18.5l2.5 2.5 4.5-5" fill="none" stroke="#e3b866" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const stat=(v,l,cnt)=>`<div class="db-stat"><b class="num">${cnt!=null?`<span data-count="${cnt}">${v}</span>`:v}</b><span>${esc(l)}</span></div>`;
  return `<section class="db-hero" aria-label="${esc(L("Inspection overview","نظرة عامة على الفحص"))}"><i class="db-orb a"></i><i class="db-orb b"></i>
    <div class="db-id"><span class="db-logo${S.setup.logo?" img":""}">${logo}</span><div><span class="db-eyebrow">${esc(greeting())}${welcomeName()?`<span data-notr>${LANG==="ar"?"، ":", "}${esc(welcomeName())}</span>`:""}</span>
      <h2 data-notr>${esc(S.setup.company||"—")}</h2><p class="db-slogan" data-notr>${esc(SLOGAN())}</p></div></div>
    <div class="db-stats">${stat(applied,L("tests applied","اختباراً مطبقاً"),applied)}${stat(fails,L("open findings","ملاحظة مفتوحة"),fails)}${stat(fmt0(E.B),L("SAR exposure with the initiative","ريال تعرض مع المبادرة"),Math.round(E.B))}</div>
    <div class="db-ring ${cls}" role="img" aria-label="${esc(L("Compliance score","مؤشر الالتزام"))} ${sc==null?"—":sc}"><svg viewBox="0 0 108 108"><circle cx="54" cy="54" r="${R}" class="t"/><circle cx="54" cy="54" r="${R}" class="f" style="--c:${CIRC.toFixed(1)};--o:${off.toFixed(1)}"/></svg>
      <div><b class="num">${sc==null?"—":`<span data-count="${sc}">${sc}</span>`}</b><small>${esc(L("score","المؤشر"))}</small></div></div>
  </section>`;
}
{const _d=R.dash;R.dash=C=>dashBanner(C)+_d(C)}
