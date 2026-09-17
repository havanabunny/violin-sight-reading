/* Violin Sight Reading — a Duolingo-style note trainer. Vanilla JS, no dependencies. */

// ---------------- Data ----------------
// step: diatonic staff steps, 0 = bottom line (E4). Each step = half a line-gap.
const NOTES = {
  G3:{label:'G',  freq:196.00, step:-5},
  A3:{label:'A',  freq:220.00, step:-4},
  B3:{label:'B',  freq:246.94, step:-3},
  C4:{label:'C',  freq:261.63, step:-2},
  D4:{label:'D',  freq:293.66, step:-1},
  E4:{label:'E',  freq:329.63, step:0},
  Fs4:{label:'F♯', freq:369.99, step:1,  acc:true},
  G4:{label:'G',  freq:392.00, step:2},
  A4:{label:'A',  freq:440.00, step:3},
  B4:{label:'B',  freq:493.88, step:4},
  Cs5:{label:'C♯', freq:554.37, step:5,  acc:true},
  D5:{label:'D',  freq:587.33, step:6},
  E5:{label:'E',  freq:659.26, step:7},
  Fs5:{label:'F♯', freq:739.99, step:8,  acc:true},
  G5:{label:'G',  freq:783.99, step:9},
  A5:{label:'A',  freq:880.00, step:10},
  B5:{label:'B',  freq:987.77, step:11},
};
const ALL_KEYS = Object.keys(NOTES);
const LEVELS = [
  {id:1, title:'Open Strings',  desc:'G · D · A · E',        icon:'🎻', notes:['G3','D4','A4','E5']},
  {id:2, title:'D & A Strings', desc:'First position',       icon:'🎵', notes:['E4','Fs4','G4','A4','B4','Cs5','D5']},
  {id:3, title:'Low & High',    desc:'G string · E string',  icon:'🎶', notes:['A3','B3','C4','G3','Fs5','G5','E5']},
  {id:4, title:'Ledger Lines',  desc:'Beyond the staff',     icon:'🏆', notes:['A5','B5'], all:true},
];
const ROUND_LEN = 10;

// ---------------- Fingerboard ----------------
// Viewed as the player sees it: G string on the left, scroll at top.
const STRINGS = [
  {name:'G', open:'G3', fingers:['A3','B3','C4','D4']},
  {name:'D', open:'D4', fingers:['E4','Fs4','G4','A4']},
  {name:'A', open:'A4', fingers:['B4','Cs5','D5','E5']},
  {name:'E', open:'E5', fingers:['Fs5','G5','A5','B5']},
];
// note key -> every playable spot {s: string index, f: 0=open,1..4 finger}
const NOTE_SPOTS = {};
STRINGS.forEach((st, si) => {
  (NOTE_SPOTS[st.open] = NOTE_SPOTS[st.open] || []).push({s:si, f:0});
  st.fingers.forEach((k, fi) => {
    (NOTE_SPOTS[k] = NOTE_SPOTS[k] || []).push({s:si, f:fi + 1});
  });
});
function spotName(si, f){
  const ord = ['open','1st','2nd','3rd','4th'];
  return f === 0 ? `open ${STRINGS[si].name} string` : `${ord[f]} finger · ${STRINGS[si].name} string`;
}

// ---------------- Storage ----------------
function loadS(){
  try { return JSON.parse(localStorage.getItem('vsr')) || null; } catch(e){ return null; }
}
let S = loadS() || {xp:0, streak:0, lastDay:null, unlocked:1, stars:{}};
function saveS(){ try{ localStorage.setItem('vsr', JSON.stringify(S)); }catch(e){} }
function dayStr(d){ return d.toISOString().slice(0,10); }
function bumpStreak(){
  const t = dayStr(new Date());
  if (S.lastDay === t) return;
  const y = dayStr(new Date(Date.now() - 864e5));
  S.streak = (S.lastDay === y) ? S.streak + 1 : 1;
  S.lastDay = t; saveS();
}

// ---------------- Audio ----------------
let AC = null;
function ac(){
  if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if(AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, delay, dur, vol){
  const c = ac();
  const go = () => {
    try{
      const t = c.currentTime + (delay || 0);
      const o = c.createOscillator(), o2 = c.createOscillator();
      const g = c.createGain(), g2 = c.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2; g2.gain.value = 0.22;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.22, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }catch(e){}
  };
  if(c.state === 'suspended') c.resume().then(go).catch(go); else go();
}
function playNote(key){ tone(NOTES[key].freq, 0, 1.2, 0.24); }
function sfxGood(){ tone(523.25, 0, .16, .18); tone(659.25, .09, .16, .18); tone(783.99, .18, .3, .2); }
function sfxBad(){ tone(196, 0, .22, .16); tone(147, .1, .32, .16); }

// ---------------- Notation (SVG) ----------------
function staffSVG(key){
  const g = 16, W = 380, topY = 80;
  const y0 = topY + 4 * g;                 // step 0 = bottom line (E4)
  const y = s => y0 - s * g / 2;
  const cx = 218, n = NOTES[key], st = n.step;
  let s = '';
  for(let i = 0; i < 5; i++)
    s += `<line x1="14" y1="${topY + i*g}" x2="${W-14}" y2="${topY + i*g}" class="staff-line"/>`;
  s += `<text x="56" y="${topY + 2*g}" text-anchor="middle" class="clef">𝄞</text>`;
  const led = [];
  if(st <= -2){ for(let l = -2; l >= st - (st % 2 === 0 ? 0 : 1); l -= 2) led.push(l); }
  if(st >= 10){ for(let l = 10; l <= st + (st % 2 === 0 ? 0 : 1); l += 2) led.push(l); }
  led.forEach(l => { s += `<line x1="${cx-28}" y1="${y(l)}" x2="${cx+28}" y2="${y(l)}" class="ledger"/>`; });
  const cy = y(st), stemLen = 3.5 * g;
  if(st >= 4) s += `<line x1="${cx-10}" y1="${cy+5}" x2="${cx-10}" y2="${cy+stemLen}" class="stem"/>`;
  else        s += `<line x1="${cx+10}" y1="${cy-5}" x2="${cx+10}" y2="${cy-stemLen}" class="stem"/>`;
  if(n.acc) s += `<text x="${cx-46}" y="${cy + 8}" class="acc">♯</text>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="8.6" transform="rotate(-18 ${cx} ${cy})" class="notehead"/>`;
  return `<svg viewBox="0 0 ${W} ${topY + 4*g + 58}" class="staff" aria-label="note">${s}</svg>`;
}

// Fingerboard geometry — researched from real 4/4 violin measurements:
// fingerboard 270mm long (24mm wide at nut, 42mm at end), scale (nut→bridge) 328mm.
// Finger distance from nut follows 12-TET: d = 328 * (1 - 2^(-n/12)) mm, n = semitones.
// 1st (+2): 35.8mm, 2nd (+4): 67.7mm, 3rd (+5): 82.3mm, 4th (+7): 109.1mm.
// The board is cropped just past 4th finger (135mm) with a fade implying continuation;
// row positions below are true to scale within the shown region. String spread is
// widened vs. reality for tappable dots — only the longitudinal distances are exact.
const FB_NUT_Y = 40, FB_BOT_Y = 360;
const FB_TOP_X = [134, 165, 196, 227], FB_BOT_X = [110, 157, 204, 251];
const FB_ROWS = [40, 125, 200, 235, 299]; // open, 1st..4th — true-scale semitone positions
function fbX(si, y){
  const t = (y - FB_NUT_Y) / (FB_BOT_Y - FB_NUT_Y);
  return FB_TOP_X[si] + (FB_BOT_X[si] - FB_TOP_X[si]) * t;
}
function spotSVG(si, f, mode, isCorrect){
  const y = FB_ROWS[f], x = fbX(si, y);
  const key = f === 0 ? STRINGS[si].open : STRINGS[si].fingers[f - 1];
  const r = 15;
  let cls = 'spot', inner = '';
  if(mode === 'chart')
    inner = `<text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" class="fb-lab">${NOTES[key].label}</text>`;
  if(mode === 'reveal' && isCorrect(si, f)) cls += ' right';
  return `<g class="${cls}" data-s="${si}" data-f="${f}" data-k="${key}">`
    + `<circle cx="${x}" cy="${y}" r="27" fill="transparent"/>`
    + `<circle class="dot" cx="${x}" cy="${y}" r="${r}"/>${inner}</g>`;
}
// mode: 'quiz' (blank, tappable) | 'reveal' (correct spots green) | 'chart' (labeled)
function fingerboardSVG(mode, targetKey){
  const W = 360, H = 400;
  const correct = targetKey ? (NOTE_SPOTS[targetKey] || []) : [];
  const isCorrect = (si, f) => correct.some(c => c.s === si && c.f === f);
  let s = `<defs><linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#3d3d42"/><stop offset="1" stop-color="#222226"/></linearGradient>`
    + `<linearGradient id="fbFade" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity="1"/></linearGradient></defs>`;
  s += `<path d="M108,40 L252,40 L276,360 L84,360 Z" fill="url(#fbGrad)" stroke="#141416" stroke-width="2"/>`;
  const sw = [4, 3.4, 2.8, 2.2];
  for(let i = 0; i < 4; i++)
    s += `<line x1="${FB_TOP_X[i]}" y1="34" x2="${FB_BOT_X[i]}" y2="360" stroke="#d7d7d7" stroke-width="${sw[i]}" opacity="0.85" stroke-linecap="round"/>`;
  s += `<rect x="60" y="318" width="240" height="42" fill="url(#fbFade)"/>`;
  s += `<rect x="104" y="27" width="152" height="15" rx="5" fill="#f3ead8" stroke="#d9cdb4" stroke-width="2"/>`;
  const names = ['G','D','A','E'];
  for(let i = 0; i < 4; i++)
    s += `<text x="${FB_TOP_X[i]}" y="16" text-anchor="middle" class="fb-str">${names[i]}</text>`;
  for(let f = 1; f <= 4; f++)
    s += `<text x="64" y="${FB_ROWS[f]}" text-anchor="middle" dominant-baseline="central" class="fb-fnum">${f}</text>`;
  // half-step marker between 2nd and 3rd fingers
  s += `<line x1="46" y1="${FB_ROWS[2]}" x2="46" y2="${FB_ROWS[3]}" class="fb-halfline"/>`
     + `<text x="33" y="${(FB_ROWS[2] + FB_ROWS[3]) / 2}" text-anchor="middle" dominant-baseline="central" class="fb-half">½</text>`;
  for(let si = 0; si < 4; si++){
    s += spotSVG(si, 0, mode, isCorrect);
    for(let f = 1; f <= 4; f++) s += spotSVG(si, f, mode, isCorrect);
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="fb" id="fbSvg" role="img" aria-label="violin fingerboard">${s}</svg>`;
}

// ---------------- Helpers ----------------
const app = document.getElementById('app');
const sheet = document.getElementById('sheet');
function shuffle(a){ a = a.slice(); for(let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function hideSheet(){ sheet.className = 'sheet'; sheet.innerHTML = ''; }
function levelPool(lv){ return lv.all ? ALL_KEYS : lv.notes; }
function unlockedNotes(){
  const keys = [];
  LEVELS.forEach(lv => { if(lv.id <= S.unlocked) levelPool(lv).forEach(k => { if(!keys.includes(k)) keys.push(k); }); });
  return keys;
}
function confetti(){
  const c = document.getElementById('confetti');
  const colors = ['#58cc02','#1cb0f6','#ffc800','#ff4b4b','#ce82ff'];
  for(let i = 0; i < 80; i++){
    const d = document.createElement('div');
    d.className = 'cf';
    d.style.left = (Math.random()*100) + 'vw';
    d.style.background = colors[i % colors.length];
    d.style.animationDelay = (Math.random()*0.7) + 's';
    c.appendChild(d);
    setTimeout(() => d.remove(), 3800);
  }
}

// ---------------- Home ----------------
function statBar(){
  return `<div class="statbar">
    <span class="s s-flame">🔥 ${S.streak}</span>
    <span class="s s-xp">⚡ ${S.xp}</span>
    <span class="s s-heart">❤️</span>
  </div>`;
}
function starsHTML(n){
  let h = '';
  for(let i = 1; i <= 3; i++) h += `<span class="${i <= n ? 'on' : ''}">★</span>`;
  return `<div class="stars">${h}</div>`;
}
function renderHome(){
  hideSheet();
  const lv = LEVELS.map(l => {
    const locked = l.id > S.unlocked, st = S.stars[l.id] || 0;
    return `<button class="lvl ${locked ? 'locked' : ''}" data-lv="${l.id}" ${locked ? 'disabled' : ''}>
      <span class="lvl-ic">${locked ? '🔒' : l.icon}</span>
      <span class="lvl-tx"><b>Level ${l.id} · ${l.title}</b><span>${l.desc}</span>${starsHTML(st)}</span>
      <span style="font-size:22px;color:#afafaf">›</span>
    </button>`;
  }).join('');
  app.innerHTML = `
    ${statBar()}
    <div class="hero">
      <span class="mascot">🎻</span>
      <h1>Violin Sight Reading</h1>
      <p>See a note. Find it on the fingerboard.</p>
    </div>
    <div class="foot" style="margin-top:0">
      <button class="btn btn-green" id="continueBtn">Start practicing</button>
    </div>
    <div class="section-t">Levels</div>
    ${lv}
    <div class="section-t">More</div>
    <button class="lvl" id="quickBtn">
      <span class="lvl-ic">⚡</span>
      <span class="lvl-tx"><b>Quick Practice</b><span>Mixed review · 10 notes</span></span>
      <span style="font-size:22px;color:#afafaf">›</span>
    </button>
    <button class="lvl" id="chartBtn">
      <span class="lvl-ic">🗺️</span>
      <span class="lvl-tx"><b>Note Chart</b><span>See &amp; hear every note</span></span>
      <span style="font-size:22px;color:#afafaf">›</span>
    </button>
    <div class="tip">Tip: use Share → Add to Home Screen<br>to launch this like an app 🎻</div>`;
  document.getElementById('continueBtn').onclick = () => startRound(Math.min(S.unlocked, 4));
  document.getElementById('quickBtn').onclick = () => startRound(0, true);
  document.getElementById('chartBtn').onclick = renderChart;
  app.querySelectorAll('.lvl[data-lv]').forEach(b => {
    if(!b.disabled) b.onclick = () => startRound(parseInt(b.dataset.lv, 10));
  });
  window.scrollTo(0, 0);
}

// ---------------- Quiz ----------------
let Q = null;
function startRound(levelId, quick){
  const pool = quick ? unlockedNotes() : levelPool(LEVELS[levelId - 1]);
  Q = {
    levelId, quick, pool, idx:0, correct:0, xp:0, hearts:3,
    order: Array.from({length: ROUND_LEN}, () => pool[Math.floor(Math.random()*pool.length)]),
    picked:null, locked:false,
  };
  renderQ();
}
function renderQ(){
  hideSheet();
  const key = Q.order[Q.idx];
  Q.picked = null; Q.locked = false;
  app.innerHTML = `
    <div class="topbar">
      <button class="xbtn" id="quitBtn">✕</button>
      <div class="progress"><i id="pbar"></i></div>
      <div class="statbar" style="padding:0"><span class="s s-heart">❤️ ${Q.hearts}</span></div>
    </div>
    ${staffSVG(key)}
    <div id="fbWrap">${fingerboardSVG('quiz')}</div>
    <div class="foot"><button class="btn btn-green" id="checkBtn" disabled>Check</button></div>`;
  document.getElementById('pbar').style.width = (Q.idx / ROUND_LEN * 100) + '%';
  document.getElementById('quitBtn').onclick = renderHome;
  const checkBtn = document.getElementById('checkBtn');
  document.getElementById('fbSvg').addEventListener('click', e => {
    if(Q.locked) return;
    const g = e.target.closest('.spot');
    if(!g) return;
    document.querySelectorAll('#fbSvg .spot').forEach(x => x.classList.remove('sel'));
    g.classList.add('sel');
    Q.picked = {s:+g.dataset.s, f:+g.dataset.f};
    checkBtn.disabled = false;
    playNote(g.dataset.k);
  });
  checkBtn.onclick = grade;
}
function grade(){
  if(Q.locked || !Q.picked) return;
  Q.locked = true;
  const key = Q.order[Q.idx], n = NOTES[key];
  const okSpots = NOTE_SPOTS[key];
  const ok = okSpots.some(c => c.s === Q.picked.s && c.f === Q.picked.f);
  document.getElementById('fbWrap').innerHTML = fingerboardSVG('reveal', key);
  if(!ok){
    const g = document.querySelector(`#fbSvg .spot[data-s="${Q.picked.s}"][data-f="${Q.picked.f}"]`);
    if(g) g.classList.add('wrong');
  }
  document.getElementById('checkBtn').style.display = 'none';
  const where = okSpots.map(c => spotName(c.s, c.f)).join(' or ');
  if(ok){
    Q.correct++; Q.xp += 10; S.xp += 10; sfxGood();
    showSheet(true, 'Nicely done!', `+10 XP · ${n.label} — ${spotName(Q.picked.s, Q.picked.f)}`);
  }else{
    Q.hearts--; sfxBad(); playNote(key);
    showSheet(false, 'Not quite…', `That was <b>${n.label}</b> — play it ${where}.`);
  }
  saveS();
}
function showSheet(ok, title, sub){
  sheet.className = 'sheet show ' + (ok ? 'good' : 'bad');
  sheet.innerHTML = `
    <div class="sheet-title">${ok ? '🎉' : '💡'} ${title}</div>
    <div class="sheet-sub">${sub}</div>
    <button class="btn ${ok ? 'btn-green' : 'btn-red'}" id="sheetBtn">Continue</button>`;
  document.getElementById('sheetBtn').onclick = () => {
    if(Q.hearts <= 0) renderFail();
    else if(Q.idx + 1 >= ROUND_LEN) finishRound();
    else { Q.idx++; renderQ(); }
  };
}
function renderFail(){
  hideSheet();
  app.innerHTML = `
    <div class="result">
      <div class="big">💔</div>
      <h2>Out of hearts!</h2>
      <p class="sub">Sight reading is a muscle — let's build it.</p>
      <div class="foot">
        <button class="btn btn-green" id="retryBtn">Try again</button>
        <button class="btn btn-ghost" id="homeBtn">Back home</button>
      </div>
    </div>`;
  document.getElementById('retryBtn').onclick = () => startRound(Q.levelId, Q.quick);
  document.getElementById('homeBtn').onclick = renderHome;
}
function finishRound(){
  hideSheet();
  bumpStreak();
  const acc = Q.correct / ROUND_LEN;
  let stars = 0, unlockedNow = false;
  if(!Q.quick){
    stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const lv = Q.levelId;
    if(!S.stars[lv] || S.stars[lv] < stars) S.stars[lv] = stars;
    if(lv === S.unlocked && lv < LEVELS.length){ S.unlocked++; unlockedNow = true; }
    Q.xp += 20; S.xp += 20;
    saveS();
  }
  const starRow = Q.quick ? '' :
    `<div class="bigstars">${[1,2,3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>`;
  app.innerHTML = `
    <div class="result">
      <div class="big">${Q.quick ? '⚡' : '🏆'}</div>
      <h2>${Q.quick ? 'Practice complete!' : 'Level ' + Q.levelId + ' complete!'}</h2>
      ${starRow}
      <p class="sub">${unlockedNow ? '🎉 Level ' + (Q.levelId + 1) + ' unlocked!' : 'Keep that streak going 🔥'}</p>
      <div class="statgrid">
        <div class="statcard"><b>+${Q.xp}</b><span>XP</span></div>
        <div class="statcard"><b>${Math.round(acc*100)}%</b><span>Accuracy</span></div>
        <div class="statcard"><b>${S.streak} 🔥</b><span>Day streak</span></div>
      </div>
      <div class="foot">
        ${(!Q.quick && Q.levelId < LEVELS.length) ? `<button class="btn btn-green" id="nextBtn">Next level</button>` : ''}
        <button class="btn btn-blue" id="againBtn">${Q.quick ? 'Practice again' : 'Replay level'}</button>
        <button class="btn btn-ghost" id="homeBtn">Back home</button>
      </div>
    </div>`;
  if(!Q.quick && stars >= 2) confetti(); else if(Q.quick) confetti();
  const nx = document.getElementById('nextBtn');
  if(nx) nx.onclick = () => startRound(Q.levelId + 1);
  document.getElementById('againBtn').onclick = () => startRound(Q.levelId, Q.quick);
  document.getElementById('homeBtn').onclick = renderHome;
  window.scrollTo(0, 0);
}

// ---------------- Note chart ----------------
function renderChart(){
  hideSheet();
  const secs = LEVELS.map(lv => `
    <div class="section-t">${lv.icon} Level ${lv.id} · ${lv.title}</div>
    <div class="chart-grid">
      ${levelPool(lv).map(k => `
        <div class="ncard" data-k="${k}">${staffSVG(k)}<b>${NOTES[k].label}</b></div>`).join('')}
    </div>`).join('');
  app.innerHTML = `
    <div class="backrow"><button class="back" id="backBtn">‹</button><div class="q-prompt" style="margin:0">Note Chart</div></div>
    <p class="q-hint">Tap any note to hear it 🎧</p>
    ${secs}
    <div class="section-t">🎻 Fingerboard</div>
    <p class="q-hint">First position · tap any spot to hear it</p>
    <div id="fbWrap">${fingerboardSVG('chart')}</div>
    <div class="foot"><button class="btn btn-ghost" id="homeBtn">Back home</button></div>`;
  document.getElementById('backBtn').onclick = renderHome;
  document.getElementById('homeBtn').onclick = renderHome;
  app.querySelectorAll('.ncard').forEach(c => { c.onclick = () => playNote(c.dataset.k); });
  document.getElementById('fbSvg').addEventListener('click', e => {
    const g = e.target.closest('.spot');
    if(g) playNote(g.dataset.k);
  });
  window.scrollTo(0, 0);
}

// ---------------- Go ----------------
renderHome();
