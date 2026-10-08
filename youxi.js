/* youxi.js = 游戏。这里有小人绘制、签到、答题、商店、换装、打猎。
   改题目、商品名字、金币数量、价格，请优先去 shezhi.js。
   版本 v2：发型、上衣、裤子、帽子、面饰，每类正好十种。
*/
(() => {
'use strict';
const P=window.SHEZHI, ITEMS=window.WUPIN;
const BY=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
const CATEGORY={hair:'发型',top:'上衣',pants:'裤子',hat:'帽子',face:'面饰'};
const KEY='family-doodle-adventure:v2', OLD='family-doodle-adventure:v1';
const $=id=>document.getElementById(id);
const dialog=$('window'), body=$('popup-body');
const today=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clip=(v,a,b)=>Math.min(b,Math.max(a,v));
function hash(t){let h=2166136261;for(const c of t){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function wait(ms){if(ms<=0)return '可以领取啦！';const s=Math.ceil(ms/1000);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')}
const defaults={hair:'hair-pony-black',top:'top-white',pants:'pants-black',hat:null,face:null};
function fresh(){return {coins:P.chushi,checkins:[],quizCompleted:[],inventory:['hair-pony-black','top-white','pants-black'],equipped:{...defaults},hunt:null,shop:null}}
/* 从上一版升级：保留金币、签到、答题与打猎；旧款道具换成新款对应物。 */
const LEGACY={
  'plain-dress':'top-white','striped-dress':'top-racer','star-dress':'top-sequin',
  'bunny-hoodie':'top-duck','raincoat':'top-tech',
  'beret':'hat-beret','top-hat':'hat-mini','party-hat':'hat-cat','crown':'hat-crown',
  'round-glasses':'face-round','square-glasses':'face-square','sunglasses':'face-sun',
  'scarf':'top-purple','bowtie':'face-heart','crossbag':'pants-cargo','heart-pin':'face-star'
};
function readJSON(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
function load(){
  const modern=readJSON(KEY), source=modern&&typeof modern==='object'?modern:readJSON(OLD);
  const s=fresh();if(!source||typeof source!=='object')return s;
  s.coins=Number.isFinite(source.coins)?clip(Math.floor(source.coins),0,999999999):s.coins;
  for(const t of ['checkins','quizCompleted']){
    if(Array.isArray(source[t]))s[t]=[...new Set(source[t].filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))];
  }
  if(Array.isArray(source.inventory)){
    for(const rawId of source.inventory){const id=BY[rawId]?rawId:LEGACY[rawId];if(id&&!s.inventory.includes(id))s.inventory.push(id)}
  }
  const oldEquipped=source.equipped||{};
  for(const t of Object.keys(defaults)){
    let id=oldEquipped[t];
    if(!id && !modern){if(t==='top')id=oldEquipped.outfit;if(t==='hat')id=oldEquipped.hat;if(t==='face')id=oldEquipped.glasses}
    id=BY[id]?id:LEGACY[id];
    if(id&&s.inventory.includes(id)&&BY[id].type===t)s.equipped[t]=id;
    if(modern&&oldEquipped[t]===null&&(t==='hat'||t==='face'))s.equipped[t]=null;
  }
  if(source.hunt && Number.isFinite(source.hunt.startedAt)&&Number.isFinite(source.hunt.endsAt)&&source.hunt.endsAt>=source.hunt.startedAt){s.hunt={startedAt:source.hunt.startedAt,endsAt:source.hunt.endsAt}}
  if(source.shop&&typeof source.shop.date==='string'&&Array.isArray(source.shop.ids)){
    s.shop={date:source.shop.date,ids:source.shop.ids.filter(id=>BY[id]&&!BY[id].starter).slice(0,4)};
  }
  return s;
}
let state=load(), tick=null,toastTimer=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{tip('浏览器没法保存存档，请检查隐私模式')}sync()}
function tip(t){const el=$('tip');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800)}
/* 每天四个商品位：当天固定，买走会标记已拥有，不会临时刷走。 */
function storeItems(){
  if(!state.shop||state.shop.date!==today()||state.shop.ids.length!==4){
    let pool=ITEMS.filter(x=>!x.starter&&!state.inventory.includes(x.id));
    if(pool.length<4)pool=ITEMS.filter(x=>!x.starter);
    let seed=hash('Game1028-'+today());
    for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
    state.shop={date:today(),ids:pool.slice(0,4).map(x=>x.id)};save();
  }
  return state.shop.ids.map(id=>BY[id]).filter(Boolean);
}
/* ——————— 用几何 SVG 绘制彩色小人 ——————— */
const HEAD='M92 103 Q87 56 135 46 Q192 31 218 77 Q231 119 208 158 Q188 186 153 187 Q112 186 96 158 Q83 134 92 103Z';
const line='stroke="#25252b" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
function hairStyle(id){
  const brown=id.endsWith('-brown'),col=brown?'#a58a83':'#29272f',shine=brown?'#d1b3a5':'#53515b';
  const shape=id.split('-')[1]||'pony';
  let back='',front='';
  const edge=`fill="${col}" stroke="#27232c" stroke-width="3.5" stroke-linejoin="round"`;
  switch(shape){
    case 'pony':
      back=`<path d="M205 72 Q255 55 248 106 Q255 156 234 168 Q217 157 223 123 Q217 92 205 92Z" ${edge}/><path d="M222 86 Q256 78 245 137" fill="none" stroke="${shine}" stroke-width="4"/>`;
      front=`<path d="M91 111 Q84 55 133 40 Q196 27 220 77 L212 111 Q201 93 191 85 Q182 117 170 105 L158 88 Q143 116 132 107 L119 90 Q113 111 92 117Z" ${edge}/><path d="M102 78 Q148 43 194 61" fill="none" stroke="${shine}" stroke-width="3" opacity=".8"/>`;
      break;
    case 'straight':
      back=`<path d="M100 62 Q83 90 77 235 Q101 249 121 228 L132 170 L176 169 L194 241 Q224 244 229 230 Q231 100 210 65Z" ${edge}/><path d="M95 160 Q92 219 85 229 M213 162 Q221 217 213 231" fill="none" stroke="${shine}" stroke-width="3"/>`;
      front=`<path d="M91 109 Q88 42 154 37 Q210 36 222 99 L216 123 L210 111 L197 101 L192 116 L176 103 L160 114 L144 102 L127 115 L110 106 L94 122Z" ${edge}/>`;
      break;
    case 'twin':
      back=`<path d="M108 86 Q65 66 53 105 Q38 143 58 180 Q77 196 92 173 Q81 138 102 120Z" ${edge}/><path d="M201 85 Q246 60 253 109 Q266 150 243 183 Q224 194 210 170 Q228 128 199 118Z" ${edge}/><path d="M58 128 L81 135 M242 129 L221 135" stroke="${shine}" fill="none" stroke-width="3"/>`;
      front=`<path d="M91 113 Q85 47 141 40 Q198 29 218 100 L210 118 L198 103 L189 115 L174 100 L157 115 L138 102 L125 116 L107 101 L93 120Z" ${edge}/><circle cx="95" cy="92" r="6" fill="#f4a6c5"/><circle cx="215" cy="91" r="6" fill="#f4a6c5"/>`;
      break;
    case 'side':
      back=`<path d="M110 52 Q74 75 78 191 Q74 223 98 251 L121 243 L128 181 L182 179 Q191 228 213 259 Q238 239 228 201 Q230 100 209 63Z" ${edge}/><path d="M213 157 Q210 225 224 241" fill="none" stroke="${shine}" stroke-width="3"/>`;
      front=`<path d="M93 121 Q80 46 145 35 Q211 30 223 93 Q201 113 173 105 Q140 91 119 127 Q104 139 93 121Z" ${edge}/><path d="M119 87 Q170 47 214 77" fill="none" stroke="${shine}" stroke-width="3"/>`;
      break;
    case 'wolf':
      back=`<path d="M101 63 Q80 93 90 153 L68 174 L104 165 L91 194 L126 179 Q148 190 172 177 L199 195 L200 163 L236 174 L218 151 Q228 89 201 58Z" ${edge}/>`;
      front=`<path d="M89 108 Q88 57 120 48 L123 34 L147 43 L171 32 L188 44 L208 46 Q229 71 219 111 L203 103 L191 80 L178 106 L158 83 L140 112 L122 83 L107 107Z" ${edge}/><path d="M113 68 L142 56 L161 73" fill="none" stroke="${shine}" stroke-width="3"/>`;
      break;
  }
  return {back,front};
}
function legs(id){
  const map={
    'pants-black':['#2e2e35','long'], 'pants-jeans':['#668fd0','long'],
    'pants-white':['#f9faf7','wide'], 'pants-pink':['#f5b9d7','short-puff'],
    'pants-gray':['#9f9fa7','short'], 'pants-cargo':['#40424c','cargo'],
    'pants-flare':['#a57fdb','flare'], 'pants-silver':['#c4cfdf','wide'],
    'pants-plaid':['#d85b70','long'], 'pants-galaxy':['#353963','long']
  };
  const [c,fit]=map[id]||map['pants-black'];
  const skin='<path d="M127 331 L124 423 L138 423 L143 342Z M166 337 L166 425 L180 425 L179 331Z" fill="#ffe9dc"/>';
  const shoes='<path d="M123 418 Q114 433 100 431 Q93 438 104 442 L145 442 L145 423Z M164 422 Q166 434 175 443 L202 444 Q208 434 183 421Z" fill="#fefefe"/>';
  if(fit.startsWith('short')){
    const puff=fit==='short-puff';
    return `${skin}<path d="M118 310 Q148 304 184 310 L188 ${puff?365:355} Q172 ${puff?377:359} 155 ${puff?361:353} Q139 ${puff?377:362} 113 ${puff?365:354}Z" fill="${c}"/><path d="M151 321 L152 357" fill="none"/>${puff?'<path d="M118 365 Q130 374 149 366 M156 363 Q170 374 185 364" fill="none" stroke="#fcedf6" stroke-width="3"/>':''}${shoes}`;
  }
  const wide=fit==='wide'||fit==='flare';
  const d=wide?'M119 310 Q150 304 184 310 L205 420 L156 422 L149 348 L143 420 L98 420Z':'M120 308 L181 308 L187 424 L159 426 L150 345 L144 423 L116 423Z';
  let detail='';
  if(id==='pants-jeans')detail='<path d="M119 333 L134 337 M164 336 L183 331 M125 375 L134 375" fill="none" stroke="#b6d2ec" stroke-width="2"/>';
  if(id==='pants-white')detail='<path d="M114 334 Q102 378 103 419 M176 334 Q191 388 196 418" fill="none" stroke="#dad9d2" stroke-width="2"/>';
  if(id==='pants-cargo')detail='<path d="M118 351 L138 350 L139 378 L116 380Z M161 355 L185 351 L184 380 L162 381Z" fill="#5f6470"/><path d="M112 382 L138 397 M159 397 L188 380" fill="none" stroke="#aaadb5" stroke-width="2"/>';
  if(id==='pants-flare')detail='<path d="M120 332 Q133 360 114 420 M177 327 Q173 370 194 416" fill="none" stroke="#d8b4f3" stroke-width="4"/><path d="M105 407 L145 407 M156 408 L199 407" fill="none" stroke="#f1d2fd" stroke-width="3"/>';
  if(id==='pants-silver')detail='<path d="M112 350 Q133 360 143 350 M160 358 Q176 369 191 351 M111 394 Q130 401 145 391 M161 395 Q181 405 196 395" fill="none" stroke="#f9ffff" stroke-width="4"/>';
  if(id==='pants-plaid')detail='<path d="M122 330 L181 331 M120 354 L183 355 M119 378 L186 379 M117 400 L187 401 M135 310 L136 419 M173 312 L177 419" fill="none" stroke="#763945" stroke-width="2" opacity=".7"/>';
  if(id==='pants-galaxy')detail='<g fill="#ffdf8a" stroke="none"><path d="M128 343 l3 6 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 8 -1z"/><circle cx="176" cy="368" r="3"/><circle cx="124" cy="401" r="2"/><circle cx="172" cy="405" r="2"/></g>';
  if(id==='pants-black')detail='<path d="M130 331 L126 416 M174 332 L178 414" fill="none" stroke="#63646e" stroke-width="2"/>';
  return `${skin}<path d="${d}" fill="${c}"/>${detail}${shoes}`;
}
function shirt(id){
  const colors={
    'top-white':'#fff','top-punk':'#26252d','top-pink':'#ffbdd8','top-duck':'#ffdb61',
    'top-gray':'#aaa9ab','top-racer':'#d94c59','top-tech':'#79dbe5',
    'top-sequin':'#d4d9e6','top-purple':'#bea5ee','top-velvet':'#298e9a'
  };
  const c=colors[id]||'#fff';
  const long=['top-punk','top-racer','top-tech','top-purple','top-velvet'].includes(id);
  const puff=['top-pink','top-purple'].includes(id);
  let sleeves=long?`<path d="M120 205 Q105 201 100 225 L81 287 L99 297 L123 237Z M182 205 Q196 198 202 225 L223 286 L204 298 L179 238Z" fill="${c}"/>`:
    ` <path d="M122 206 Q110 198 100 213 L86 243 L110 258 L127 236Z M178 206 Q193 198 205 214 L217 245 L190 257 L175 232Z" fill="${c}"/>`;
  if(puff)sleeves=`<path d="M122 209 Q104 193 90 212 Q79 238 101 252 L122 239Z M181 210 Q204 194 215 214 Q224 238 202 251 L179 239Z" fill="${c}"/><path d="M91 247 Q103 254 119 247 M182 245 Q200 254 214 245" fill="none" stroke="#fff1f6" stroke-width="3"/>`;
  if(id==='top-gray')sleeves='';
  let base=`${sleeves}<path d="M123 206 Q151 201 180 207 L187 316 Q148 328 115 315Z" fill="${c}"/><path d="M136 207 Q149 224 165 207" fill="none" stroke="${id==='top-punk'?'#e2cde5':'#85838a'}" stroke-width="2"/>`;
  if(id==='top-gray')base=`<path d="M126 206 L177 207 L184 315 Q148 327 117 315Z" fill="${c}"/><path d="M125 209 Q150 231 178 208" fill="none" stroke="#666" stroke-width="3"/>`;
  let decorations='';
  if(id==='top-white')decorations='<path d="M135 247 Q149 258 164 247" fill="none" stroke="#d1d1d1" stroke-width="2"/><circle cx="149" cy="270" r="3" fill="#ff7f9d" stroke="none"/>';
  if(id==='top-punk')decorations='<path d="M118 228 L181 267 M181 228 L118 267" stroke="#ed466b" stroke-width="7" fill="none"/><path d="M145 242 l-9 20 13 -4 -6 22 22 -30 -13 4 5 -12Z" fill="#f8f8f8" stroke-width="2"/><path d="M82 278 L100 281 M205 281 L222 277" stroke="#aaa" stroke-width="3"/>';
  if(id==='top-pink')decorations='<g stroke="#fff5f9" stroke-width="2.5" fill="none"><path d="M116 297 Q149 308 186 295 M116 309 Q149 317 187 309 M125 232 Q149 240 177 231"/></g><path d="M150 244 L132 231 L131 256 L150 248 L169 256 L170 231Z" fill="#fa719e"/><circle cx="150" cy="244" r="5" fill="#fff"/>';
  if(id==='top-duck')decorations='<g><ellipse cx="150" cy="265" rx="20" ry="17" fill="#ffe990" stroke="#b17a20" stroke-width="2"/><circle cx="144" cy="259" r="3.5" fill="#292929" stroke="none"/><path d="M151 266 l14 3 -14 7Z" fill="#ff963c"/><path d="M160 257 Q170 251 174 263" fill="none" stroke="#b17a20" stroke-width="2"/></g>';
  if(id==='top-gray')decorations='<path d="M131 253 Q150 258 172 252" fill="none" stroke="#8a898a" stroke-width="3"/>';
  if(id==='top-racer')decorations='<path d="M123 211 L149 254 L150 314 L160 315 L158 251 L179 210Z" fill="#26262e"/><path d="M117 255 L187 245" fill="none" stroke="#fff" stroke-width="4"/><path d="M119 280 L187 270" fill="none" stroke="#26262e" stroke-width="3"/><path d="M145 225 l9 12 -11 1z" fill="#fff"/><path d="M90 265 L100 267 M204 264 L218 264" fill="none" stroke="#fff" stroke-width="3"/>';
  if(id==='top-tech')decorations='<path d="M122 227 L181 285 L185 316 L160 316 L118 269Z" fill="#ffb7db"/><path d="M180 215 L125 272" fill="none" stroke="#5955cc" stroke-width="8"/><path d="M150 225 L159 245 L151 249 L164 271" fill="none" stroke="#fff" stroke-width="4"/><path d="M90 274 L103 279 M200 276 L216 270" fill="none" stroke="#5f50d2" stroke-width="4"/>';
  if(id==='top-sequin')decorations='<g fill="#fff" stroke="#a6acc2" stroke-width="1"><path d="M143 232 l5 10 11 1 -9 7 3 10 -10 -5 -9 6 2 -11 -9 -7 11 -1Z"/><path d="M163 277 l3 6 6 1 -5 4 2 6 -6 -3 -5 3 1 -6 -5 -4 6 -1Z"/><path d="M130 292 l4 7 7 1 -6 4 2 7 -7 -4 -5 4 1 -7 -6 -4 7 -1Z"/></g><path d="M120 307 L185 307" stroke="#fff" stroke-width="5"/>';
  if(id==='top-purple')decorations='<path d="M149 207 L139 248 L151 259 L164 246 L159 208" fill="#fff7ff"/><path d="M151 237 L132 225 L131 246 L150 243 L171 248 L171 225Z" fill="#8d5bc1"/><circle cx="151" cy="238" r="4" fill="#f9d2fc"/><path d="M117 287 L186 290" fill="none" stroke="#e5d4fb" stroke-width="4"/>';
  if(id==='top-velvet')decorations='<path d="M120 208 L150 262 L139 290 L119 233Z M180 209 L151 263 L164 288 L185 233Z" fill="#15707e"/><path d="M127 215 L151 257 L142 265 M177 214 L153 256 L163 265" fill="none" stroke="#e1b364" stroke-width="3"/><circle cx="151" cy="280" r="4" fill="#e5c375"/><path d="M164 297 l7 -4 -1 9Z" fill="#e5c375"/>';
  return base+decorations;
}
function hatShape(id){
  switch(id){
    case 'hat-beret':return '<path d="M87 65 Q93 27 153 23 Q206 22 225 59 L210 72 Q148 60 95 79Z" fill="#24232b"/><path d="M151 31 Q153 16 164 16" fill="none" stroke="#24232b" stroke-width="5"/>';
    case 'hat-cap':return '<path d="M92 81 Q91 34 157 30 Q213 31 217 89Z" fill="#989ba3"/><path d="M168 82 Q230 78 243 90 Q223 103 172 93Z" fill="#b8b9c0"/><path d="M135 49 Q159 39 184 51" fill="none" stroke="#d7d8dd" stroke-width="3"/>';
    case 'hat-ducks':return `<path d="M96 80 Q153 35 215 80" fill="none" stroke="#f3b3c8" stroke-width="6"/>${[111,198].map(x=>`<g><ellipse cx="${x}" cy="54" rx="18" ry="14" fill="#ffe05e"/><circle cx="${x-5}" cy="50" r="2.6" fill="#222" stroke="none"/><path d="M${x+4} 54 l12 5 -12 5Z" fill="#ff943d"/></g>`).join('')}`;
    case 'hat-bows':{
      const bow=x=>`<g fill="#ffa4cf"><path d="M${x} 81 l-25 -20 -4 30 26 -5 M${x} 81 l24 -20 7 29 -27 -5"/><circle cx="${x}" cy="81" r="8" fill="#ff6ba8"/><path d="M${x-4} 88 l-9 25 15 -7 13 7 -8 -26" fill="#ffb8de"/></g>`;
      return bow(92)+bow(214);
    }
    case 'hat-bucket':return '<path d="M104 38 Q156 17 205 38 L218 83 L84 85Z" fill="#ca4655"/><path d="M100 79 Q156 69 221 76 L232 92 Q155 105 73 91Z" fill="#e15b6b"/><circle cx="148" cy="55" r="6" fill="#ffc2c8"/>';
    case 'hat-cat':return '<path d="M100 80 L102 35 L127 59 Q154 42 184 59 L208 33 L212 82" fill="#bd9aeb"/><path d="M103 80 Q153 57 211 82" fill="none" stroke="#9b78c5" stroke-width="6"/><path d="M110 43 L111 64 L123 59 M198 44 L195 62 L185 58" fill="#f5c5ec"/>';
    case 'hat-crown':return '<path d="M97 83 L96 35 L119 57 L149 11 L176 55 L210 30 L207 84Z" fill="#dce5f1"/><path d="M98 73 L208 73" stroke="#8a96b5" stroke-width="4"/><circle cx="153" cy="60" r="7" fill="#67bde4"/><circle cx="120" cy="67" r="4" fill="#f4cb5d"/><circle cx="185" cy="67" r="4" fill="#f5a0ce"/>';
    case 'hat-pearl':return `<path d="M94 85 Q153 22 215 84" fill="none" stroke="#c7baa8" stroke-width="5"/>${[0,1,2,3,4,5,6,7].map(i=>{const x=101+i*15.5,y=77-27*Math.sin(i/7*Math.PI);return `<circle cx="${x}" cy="${y}" r="6" fill="#fff7f3" stroke="#bcb4bc" stroke-width="1.7"/>`}).join('')}`;
    case 'hat-beanie':return '<path d="M92 90 Q86 32 153 25 Q216 25 218 88Z" fill="#93c3e2"/><path d="M89 74 Q152 65 221 74 L219 94 Q154 87 91 95Z" fill="#74a7cc"/><circle cx="152" cy="23" r="12" fill="#daeef6"/><path d="M112 60 L126 51 M161 48 L179 60" fill="none" stroke="#daebf7" stroke-width="3"/>';
    case 'hat-mini':return '<path d="M127 65 L133 15 Q155 8 177 19 L185 65Z" fill="#297f73"/><path d="M114 64 Q152 71 193 62 L207 73 Q160 85 110 75Z" fill="#3a9f82"/><path d="M133 49 L182 51" fill="none" stroke="#ebc77f" stroke-width="5"/>';
    default:return '';
  }
}
function faceShape(id){
  switch(id){
    case 'face-round':return '<g fill="none" stroke="#c4a16b" stroke-width="3"><circle cx="123" cy="121" r="16"/><circle cx="181" cy="120" r="16"/><path d="M139 118 Q151 113 165 118 M107 119 L95 113 M197 117 L209 113"/></g>';
    case 'face-square':return '<g fill="none" stroke="#292b31" stroke-width="3"><rect x="106" y="104" width="35" height="31" rx="5"/><rect x="164" y="103" width="35" height="31" rx="5"/><path d="M141 113 L164 113 M106 110 L95 106 M199 110 L211 107"/></g>';
    case 'face-sun':return '<path d="M103 108 Q122 101 143 109 L140 129 Q125 143 108 128Z M162 109 Q181 100 204 109 L196 129 Q177 140 165 128Z" fill="#252630"/><path d="M143 113 L162 113 M103 113 L95 107 M204 111 L213 105" fill="none"/>';
    case 'face-rimless':return '<g fill="none" stroke="#d0aa5c" stroke-width="2.3"><ellipse cx="125" cy="120" rx="19" ry="13"/><ellipse cx="180" cy="120" rx="19" ry="13"/><path d="M144 118 L161 118 M107 113 L96 108 M199 111 L210 108"/></g>';
    case 'face-cyber':return '<path d="M102 117 Q127 111 147 114 L143 125 L105 127Z M157 114 Q185 110 203 116 L201 128 L159 125Z" fill="#76dae7" stroke="#6252d8"/><path d="M143 119 L157 119" fill="none" stroke="#6252d8" stroke-width="3"/>';
    case 'face-heart':return '<path d="M123 133 Q98 117 104 109 Q112 97 124 112 Q136 99 143 110 Q150 120 123 133Z M183 133 Q157 117 164 108 Q174 96 184 111 Q196 98 202 108 Q209 121 183 133Z" fill="#fbaccc" fill-opacity=".45" stroke="#ea6798" stroke-width="3"/><path d="M143 116 L163 116" fill="none" stroke="#ea6798" stroke-width="3"/>';
    case 'face-star':return [124,182].map(x=>`<path d="M${x} 103 l5 12 13 1 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -1Z" fill="#ffe47b" fill-opacity=".5" stroke="#d9ac45" stroke-width="2.6"/>`).join('')+'<path d="M140 118 L164 118" fill="none" stroke="#d9ac45"/>';
    case 'face-monocle':return '<circle cx="181" cy="120" r="20" fill="none" stroke="#c4a277" stroke-width="3"/><path d="M201 127 Q218 162 198 197" fill="none" stroke="#c4a277" stroke-width="2"/><path d="M196 197 l5 -5" fill="none" stroke="#c4a277" stroke-width="2"/>';
    case 'face-patch':return '<path d="M103 111 Q151 97 207 109" fill="none" stroke="#333" stroke-width="3"/><path d="M105 110 Q124 100 142 112 L140 133 Q122 142 108 130Z" fill="#2f3037"/><path d="M124 111 l3 7 7 1 -6 4 2 7 -6 -4 -6 4 2 -7 -6 -4 7 -1Z" fill="#ffdf7c" stroke="none"/>';
    case 'face-cat':return '<path d="M103 115 Q116 102 140 106 L141 130 Q123 142 111 126Z M164 108 Q191 103 203 114 L197 129 Q179 144 166 130Z" fill="#d9bbea" fill-opacity=".3" stroke="#9563bb" stroke-width="3"/><path d="M141 116 L164 116 M102 114 L94 106 M203 114 L210 107" fill="none" stroke="#c9a055" stroke-width="3"/>';
    default:return '';
  }
}
function avatarSvg(equip={}){
  const e={...defaults,...equip},hair=hairStyle(e.hair||defaults.hair);
  const bodyArms='<path d="M121 220 Q101 252 87 294 L79 323 Q81 332 90 330 L112 282 M184 221 Q199 250 216 298 L225 325 Q219 335 212 326 L192 276" fill="none" stroke="#ffe3d4" stroke-width="15"/>';
  return `<svg class="avatar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="45 5 220 450" role="img" aria-label="可爱彩色换装小人">
    <g ${line}>${legs(e.pants)}${bodyArms}<path d="M144 169 L143 218 L172 218 L171 165Z" fill="#ffe8d8"/>${shirt(e.top)}
    ${hair.back}<path d="${HEAD}" fill="#fff0e6"/><path d="M111 158 Q120 165 132 158 M179 159 Q191 164 198 155" fill="none" stroke="#f9bbbd" stroke-width="3"/>
    <path d="M119 114 Q117 127 120 130 M185 113 Q185 126 182 129" fill="none" stroke="#24232a" stroke-width="4.4"/>
    <path d="M137 152 Q150 165 165 149" fill="none" stroke="#302d33" stroke-width="3.5"/>
    <ellipse cx="113" cy="141" rx="9" ry="4" fill="#ffb4b6" stroke="none" opacity=".75"/><ellipse cx="195" cy="140" rx="9" ry="4" fill="#ffb4b6" stroke="none" opacity=".75"/>
    ${hair.front}${faceShape(e.face)}${hatShape(e.hat)}</g>
  </svg>`;
}
function cardPreview(item){return avatarSvg({...state.equipped,[item.type]:item.id})}
/* ——————— 公共弹窗、游戏状态 ——————— */
function sync(){
  $('jinbi').textContent=state.coins.toLocaleString('zh-CN');
  $('avatar').innerHTML=avatarSvg(state.equipped);
  $('q-dot').classList.toggle('done',state.checkins.includes(today()));
  $('d-dot').classList.toggle('done',state.quizCompleted.includes(today()));
  const h=state.hunt,ongoing=h&&h.endsAt>Date.now();
  $('hunt-label').textContent=!h?'打猎':ongoing?'摸鱼中':'领战利品';
  $('hunt-time').textContent=!h?`离家出走 ${P.xiaoshi} 小时（会回来）`:ongoing?`正在外面瞎逛：${wait(h.endsAt-Date.now())}`:'战利品已到账前台，请签收！';
}
function modal(t){if(tick){clearInterval(tick);tick=null}$('popup-title').textContent=t;body.innerHTML='';if(!dialog.open)dialog.showModal()}
function close(){if(tick){clearInterval(tick);tick=null}if(dialog.open)dialog.close()}
$('guanbi').onclick=close;
dialog.addEventListener('click',ev=>{if(ev.target===dialog)close()});
dialog.addEventListener('close',()=>{if(tick){clearInterval(tick);tick=null}});
/* 1. 签到 */
function qiandao(){
  modal('每日签到 · 白嫖快乐');let y=new Date().getFullYear(),m=new Date().getMonth();
  function draw(){
    let cells=['一','二','三','四','五','六','日'].map(x=>`<div class="weekday">${x}</div>`).join('');
    cells+='<div class="blank"></div>'.repeat((new Date(y,m,1).getDay()+6)%7);
    for(let n=1;n<=new Date(y,m+1,0).getDate();n++){
      const key=today(new Date(y,m,n)),signed=state.checkins.includes(key);
      cells+=`<div class="day ${signed?'signed':''} ${key===today()?'today':''}" aria-label="${key}${signed?'已签到':''}">${n}${signed?'<b>✓</b>':''}</div>`;
    }
    const done=state.checkins.includes(today());
    body.innerHTML=`<p class="intro">今天也得来一下！不然金币会想你。💸</p><div class="month"><button id="last-month" aria-label="上个月">←</button><strong>${y} 年 ${m+1} 月</strong><button id="next-month" aria-label="下个月">→</button></div><div class="calendar">${cells}</div><p class="sub">黑色是已签到 · 圆圈框住的是今天</p><button class="action" id="sign" ${done?'disabled':''}>${done?'今天已经薅过羊毛 ✓':`签到！喜提 ${P.qiandao} 金币`}</button><p class="sub">一天一次，贪心的小手会被系统看见。</p>`;
    $('last-month').onclick=()=>{const d=new Date(y,m-1,1);y=d.getFullYear();m=d.getMonth();draw()};
    $('next-month').onclick=()=>{const d=new Date(y,m+1,1);y=d.getFullYear();m=d.getMonth();draw()};
    $('sign').onclick=()=>{if(state.checkins.includes(today()))return;state.checkins.push(today());state.coins+=P.qiandao;save();tip(`签到成功！+${P.qiandao} 金币，富得很克制。`);draw()};
  }draw();
}
/* 2. 答题 */
function dati(){
  modal('每日答题 · 家庭八卦考场');let chosen=-1,wrong=false;
  function draw(){
    const qs=P.timu,q=qs.length?qs[hash(today())%qs.length]:null;
    if(!q){body.textContent='题库空空如也！去 shezhi.js 加几道题吧。';return}
    const done=state.quizCompleted.includes(today());
    const choices=q.options.map((v,i)=>`<button class="select ${chosen===i?'active':''}" data-choice="${i}" ${done?'disabled':''}>${'ABCD'[i]||i}. ${esc(v)}</button>`).join('');
    body.innerHTML=`<p class="intro">我考的不是知识，是你到底有多了解我！答对 +${P.dati} 金币。</p><div class="paper"><small>今日脑洞 · ${today()}</small><h3>${esc(q.question)}</h3>${choices}</div><p class="sub">${done?'今天过关！奖励早就到账啦～':wrong?'错啦！再想想，不要闭眼乱蒙。':'选好答案，勇敢交卷。'}</p>${done?'':`<button id="answer" class="action" ${chosen<0?'disabled':''}>交卷！</button>`}<p class="sub">答错可以重试，但每天答对只发一次钱。</p>`;
    body.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>{chosen=+btn.dataset.choice;wrong=false;draw()});
    if($('answer'))$('answer').onclick=()=>{if(chosen!==q.answer){chosen=-1;wrong=true;draw();return}if(!state.quizCompleted.includes(today())){state.quizCompleted.push(today());state.coins+=P.dati;save();tip(`满分选手！金币 +${P.dati}`)}draw()};
  }draw();
}
/* 3. 商店 */
function shangdian(){
  modal('今日商店 · 有钱就嚣张');
  const items=storeItems();
  function draw(){
    const goods=items.map(x=>{
      const owned=state.inventory.includes(x.id),poor=state.coins<x.price;
      return `<article><div class="product-art" style="--tint:${esc(x.color)}44">${cardPreview(x)}<div class="sticker">${esc(x.symbol)}</div></div><small>${CATEGORY[x.type]}</small><h3>${esc(x.name)}</h3><p>${esc(x.hint)}</p><button data-buy="${esc(x.id)}" ${owned||poor?'disabled':''}>${owned?'买过了 ✓':poor?`还差 ${x.price-state.coins} 金币`:`豪掷 ${x.price} 金币`}</button></article>`;
    }).join('');
    body.innerHTML=`<p class="intro">每天随机摆摊 4 件，今天不买，明天可能就跑了。🛍️</p><p class="sub">${today()} · 钱包余额：${state.coins} 金币</p><div class="goods">${goods}</div><p class="sub">付款后自动入衣柜。商品小人是实际穿搭预览。</p>`;
    body.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
      const x=items.find(i=>i.id===b.dataset.buy);
      if(!x||state.inventory.includes(x.id)||state.coins<x.price)return;
      state.coins-=x.price;state.inventory.push(x.id);save();tip(`「${x.name}」收入囊中，快去臭美！`);draw();
    });
  }draw();
}
/* 4. 衣柜：五个分类，每类十种；未解锁也展示，不能穿。 */
function yigui(){
  modal('快乐衣柜 · 每天换个身份');let kind='hair';
  function draw(){
    const all=ITEMS.filter(x=>x.type===kind),owned=all.filter(x=>state.inventory.includes(x.id));
    const tabs=Object.keys(CATEGORY).map(t=>`<button class="tab ${t===kind?'active':''}" data-tab="${t}">${CATEGORY[t]}</button>`).join('');
    const cards=all.map(x=>{
      const have=state.inventory.includes(x.id),wear=state.equipped[kind]===x.id;
      return `<button class="warditem ${wear?'active':''} ${have?'':'locked'}" style="--tint:${esc(x.color)}3e" data-wear="${esc(x.id)}" ${have?'':'disabled'}><span class="item-emoji">${esc(x.symbol)}</span><span><strong>${esc(x.name)}</strong><small>${wear?'✓ 现在穿着':have?'点击立刻穿上':'🔒 未解锁'}</small></span></button>`;
    }).join('');
    body.innerHTML=`<p class="intro">谁说衣柜没满不能出门？主打一个随时变脸。💅</p><div class="preview">${avatarSvg(state.equipped)}<small>实时试衣间 · 美貌不负责售后</small></div><div class="tabs">${tabs}</div><p class="closet-count">${CATEGORY[kind]}：已拥有 ${owned.length} / ${all.length}</p>${['hat','face'].includes(kind)?'<button class="takeoff" data-wear="">✕ 今天想素一点：取下这件</button>':''}<div class="ward-grid">${cards}</div><p class="sub">未解锁的去每日商店碰运气，或让小人打猎捡回来。</p>`;
    body.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{kind=b.dataset.tab;draw()});
    body.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.wear,x=BY[id];
      if(id&&(!x||x.type!==kind||!state.inventory.includes(id)))return;
      if(!id&&!['hat','face'].includes(kind))return;
      state.equipped[kind]=id||null;save();tip('换好了！今天依然美得很有道理。');draw();
    });
  }draw();
}
/* 5. 打猎 */
function dalie(){
  modal('打猎 · 离谱探险队');let result='';
  function draw(){
    const h=state.hunt,working=h&&h.endsAt>Date.now(),ready=h&&!working;
    body.innerHTML=`<p class="intro">名叫打猎，实际上就是带薪散步（工资随机）。🌲</p><div class="hunt-art">${working?'🌳 🐾 🌲':ready?'🎁 🪙 ✨':'🏕️ 🦆 🌼'}</div><div class="hunt-card"><h3>${working?'正在森林里认真摸鱼…':ready?'本人回来了，还带着袋子！':'是不是该出去装装忙了？'}</h3><div class="clock" id="clock">${working?wait(h.endsAt-Date.now()):ready?'快来开箱！':`${P.xiaoshi} 小时后回来`}</div><p>${working?'放心，关掉网页也会继续计时。':`一趟奖励 ${P.zuishao}～${P.zuiduo} 金币，有机会捡到新装备。`}</p></div><button id="hunt-action" class="action" ${working?'disabled':''}>${working?'外出营业中，请勿催单':ready?'开盲盒！领取战利品':'出发！假装很忙！'}</button>${result?`<div class="notice">${result}</div>`:''}<p class="sub">打猎真实等待 ${P.xiaoshi} 小时；中途可以关掉网页。</p>`;
    $('hunt-action').onclick=()=>{
      if(!state.hunt){const now=Date.now();state.hunt={startedAt:now,endsAt:now+P.xiaoshi*3600000};result='';save();tip('出门啦！希望小人不是去吃火锅。');draw();return}
      if(state.hunt.endsAt>Date.now())return;
      const coins=rand(P.zuishao,P.zuiduo),unowned=ITEMS.filter(x=>!x.starter&&!state.inventory.includes(x.id));
      const gift=unowned.length&&Math.random()<P.liwu?unowned[rand(0,unowned.length-1)]:null;
      state.coins+=coins;if(gift)state.inventory.push(gift.id);state.hunt=null;save();
      result=`💰 ${coins} 金币！<p>${gift?`离谱！还捡到「${esc(gift.name)}」！已塞进衣柜。`:'没捡到衣服，可能是森林里没开服装店。'}</p>`;
      tip(`到账 ${coins} 金币，钱包稍微挺直了腰。`);draw();
    };
  }
  draw();tick=setInterval(()=>{if(!dialog.open){clearInterval(tick);tick=null;return}if(state.hunt&&state.hunt.endsAt<=Date.now()){if($('hunt-action')?.disabled)draw()}else if(state.hunt&&$('clock'))$('clock').textContent=wait(state.hunt.endsAt-Date.now())},1000);
}
function bangzhu(){
  modal('玩法 · 一份不正经说明书');
  body.innerHTML=`<div class="paper" style="line-height:1.9;font-size:14px"><p>🗓 签到：每天赚 ${P.qiandao} 金币，早起的鸟儿有零花钱。</p><p>🧠 答题：每天一题，答对 +${P.dati} 金币，错了继续猜。</p><p>🌲 打猎：出门 ${P.xiaoshi} 小时，回来拿金币，还可能捡到服装。</p><p>🛍 商店：每天固定刷新 4 件，想买就得攒钱。</p><p>🎀 衣柜：发型、上衣、裤子、帽子、面饰共 50 件单品。帽子与面饰可摘下。</p><hr><p>存档只在当前浏览器保存；换手机不会自动同步。清除网站数据可能丢失进度哦。</p></div>`;
}
const pages={qiandao,dati,shangdian,yigui,dalie};
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>pages[b.dataset.page]?.());
$('bangzhu').onclick=bangzhu;
$('xiaoren').onclick=()=>{
  const words=['你戳一下，我的工伤就多一天。','今天宜摸鱼，忌努力。','我拥有五十套衣服的野心。','我愿称这套穿搭为：有点东西。','不要催我打猎，我是去散步的。','为什么钱总是在快没时才有用？','别看了，这个可爱是不收费的。','再戳我，给你表演一个原地发呆。'];
  const bubble=$('speak');bubble.textContent=words[rand(0,words.length-1)];bubble.classList.add('on');clearTimeout(bubble.timer);bubble.timer=setTimeout(()=>bubble.classList.remove('on'),2800);
};
window.addEventListener('storage',e=>{if(e.key===KEY){state=load();sync();if(dialog.open)close()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
setInterval(sync,15000);
save();
})();