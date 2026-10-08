/* 文件：youxi.js（游戏）
   五个功能在下面分别标了：签到、答题、商店、衣柜、打猎。
   普通改题目/金币/价格请去 shezhi.js，不必改这里。
*/
(() => {
'use strict';
const P = window.SHEZHI;
const ITEMS = window.WUPIN;
const ITEM_BY_ID = Object.fromEntries(ITEMS.map(x => [x.id,x]));
const CATEGORY_NAME = {outfit:'衣服',hat:'帽子',glasses:'眼镜',accessory:'小配饰'};
const STORAGE_KEY = 'family-doodle-adventure:v1';
const $ = id => document.getElementById(id);
const pop = $('window'), body = $('popup-body');
const today = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand = (min,max) => min + Math.floor(Math.random()*(max-min+1));
function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function stock(){let a=ITEMS.filter(x=>!x.starter).slice(), seed=hash('shop:'+today());for(let i=a.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,4)}
function wait(ms){if(ms<=0)return '可以领取啦';const sec=Math.ceil(ms/1000);return [Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,'0')).join(':')}
function fresh(){return {coins:P.chushi,checkins:[],quizCompleted:[],inventory:['plain-dress'],equipped:{outfit:'plain-dress',hat:null,glasses:null,accessory:null},hunt:null}}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!x||typeof x!=='object')return fresh();const s=fresh();s.coins=Number.isFinite(x.coins)?Math.max(0,Math.floor(x.coins)):s.coins;s.checkins=Array.isArray(x.checkins)?x.checkins.filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)):[];s.quizCompleted=Array.isArray(x.quizCompleted)?x.quizCompleted.filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)):[];s.inventory=[...new Set(['plain-dress',...(Array.isArray(x.inventory)?x.inventory:[]).filter(id=>ITEM_BY_ID[id])])];for(const t of Object.keys(s.equipped)){const id=x.equipped?.[t];if(id===null&&t!=='outfit')s.equipped[t]=null;else if(s.inventory.includes(id)&&ITEM_BY_ID[id]?.type===t)s.equipped[t]=id}if(x.hunt&&Number.isFinite(x.hunt.startedAt)&&Number.isFinite(x.hunt.endsAt)&&x.hunt.endsAt>=x.hunt.startedAt)s.hunt=x.hunt;return s}catch{return fresh()}}
let state=load(), clock=null, toastTimer=null;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{tip('当前浏览器未能保存存档')}sync()}
function tip(text){$('tip').textContent=text;$('tip').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('tip').classList.remove('show'),2500)}
function outfit(id) {
  const base = '<path d="M105 205 Q132 196 164 204 Q175 246 183 299 L194 351 Q149 365 87 350 L95 298 Q99 249 105 205Z" fill="white"/>';
  switch (id) {
    case 'striped-dress':
      return `${base}<g stroke-width="2.3" opacity=".7"><path d="M112 231 Q139 237 168 229"/><path d="M105 254 Q142 263 174 250"/><path d="M98 279 Q140 288 179 277"/><path d="M94 308 Q138 316 187 307"/><path d="M91 332 Q139 343 189 333"/></g>`;
    case 'star-dress':
      return `${base}<g fill="#fff" stroke-width="2.2"><path d="M130 242 l5 12 13 1 -10 8 3 13 -11 -7 -11 7 3 -13 -10 -8 13 -1z"/><path d="M166 292 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z"/><path d="M107 306 l3 6 7 1 -5 5 1 6 -6 -3 -6 3 2 -6 -5 -5 7 -1z"/></g>`;
    case 'bunny-hoodie':
      return '<path d="M104 202 Q138 192 169 203 Q179 249 185 295 L191 346 Q146 362 92 345 L99 290Z" fill="#eee"/><path d="M115 204 Q135 228 158 204" fill="none"/><path d="M126 261 Q141 268 156 261 M127 271 Q144 282 159 270" fill="none" stroke-width="2"/><path d="M125 295 q12 -8 25 0" fill="none"/>';
    case 'raincoat':
      return '<path d="M109 201 Q139 197 165 204 L191 354 Q142 366 88 352Z" fill="#ededed"/><path d="M138 206 Q144 264 145 358 M113 248 l16 1 0 17 -18 -1z M153 250 l18 -3 2 18 -19 3z" fill="white" stroke-width="2.2"/><circle cx="139" cy="238" r="2.5" fill="black" stroke="none"/><circle cx="142" cy="278" r="2.5" fill="black" stroke="none"/>';
    default: return base;
  }
}
function headwear(id) {
  switch (id) {
    case 'beret': return '<path d="M87 53 Q89 27 130 22 Q165 9 199 40 Q195 51 182 54 Q142 40 104 60Z" fill="#f0f0f0"/><path d="M154 25 q-2 -12 9 -15" fill="none"/>';
    case 'top-hat': return '<path d="M98 54 L102 1 Q142 -8 185 5 L188 52Z" fill="white"/><path d="M96 45 Q143 53 190 46 L199 54 Q141 65 88 57Z" fill="#eee"/><path d="M100 34 L187 34" fill="none"/>';
    case 'party-hat': return '<path d="M121 47 L153 -6 L183 43 Q151 54 121 47Z" fill="white"/><circle cx="153" cy="-8" r="7" fill="white"/><path d="M139 24 l14 6 m1 -18 l11 6" stroke-width="2"/>';
    case 'crown': return '<path d="M105 55 L105 21 L124 37 L142 4 L164 37 L186 18 L184 55Z" fill="#f6f6f6"/><circle cx="143" cy="40" r="4" fill="white"/>';
    default: return '';
  }
}
function glasses(id) {
  switch (id) {
    case 'round-glasses': return '<g stroke-width="2.7"><circle cx="119" cy="113" r="16" fill="none"/><circle cx="169" cy="112" r="16" fill="none"/><path d="M135 112 Q144 106 153 112 M103 110 L92 104 M185 110 L200 104" fill="none"/></g>';
    case 'square-glasses': return '<g stroke-width="2.7" fill="none"><rect x="101" y="99" width="36" height="29" rx="6"/><rect x="151" y="98" width="36" height="29" rx="6"/><path d="M137 110 L151 110 M101 105 L91 103 M187 103 L198 101"/></g>';
    case 'sunglasses': return '<g stroke-width="2.5"><path d="M98 100 Q118 93 137 101 L135 123 Q120 134 104 122Z" fill="#333"/><path d="M150 100 Q167 92 190 99 L184 121 Q167 133 153 121Z" fill="#333"/><path d="M137 106 Q144 101 150 106 M98 104 L91 100 M190 103 L199 100" fill="none"/></g>';
    default: return '';
  }
}
function accessory(id) {
  switch (id) {
    case 'scarf': return '<path d="M105 191 Q137 214 172 194 L169 224 Q133 244 105 217Z" fill="#eee"/><path d="M161 217 L172 273 L152 276 L143 226" fill="white"/>';
    case 'bowtie': return '<path d="M139 212 L118 202 L117 227 L139 220 L159 228 L163 202 L140 212Z" fill="#efefef"/><circle cx="140" cy="216" r="6" fill="white"/>';
    case 'crossbag': return '<path d="M113 215 Q150 270 178 292" stroke-width="3" fill="none"/><path d="M151 283 q18 -6 34 5 l-2 29 q-19 10 -38 -2Z" fill="#eee"/><path d="M151 289 l30 3" stroke-width="2"/>';
    case 'heart-pin': return '<path d="M159 252 C150 239 138 248 147 259 L160 269 L174 255 C181 243 167 238 159 252Z" fill="#ddd" stroke-width="2.5"/>';
    default: return '';
  }
}

function avatarSvg(equipped = {}) {
  const { outfit: outfitId, hat, glasses: eyewear, accessory: ornament } = equipped;
  return `<svg class="avatar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 -17 278 485" role="img" aria-label="穿着打扮好的可爱手绘小人">
    <g stroke="#181818" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
      <!-- 脚和手都用不规则曲线，保留原手稿的轻松感 -->
      <g fill="none" stroke-width="4"><path d="M115 348 Q108 391 112 431 Q112 439 88 442"/><path d="M156 352 Q157 406 174 462 L158 463"/><path d="M104 215 Q80 246 65 291 L72 334 Q77 329 82 318"/><path d="M174 217 Q199 263 207 300 L186 338"/></g>
      ${outfit(outfitId)}
      <!-- 头部、眼睛和微笑 -->
      <path d="M76 104 C71 64 96 39 130 35 C170 24 208 35 215 66 C226 105 207 153 179 176 C160 193 128 197 103 183 C81 170 72 142 76 104Z" fill="white"/>
      <path d="M114 102 Q110 118 111 124" stroke-width="4.3" fill="none"/><path d="M170 100 Q175 112 172 123" stroke-width="4.3" fill="none"/><path d="M126 144 Q141 158 157 143" stroke-width="3.6" fill="none"/>
      <path d="M97 139 q6 4 12 1 M174 140 q6 4 12 -1" stroke="#aaa" stroke-width="2" fill="none"/>
      ${glasses(eyewear)}
      ${headwear(hat)}
      ${accessory(ornament)}
    </g>
  </svg>`;
}

/* ===== 首页、弹窗与通用交互 ===== */
function sync(){
  $('jinbi').textContent=state.coins.toLocaleString('zh-CN');
  $('avatar').innerHTML=avatarSvg(state.equipped);
  $('q-dot').classList.toggle('done',state.checkins.includes(today()));
  $('d-dot').classList.toggle('done',state.quizCompleted.includes(today()));
  const h=state.hunt;
  $('hunt-label').textContent=!h?'打猎':h.endsAt>Date.now()?'打猎中':'领收获';
  $('hunt-time').textContent=!h?`耗费 ${P.xiaoshi} 小时！`:h.endsAt>Date.now()?`出门中 · ${wait(h.endsAt-Date.now())}`:'小人回来了！快领取收获';
}
function modal(title){if(clock){clearInterval(clock);clock=null}$('popup-title').textContent=title;body.innerHTML='';if(!pop.open)pop.showModal()}
function close(){if(clock){clearInterval(clock);clock=null}if(pop.open)pop.close()}
$('guanbi').addEventListener('click',close);
pop.addEventListener('click',e=>{if(e.target===pop)close()});
pop.addEventListener('close',()=>{if(clock){clearInterval(clock);clock=null}});

/* ===== 1. 签到 qiandao ===== */
function qiandao(){
  modal('每日签到');let year=new Date().getFullYear(), month=new Date().getMonth();
  function draw(){
    const signed=state.checkins.includes(today());
    const first=(new Date(year,month,1).getDay()+6)%7;
    const count=new Date(year,month+1,0).getDate();
    let grid=['一','二','三','四','五','六','日'].map(x=>`<div class="weekday">${x}</div>`).join('');
    grid+='<div class="blank"></div>'.repeat(first);
    for(let n=1;n<=count;n++){
      const key=today(new Date(year,month,n)), did=state.checkins.includes(key);
      grid+=`<div class="day ${did?'signed':''} ${key===today()?'today':''}" aria-label="${key}${did?'已签到':''}">${n}${did?'<b>✓</b>':''}</div>`;
    }
    body.innerHTML=`<p class="intro">今天也留下一个小小脚印吧 ♡</p><div class="month"><button id="last-month">←</button><strong>${year} 年 ${month+1} 月</strong><button id="next-month">→</button></div><div class="calendar">${grid}</div><p class="sub">黑色 = 已签到　·　圆圈 = 今天</p><button class="action" id="sign" ${signed?'disabled':''}>${signed?'今天已经签到啦 ✓':`签到 · +${P.qiandao} 金币`}</button><p class="sub">一天仅可签到一次，不能补签。</p>`;
    $('last-month').onclick=()=>{const d=new Date(year,month-1,1);year=d.getFullYear();month=d.getMonth();draw()};
    $('next-month').onclick=()=>{const d=new Date(year,month+1,1);year=d.getFullYear();month=d.getMonth();draw()};
    $('sign').onclick=()=>{const key=today();if(state.checkins.includes(key))return;state.checkins.push(key);state.coins+=P.qiandao;save();tip(`签到成功！金币 +${P.qiandao}`);draw()};
  }draw();
}

/* ===== 2. 答题 dati ===== */
function dati(){
  modal('每日答题');let picked=-1,wrong=false;
  function draw(){
    const list=P.timu, q=list.length?list[hash(today())%list.length]:null;
    if(!q){body.textContent='请先在 shezhi.js 里添加题目';return}
    const done=state.quizCompleted.includes(today());
    const options=q.options.map((v,i)=>`<button class="select ${picked===i?'active':''}" data-choice="${i}" ${done?'disabled':''}>${'ABCD'[i]||i}. ${esc(v)}</button>`).join('');
    body.innerHTML=`<p class="intro">每天一道家人之间的小问题，答对 +${P.dati} 金币。</p><div class="paper"><small>今日小考 · ${today()}</small><h3>${esc(q.question)}</h3>${options}</div><p class="sub">${done?'今天已答对，金币已到账 ♡':wrong?'回答不对，再想想～':'选一个你觉得对的答案'}</p>${done?'':`<button id="answer" class="action" ${picked<0?'disabled':''}>确认答案</button>`}<p class="sub">答错可以再试；答对每天只奖励一次。</p>`;
    body.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>{picked=Number(btn.dataset.choice);wrong=false;draw()});
    if($('answer'))$('answer').onclick=()=>{if(picked!==q.answer){picked=-1;wrong=true;draw();return}if(!state.quizCompleted.includes(today())){state.quizCompleted.push(today());state.coins+=P.dati;save();tip(`答对了！金币 +${P.dati}`)}draw()};
  }draw();
}

/* ===== 3. 商店 shangdian ===== */
function shangdian(){
  modal('今日商店');
  function draw(){
    const goods=stock().map(x=>{const owned=state.inventory.includes(x.id),lack=state.coins<x.price;
      return `<article><div class="emoji">${esc(x.symbol)}</div><small>${CATEGORY_NAME[x.type]}</small><h3>${esc(x.name)}</h3><p>${esc(x.hint)}</p><button data-buy="${esc(x.id)}" ${owned||lack?'disabled':''}>${owned?'已拥有 ✓':lack?`差 ${x.price-state.coins} 金币`:`购买 · ${x.price} 金币`}</button></article>`;
    }).join('');
    body.innerHTML=`<p class="intro">商店每天按手机本地日期随机刷新 4 件商品。</p><p class="sub">${today()}　·　余额 ${state.coins} 金币</p><div class="goods">${goods}</div><p class="sub">买下的物品自动放入衣柜。</p>`;
    body.querySelectorAll('[data-buy]').forEach(btn=>btn.onclick=()=>{const x=stock().find(v=>v.id===btn.dataset.buy);if(!x||state.inventory.includes(x.id)||state.coins<x.price)return;state.coins-=x.price;state.inventory.push(x.id);save();tip(`买到「${x.name}」啦！`);draw()});
  }draw();
}

/* ===== 4. 衣柜 yigui ===== */
function yigui(){
  modal('我的衣柜');let kind='outfit';
  function draw(){
    const tabs=Object.keys(CATEGORY_NAME).map(x=>`<button class="tab ${kind===x?'active':''}" data-tab="${x}">${CATEGORY_NAME[x]}</button>`).join('');
    const owned=state.inventory.map(id=>ITEM_BY_ID[id]).filter(x=>x&&x.type===kind);
    const itemButtons=owned.map(x=>`<button class="warditem ${state.equipped[kind]===x.id?'active':''}" data-wear="${esc(x.id)}"><span>${esc(x.symbol)}</span>${esc(x.name)} ${state.equipped[kind]===x.id?'✓':''}</button>`).join('');
    body.innerHTML=`<p class="intro">给小人换件衣服，或者戴一顶帽子吧 ♡</p><div class="preview">${avatarSvg(state.equipped)}<small>今日穿搭</small></div><div class="tabs">${tabs}</div><div class="goods">${kind!=='outfit'?'<button class="warditem" data-wear="">✕ 取下配饰</button>':''}${itemButtons||'<div class="empty">还没有这一类物品，去商店看看吧</div>'}</div>`;
    body.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{kind=btn.dataset.tab;draw()});
    body.querySelectorAll('[data-wear]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.wear;if(id){const x=ITEM_BY_ID[id];if(!state.inventory.includes(id)||!x||x.type!==kind)return;state.equipped[kind]=id}else if(kind!=='outfit')state.equipped[kind]=null;save();tip('换装成功 ♡');draw()});
  }draw();
}

/* ===== 5. 打猎 dalie ===== */
function dalie(){
  modal('出去打猎');let result='';
  function draw(){
    const h=state.hunt, ongoing=h&&h.endsAt>Date.now(), ready=h&&!ongoing;
    body.innerHTML=`<p class="intro">背上小包，出去探索一下这个世界吧。</p><div class="hunt-art">${ongoing?'♧ · ♧':ready?'☆ ⌂ ☆':'⌂ ♡ ⌂'}</div><div class="hunt-card"><h3>${ongoing?'小人正在森林里散步…':ready?'小人带着收获回来啦！':'要不要出发？'}</h3><div class="clock" id="clock">${ongoing?wait(h.endsAt-Date.now()):ready?'可以领取啦':`${P.xiaoshi} 小时后回来`}</div><p>${ongoing?'可以关闭网页，计时不会消失。':'每次 50～200 金币，还有机会得到新衣服或小配饰。'}</p></div><button class="action" id="hunt-action" ${ongoing?'disabled':''}>${ongoing?'正在打猎，耐心等等 ♡':ready?'领取打猎成果':'出发！'}</button>${result?`<div class="notice">${result}</div>`:''}<p class="sub">真实等待 ${P.xiaoshi} 小时，完成后点击领取奖励。</p>`;
    $('hunt-action').onclick=()=>{
      if(!state.hunt){const now=Date.now();state.hunt={startedAt:now,endsAt:now+P.xiaoshi*3600000};save();result='';tip('出发啦！');draw();return}
      if(state.hunt.endsAt>Date.now())return;
      const coins=rand(P.zuishao,P.zuiduo),unowned=ITEMS.filter(x=>!x.starter&&!state.inventory.includes(x.id));
      const gift=unowned.length&&Math.random()<P.liwu?unowned[rand(0,unowned.length-1)]:null;
      state.coins+=coins;
      if(gift)state.inventory.push(gift.id);
      state.hunt=null;save();
      result=`金币 +${coins}<p>${gift?`还带回了「${esc(gift.name)}」！已放进衣柜。`:'这次没有带回小礼物，下次再试试～'}</p>`;
      tip(`金币 +${coins}`);draw();
    };
  }
  draw();clock=setInterval(()=>{if(!pop.open){clearInterval(clock);clock=null;return}if(state.hunt&&state.hunt.endsAt<=Date.now()){if(!$('hunt-action')?.disabled)return;draw()}else if($('clock')&&state.hunt)$('clock').textContent=wait(state.hunt.endsAt-Date.now())},1000);
}

/* ===== 帮助 + 页面事件 ===== */
function bangzhu(){modal('怎么玩？');body.innerHTML=`<div class="paper" style="line-height:1.9;font-size:14px"><p>签到：每天 +${P.qiandao} 金币。</p><p>答题：每天一题，答对 +${P.dati} 金币。</p><p>打猎：等待 ${P.xiaoshi} 小时，领随机金币和礼物。</p><p>商店：每天更换 4 件商品。</p><p>衣柜：给小人穿上买到和捡到的物品。</p><hr><p>存档保存在当前浏览器，不会自动跨手机同步。清理浏览器网站数据可能清除进度。</p></div>`}
const pages={qiandao,dati,shangdian,yigui,dalie};
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>pages[b.dataset.page]?.());
$('bangzhu').onclick=bangzhu;
$('xiaoren').onclick=()=>{const words=['今天也想和你一起玩 ♡','你戳到我啦！','今天也要开开心心','要不要换一顶帽子？','等我打猎回来喔～'];$('speak').textContent=words[rand(0,words.length-1)];$('speak').classList.add('on');setTimeout(()=>$('speak').classList.remove('on'),2000)};
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){state=load();sync();if(pop.open)close()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
setInterval(sync,15000);sync();
})();
