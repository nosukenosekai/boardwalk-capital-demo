let CUR="ja";
const SUPPORTED=Object.keys(I18N);
function applyLang(code){
  if(!I18N[code])code="en";
  CUR=code;document.documentElement.lang=code;document.documentElement.dir=(code==="ar"?"rtl":"ltr");
  const d=I18N[code],en=I18N.en;
  const T=k=>d[k]!=null?d[k]:en[k];   /* 未翻訳キーは英語にフォールバック */
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k=el.getAttribute("data-i18n"),v=T(k);if(v==null)return;
    if(el.hasAttribute("data-i18n-html")||/<span|<br/.test(v))el.innerHTML=v;else el.textContent=v;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{const k=el.getAttribute("data-i18n-ph"),v=T(k);if(v!=null)el.placeholder=v;});
  renderNews(code);
  const m=LANGS.find(l=>l.code===code)||LANG_NAMES[code]||{label:code};
  document.getElementById("langLabel").textContent=m.label;
  document.querySelectorAll("#langMenu button").forEach(b=>b.classList.toggle("active",b.dataset.code===code));
  localStorage.setItem("bwc_lang",code);
}
const LANG_ALIAS={nb:"no",nn:"no"};
function detectLang(){
  const prefs=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||"en"];
  for(const p of prefs){
    const t=p.toLowerCase();
    if(I18N["zh-Hant"]&&/hant|-tw|-hk|-mo/.test(t))return "zh-Hant";
    let b=t.split("-")[0];b=LANG_ALIAS[b]||b;
    if(SUPPORTED.includes(b))return b;
  }
  return "en";
}
const menu=document.getElementById("langMenu");
LANGS.forEach(l=>{const b=document.createElement("button");b.dataset.code=l.code;
  b.innerHTML=`<span class="flag">${l.flag}</span><span>${l.label}</span><span class="native">${l.native}</span>`;
  b.onclick=()=>{applyLang(l.code);menu.classList.remove("open");};menu.appendChild(b);});
const langBtn=document.getElementById("langBtn");
langBtn.onclick=e=>{e.stopPropagation();menu.classList.toggle("open");};
document.addEventListener("click",()=>menu.classList.remove("open"));

/* モバイルメニュー開閉 */
const menuBtn=document.getElementById("menuBtn"),mobileMenu=document.getElementById("mobileMenu");
if(menuBtn&&mobileMenu){
  const closeMenu=()=>{mobileMenu.classList.remove("open");document.body.classList.remove("menu-open");menuBtn.setAttribute("aria-expanded","false");};
  menuBtn.addEventListener("click",()=>{const open=!mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open",open);document.body.classList.toggle("menu-open",open);menuBtn.setAttribute("aria-expanded",String(open));});
  mobileMenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
}

/* News（那珂通雅の経歴・沿革に基づく実データ。項目はここで追加・編集できます） */
/* News — 創業者・那珂通雅の経歴・沿革（全項目 出典: Wikipedia「那珂通雅」で裏取り済み。項目はここで追加・編集できます） */
const NEWS=[
 {date:"2026.04",img:"img/news/skyline.jpg",cat:{ja:"登壇",en:"Event"},title:{ja:"創業者・那珂通雅が「TEAMZ SUMMIT 2026」（東京・八芳園）に登壇しました。",en:"Founder Michimasa Naka spoke at TEAMZ SUMMIT 2026 in Tokyo."}},
 {date:"2025.03",img:"img/news/dusk.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅が一般社団法人東京ニュービジネス協議会の副会長に留任しました。",en:"Founder Michimasa Naka was reappointed Vice Chairman of the Tokyo New Business Council."}},
 {date:"2018",img:"img/news/city.jpg",cat:{ja:"キャリア",en:"Career"},title:{ja:"創業者・那珂通雅が慶應義塾大学大学院システムデザイン・マネジメント研究科の非常勤講師に就任しました。",en:"Founder Michimasa Naka was appointed Adjunct Lecturer at the Keio University Graduate School of System Design and Management."}},
 {date:"2016.07",img:"img/news/skyline.jpg",cat:{ja:"会社情報",en:"Company"},title:{ja:"ボードウォーク・キャピタル株式会社を設立しました。",en:"Boardwalk Capital Inc. was founded."}},
 {date:"2012",img:"img/top/financialtimes.png",cat:{ja:"受賞",en:"Award"},title:{ja:"創業者・那珂通雅が代表を務めるストームハーバー証券が、英『The Banker』誌のInvestment Banking部門で「最も革新的なブティック」を受賞しました。",en:"Storm Harbour Securities, led by founder Michimasa Naka, was named ‘Most Innovative Boutique’ in Investment Banking by The Banker."}},
 {date:"2010.12",img:"img/news/dusk.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅がストームハーバー証券を創業し、代表取締役社長に就任しました。",en:"Founder Michimasa Naka founded Storm Harbour Securities and was appointed President & CEO."}},
 {date:"2009.12",img:"img/news/city.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅がシティグループ証券の取締役副社長に就任しました。",en:"Founder Michimasa Naka was appointed Deputy President of Citigroup Global Markets Japan."}},
 {date:"2004.12",img:"img/news/skyline.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅が日興シティグループ証券の常務執行役員に就任しました。",en:"Founder Michimasa Naka was appointed Managing Executive Officer at Nikko Citigroup."}},
 {date:"1999",img:"img/news/dusk.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅が日興ソロモン・スミス・バーニー証券の債券本部ディレクターに就任しました。",en:"Founder Michimasa Naka was appointed Director of the Fixed Income Division at Nikko Salomon Smith Barney."}},
 {date:"1989",img:"img/news/city.jpg",cat:{ja:"沿革",en:"History"},title:{ja:"創業者・那珂通雅が慶應義塾大学大学院を修了し、ソロモン・ブラザーズ・アジア証券会社に入社しました。",en:"Founder Michimasa Naka completed his master’s degree at Keio University and joined Salomon Brothers Asia."}},
];
async function submitContact(e,form){
  e.preventDefault();
  const btn=form.querySelector('button[type=submit]');
  const orig=btn.innerHTML; btn.disabled=true; btn.style.opacity=".65";
  try{
    const res=await fetch(form.action,{method:"POST",headers:{"Accept":"application/json"},body:new FormData(form)});
    if(res.ok){ form.reset(); alert((I18N[CUR]&&I18N[CUR]["ct.sent"])||I18N.en["ct.sent"]); }
    else { alert((I18N[CUR]&&I18N[CUR]["ct.err"])||"送信に失敗しました。時間をおいて再度お試しください。"); }
  }catch(err){ alert((I18N[CUR]&&I18N[CUR]["ct.err"])||"送信に失敗しました。通信環境をご確認ください。"); }
  finally{ btn.disabled=false; btn.style.opacity=""; btn.innerHTML=orig; }
  return false;
}
function renderNews(lang){
  const el=document.getElementById("newsList");if(!el)return;
  el.innerHTML=NEWS.map(n=>{
    const cat=(n.cat&&(n.cat[lang]||n.cat.en))||"",ttl=(n.title[lang]||n.title.en);
    return `<div class="news-card"><div class="thumb"><img src="${n.img}" alt=""></div><div class="body"><div class="meta"><span class="date">${n.date}</span><span class="cat">${cat}</span></div><div class="ttl">${ttl}</div></div></div>`;
  }).join("");
}

/* 入った瞬間に言語適用（優先順位: URL ?lang= > 保存 > 自動判定）
   メニュー表示は13言語だが、自動判定は全28言語に対応（閲覧者のブラウザ言語へ自動切替・未掲載言語も含む）。
   実演・共有用: 末尾に ?lang=<code> で強制（例 ?lang=pl, ?lang=zh-Hant, ?lang=th）、?lang=auto で自動判定にリセット */
const _p=new URLSearchParams(location.search);
const _url=_p.get("lang");
if(_url==="auto"){localStorage.removeItem("bwc_lang");}
const saved=localStorage.getItem("bwc_lang");
applyLang(
  (_url&&SUPPORTED.includes(_url)) ? _url
  : (saved&&SUPPORTED.includes(saved)) ? saved
  : detectLang()
);

/* partners marquee — クリックで各社サイトへ（公式URL・到達確認済み。要最終確認） */
const PARTNERS=["vectorinc","vision","istyle","geniee","glm","finc","fabbit","donutrobotics"];
const PURL={vectorinc:"https://vectorinc.co.jp/",vision:"https://www.vision-net.co.jp/",istyle:"https://www.istyle.co.jp/",geniee:"https://geniee.co.jp/",glm:"https://glm.jp/",finc:"https://finc.com/",fabbit:"https://fabbit.co.jp/",donutrobotics:"https://www.donutrobotics.com/"};
const mq=document.getElementById("marquee");
const buildLogos=()=>PARTNERS.map(p=>{const img=`<img src="img/partner/${p}.png" alt="${p}">`;
  return PURL[p]?`<a class="logo" href="${PURL[p]}" target="_blank" rel="noopener">${img}</a>`:`<div class="logo">${img}</div>`;}).join("");
mq.innerHTML=buildLogos()+buildLogos();
/* 企業名（日本語社名）→公式URL（グリッド用・全社） ※キスリー株式会社は確実な現行公式URLが確認できず未掲載 */
const CURL={
"GLM株式会社":"https://glm.jp/","株式会社ベクトル":"https://vectorinc.co.jp/","株式会社ビジョン":"https://www.vision-net.co.jp/",
"株式会社アイスタイル":"https://www.istyle.co.jp/","株式会社ジーニー":"https://geniee.co.jp/",
"株式会社FiNC":"https://finc.com/","fabbit株式会社":"https://fabbit.co.jp/","ドーナツ・ロボティクス株式会社":"https://www.donutrobotics.com/",
"プリベント少額短期保険株式会社":"https://mikata-ins.co.jp/","Digital Entertainment Asset":"https://dea.sg/en/","Telcoin":"https://www.telco.in/en",
"Conny & Co.":"https://connyandco.com/","IP Nexus":"https://www.ipnexus.com/","ecobike株式会社":"https://ecobike.co.jp/",
"株式会社Fun Group":"https://corporate.fungroup.com/","株式会社RECEPTIONIST":"https://receptionist.co.jp/","株式会社eWeLL":"https://ewell.co.jp/",
"株式会社アイデンティティー":"https://id-entity.jp/","Houyou株式会社":"https://houyou.co.jp/","株式会社Huber.":"https://huber.co.jp/",
"Welltool株式会社":"https://welltool.co.jp/","株式会社ドゥーファ":"https://dofa.jp/","株式会社m-gram":"https://mgram.co.jp/",
"エンタッチ株式会社":"https://entouch.jp/","株式会社FUN UP":"https://fun-up.jp/","Xperisus Inc.":"https://about.xperisus.com/",
"株式会社プチジョブ":"https://www.petitjob.co.jp/","アクシオンリサーチ株式会社":"https://www.axionr.com/","株式会社BALEUM":"https://baleum.co.jp/",
"the Babels, Inc.":"https://www.babels.co/","株式会社JLBC":"https://jlbc.jp/","WQC株式会社":"https://www.wqctech.com/"
};

/* 投資先・パートナー企業（全33社）。先頭は上場各社を時価総額の大きい順（2026/6時点）、以降は非上場。APAMANは掲載除外。 */
const PCO=[
["株式会社ベクトル","VECTOR"],["株式会社ビジョン","Vision"],["株式会社アイスタイル","istyle"],
["株式会社eWeLL","eWeLL"],["株式会社ジーニー","Geniee"],["Houyou株式会社","Houyou"],
["GLM株式会社","GLM"],["株式会社FiNC","FiNC"],["fabbit株式会社","fabbit"],
["ドーナツ・ロボティクス株式会社","donut robotics"],["プリベント少額短期保険株式会社","Prevent SAST Insurance"],
["Digital Entertainment Asset",""],["Telcoin",""],["Conny & Co.",""],["IP Nexus",""],
["ecobike株式会社","ecobike"],["株式会社Fun Group","Fun Group"],["株式会社RECEPTIONIST","RECEPTIONIST"],
["株式会社アイデンティティー","identity"],["株式会社Huber.","Huber."],["Welltool株式会社","Welltool"],
["株式会社ドゥーファ","dofa"],["株式会社m-gram","m-gram"],["エンタッチ株式会社","enTouch"],
["株式会社FUN UP","FUN UP"],["Xperisus Inc.",""],["株式会社プチジョブ","Petitjob"],
["アクシオンリサーチ株式会社","AXION RESEARCH"],["株式会社BALEUM","BALEUM"],["the Babels, Inc.",""],
["キスリー株式会社","QiTHREE"],["株式会社JLBC","JLBC"],["WQC株式会社","WQC"]
];
const pcEl=document.getElementById("pcompanies");
if(pcEl)pcEl.innerHTML=PCO.map(c=>{const inner=`${c[0]}${c[1]?`<small>${c[1]}</small>`:""}`;const u=CURL[c[0]];
  return u?`<a class="pc" href="${u}" target="_blank" rel="noopener">${inner}<span class="ext">↗</span></a>`:`<div class="pc">${inner}</div>`;}).join("");

/* オープニング：まず桟橋が映り（太陽へズームイン）→ 少し置いて文字が出る */
const hero=document.querySelector(".hero");
/* オープニング演出 → ヒーロー始動。約1.5秒で自動終了、スクロール/タップ/キーで即スキップ。 */
(function(){
  const intro=document.getElementById("intro");
  function go(){hero.classList.add("go");}
  if(!intro){go();return;}
  document.body.classList.add("lock");
  let done=false;
  function finish(){
    if(done)return;done=true;
    intro.classList.add("done");
    document.body.classList.remove("lock");
    go();
    setTimeout(()=>{intro.parentNode&&intro.remove();},1200);
  }
  const t=setTimeout(finish,1900);
  ["wheel","touchstart","keydown","click"].forEach(ev=>
    addEventListener(ev,function(){clearTimeout(t);finish();},{once:true,passive:true}));
})();

/* header solid on scroll */
const hdr=document.getElementById("hdr");
addEventListener("scroll",()=>hdr.classList.toggle("solid",scrollY>40),{passive:true});

/* reveal — re-triggers every time an element enters the viewport */
function countUp(el){
  if(el.dataset.plain)return;
  const target=+el.dataset.count,span=el.querySelector("[data-num]");if(!span)return;
  const dur=1400,t0=performance.now();
  function tick(now){const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);span.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
  setTimeout(()=>{span.textContent=target;},dur+120);
}
const io=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add("in");if(e.target.dataset.count!==undefined)countUp(e.target);}
    else{e.target.classList.remove("in");}
  });
},{threshold:0,rootMargin:"0px 0px -12% 0px"});
document.querySelectorAll(".r,.r-img,[data-count],[data-stagger],.kx").forEach(el=>io.observe(el));
/* cascade delays for staggered grids */
document.querySelectorAll("[data-stagger]").forEach(c=>{
  [...c.children].forEach((ch,i)=>ch.style.transitionDelay=Math.min(i*0.04,0.7)+"s");
});

/* === image parallax (drift on scroll) === */
const plx=[...document.querySelectorAll("[data-parallax]")];
function parallax(){const vh=innerHeight;plx.forEach(el=>{
  const p=el.parentElement.getBoundingClientRect();const center=p.top+p.height/2;
  const off=(center-vh/2)/vh;el.style.transform=`translateY(${(off*-26).toFixed(1)}px) scale(1.12)`;
});}
addEventListener("scroll",parallax,{passive:true});parallax();

/* ヒーロー背景はCSSの連続ケンバーンズ（無限往復）で常時ゆっくり動く。
   旧スクロール視差JSはinline transformでケンバーンズを上書き＝静止させるため撤去。 */
