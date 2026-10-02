// ---------------- Piano ----------------
// Standalone piano section of the Playground: simplified public-domain
// starters, playable with a MIDI keyboard (Web MIDI) or the on-screen keys.
// Chopin died in 1849, so his music is public domain; the reduction below is
// our own simplified teaching version of the famous opening descent.
// Progress is shared with the violin section: same localStorage key ('vsr'),
// same shape — XP and streak carry across sections on this origin.

// ---------------- Notes (C4–B4, for staff + chips) ----------------
// step: diatonic staff steps, 0 = bottom line (E4).
const NOTES = {
  C4:{label:'C',  freq:261.63, step:-2},
  D4:{label:'D',  freq:293.66, step:-1},
  Ds4:{label:'D♯', freq:311.13, step:-1, acc:true},
  E4:{label:'E',  freq:329.63, step:0},
  F4:{label:'F',  freq:349.23, step:1},
  Fs4:{label:'F♯', freq:369.99, step:1, acc:true},
  G4:{label:'G',  freq:392.00, step:2},
  Gs4:{label:'G♯', freq:415.30, step:2, acc:true},
  A4:{label:'A',  freq:440.00, step:3},
  As4:{label:'A♯', freq:466.16, step:3, acc:true},
  B4:{label:'B',  freq:493.88, step:4},
};

const PIANO_PIECES = [
  {id:'chopin-em', title:'Prelude in E minor', sub:'Chopin · Op. 28 No. 4', icon:'🎹',
   desc:'simplified starter · the famous opening descent', notes:[
    ['B4',2],['As4',2],['A4',2],['Gs4',2],['G4',2],['Fs4',2],['F4',2],['E4',4]]},
  {id:'amazing', title:'Amazing Grace', sub:'Traditional hymn · 1835', icon:'⛪',
   desc:'easy & uplifting · simplified', notes:[
    ['C4',1],['F4',2],['A4',1],['F4',1],['A4',2],['G4',1],['F4',3],
    ['D4',1],['F4',2],['A4',1],['F4',1],['D4',3]]},
  {id:'jesus-loves', title:'Jesus Loves Me', sub:'Traditional hymn · 1862', icon:'🙏',
   desc:'the classic kids’ favorite · simplified', notes:[
    ['C4',1],['C4',1],['D4',1],['E4',1],['C4',2],
    ['C4',1],['C4',1],['D4',1],['E4',1],['C4',3],
    ['G4',1],['G4',1],['A4',1],['G4',2],['E4',1],['C4',3]]},
  {id:'whole-world', title:'He’s Got the Whole World', sub:'Traditional spiritual', icon:'🌍',
   desc:'pentatonic · super easy · fun', notes:[
    ['G4',1],['A4',1],['G4',2],['F4',1],['E4',1],['D4',2],['C4',3],
    ['E4',1],['F4',1],['E4',1],['D4',1],['C4',3]]},
  {id:'twinkle-piano', title:'Twinkle Twinkle', sub:'Traditional · 1761', icon:'⭐',
   desc:'the classic starter · simplified', notes:[
    ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
    ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2]]},
  {id:'morning-bells', title:'Morning Bells', sub:'Original · gentle waltz', icon:'🔔',
   desc:'composed for this site · C major', notes:[
    ['E4',1],['G4',1],['A4',1],['G4',2],['E4',1],['D4',3],
    ['E4',1],['G4',1],['A4',1],['B4',1],['A4',1],['G4',1],['E4',3],
    ['F4',1],['A4',1],['G4',1],['F4',1],['E4',1],['D4',1],['E4',3],
    ['D4',1],['E4',1],['F4',1],['E4',1],['D4',1],['C4',1],['C4',3]]},
];
// note key -> MIDI number (middle C = 60)
const NOTE_MIDI = {C4:60, D4:62, E4:64, F4:65, Fs4:66, G4:67, Gs4:68, A4:69, As4:70, B4:71};
const MIDI_KEY = {};
Object.keys(NOTE_MIDI).forEach(k => { MIDI_KEY[NOTE_MIDI[k]] = k; });
function midiFreq(m){ return 440 * Math.pow(2, (m - 69) / 12); }
function midiLabel(m){
  const names = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  return names[m % 12] + (Math.floor(m / 12) - 1);
}

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
  if(n.acc) s += `<text x="${cx-46}" y="${cy + 8}" class="acc">${n.acc === 'flat' ? '♭' : '♯'}</text>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="8.6" transform="rotate(-18 ${cx} ${cy})" class="notehead"/>`;
  return `<svg viewBox="0 0 ${W} ${topY + 4*g + 58}" class="staff" aria-label="note">${s}</svg>`;
}

// ---------------- Storage (shared with the violin section) ----------------
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
// Same unlock strategy as the violin section: a bare resume() inside a click
// handler is NOT enough on iOS — it wants an actual buffer played inside a
// real user gesture, the non-standard 'interrupted' state counts as locked,
// and the 'playback' audio session opts out of the silent-switch mute.
let AC = null;
function ac(){
  if(!AC){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    AC = new Ctx();
  }
  try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
  return AC;
}
function setPlayback(){
  try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
}
function silentPing(c){ // the thing iOS actually respects: a real buffer started in a gesture
  try{
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf; src.connect(c.destination); src.start(0);
  }catch(e){}
}
// ensureAudio: the single unlock path behind every sound here. iOS often needs
// resume() more than once, so we retry briefly until the context is running.
function ensureAudio(){
  const c = ac();
  setPlayback();
  if(!c) return Promise.resolve(false);
  if(c.state === 'running') return Promise.resolve(true);
  return attemptUnlock(c, 0);
}
function attemptUnlock(c, n){
  return new Promise(resolve => {
    let done = false;
    const fin = () => {
      if(done) return; done = true;
      setTimeout(() => resolve(c.state === 'running'), 70); // let iOS flip state
    };
    try{
      silentPing(c);
      const pr = c.resume();
      if(pr && pr.then) pr.then(fin).catch(fin); else setTimeout(fin, 250);
    }catch(e){ fin(); }
    setTimeout(fin, 650);
  }).then(ok => {
    if(ok || n >= 2) return ok;
    return new Promise(r => setTimeout(r, 160)).then(() => attemptUnlock(c, n + 1));
  });
}
// Keep trying on every gesture until iOS lets it run; re-unlock on return
// from background (iOS re-suspends contexts then).
['pointerdown','touchend','keydown'].forEach(ev =>
  document.addEventListener(ev, () => { ensureAudio(); }, {passive:true}));
document.addEventListener('visibilitychange', () => { if(!document.hidden) ensureAudio(); });
// Violin-ish voice: two detuned saws through a lowpass, soft attack, vibrato
// that fades in. scheduleNote() is pure and synchronous — t is one absolute
// context time; withAudio() runs the callback synchronously when the context
// is already running and only waits for the iOS unlock when it must.
function scheduleNote(c, t, freq, dur, vol){
  const v = vol || 0.22;
  const g = c.createGain();
  const flt = c.createBiquadFilter();
  flt.type = 'lowpass';
  flt.frequency.value = Math.min(5200, Math.max(1800, freq * 6));
  flt.Q.value = 0.6;
  const o1 = c.createOscillator(), o2 = c.createOscillator(), sub = c.createOscillator();
  o1.type = 'sawtooth'; o2.type = 'sawtooth'; sub.type = 'sine';
  o1.frequency.value = freq; o2.frequency.value = freq; sub.frequency.value = freq / 2;
  o1.detune.value = -5; o2.detune.value = 5;
  const sg = c.createGain(); sg.gain.value = 0.22;
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = 5.5;
  lg.gain.setValueAtTime(0.0001, t);
  lg.gain.linearRampToValueAtTime(16, t + 0.5); // cents — blooms after the attack
  lfo.connect(lg); lg.connect(o1.detune); lg.connect(o2.detune);
  o1.connect(flt); o2.connect(flt); sub.connect(sg); sg.connect(flt);
  flt.connect(g); g.connect(c.destination);
  const a = 0.08, r = Math.min(0.35, dur * 0.3);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + a);
  g.gain.setValueAtTime(v, t + Math.max(a + 0.02, dur - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const nodes = [o1, o2, sub, lfo];
  nodes.forEach(o => { o.start(t); o.stop(t + dur + 0.1); });
  return {g, nodes};
}
// Preview voices: tapping a new key cuts the previous preview with a fast
// fade so rapid taps never pile into a muddy drone.
let previewVoices = [];
function cutPreview(){
  const c = AC;
  if(!c){ previewVoices = []; return; }
  const t = c.currentTime;
  previewVoices.forEach(v => {
    try{
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0.0001, t, 0.02);
      v.nodes.forEach(o => { try{ o.stop(t + 0.15); }catch(e){} });
    }catch(e){}
  });
  previewVoices = [];
}
function withAudio(fn){
  const c = AC;
  if(c && c.state === 'running'){ try{ fn(c); }catch(e){} return; }
  ensureAudio().then(ok => {
    if(ok && AC && AC.state === 'running'){ try{ fn(AC); }catch(e){} }
    else nudgeAudio(); // don't fail silently: tell the user once what's wrong
  });
}
let audioNudged = false;
function nudgeAudio(){
  if(audioNudged) return; audioNudged = true;
  const t = document.createElement('div');
  t.className = 'toast show';
  t.textContent = '🔇 No sound — check the silent switch & volume, then tap a key again.';
  t.onclick = () => t.remove();
  document.body.appendChild(t);
  setTimeout(() => { t.remove(); }, 6000);
}

// ---------------- Helpers ----------------
const app = document.getElementById('app');
const sheet = document.getElementById('sheet');
function hideSheet(){ sheet.className = 'sheet'; sheet.innerHTML = ''; }
function statBar(){
  return `<div class="statbar">
    <span class="s s-flame">🔥 ${S.streak}</span>
    <span class="s s-xp">⚡ ${S.xp}</span>
    <span class="s s-heart">❤️</span>
  </div>`;
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

// ---------------- Piano screens ----------------
// Guided tap-to-play: on-screen keys + real MIDI keyboard input.
// P.misses is tracked silently — scoring/grading UI comes later.
let P = null, midiAccess = null;
function renderPiano(){
  hideSheet();
  P = null; // leaving any session: MIDI keys free-play only from here
  app.innerHTML = `
    <a class="hub-link" href="../">‹ Playground</a>
    ${statBar()}
    <div class="backrow"><a class="back" href="../">‹</a>
      <div class="q-prompt" style="margin:0; flex:1;">Piano</div></div>
    <p class="q-hint">Plug in a MIDI keyboard — or just tap the keys 🎹</p>
    <div class="midirow">
      <button class="btn btn-blue" id="midiBtn">🎹 Connect MIDI keyboard</button>
      <div class="sndstat" id="midiStat"></div>
    </div>
    <div class="section-t">Start here</div>
    ${PIANO_PIECES.map((p, i) => `
      <button class="lvl" data-pi="${i}">
        <span class="lvl-ic">${p.icon}</span>
        <span class="lvl-tx"><b>${p.title}</b><span>${p.sub} · ${p.desc}</span></span>
        <span style="font-size:22px;color:#afafaf">›</span>
      </button>`).join('')}
    <p class="q-hint">More pieces coming soon 🎵</p>
    <div class="foot"><a class="btn btn-ghost" href="../" style="text-decoration:none;">🏠 Playground</a></div>`;
  document.getElementById('midiBtn').onclick = connectMIDI;
  app.querySelectorAll('.lvl[data-pi]').forEach(b => {
    b.onclick = () => startPiano(parseInt(b.dataset.pi, 10));
  });
  window.scrollTo(0, 0);
}
function midiStatus(msg){
  const el = document.getElementById('midiStat');
  if(el) el.textContent = msg;
}
function connectMIDI(){
  if(!navigator.requestMIDIAccess){
    midiStatus('⚠️ This browser can’t do MIDI (iPhone/iPad browsers don’t support it). The on-screen keys below work the same.');
    return;
  }
  midiStatus('Requesting MIDI access…');
  navigator.requestMIDIAccess({sysex:false}).then(access => {
    midiAccess = access;
    const hook = () => {
      const ins = [...access.inputs.values()];
      ins.forEach(inp => { inp.onmidimessage = onMIDIMessage; });
      midiStatus(ins.length
        ? '✅ Connected: ' + ins.map(i => i.name || 'MIDI keyboard').join(', ')
        : 'No MIDI keyboard found — plug one in, then tap Connect again.');
    };
    hook();
    access.onstatechange = hook;
  }).catch(() => midiStatus('MIDI access was blocked. The on-screen keys below work fine.'));
}
function onMIDIMessage(ev){
  const d = ev.data || [];
  if((d[0] & 0xF0) === 0x90 && d[2] > 0) pianoInput(d[1], 'midi'); // note-on only
}
function startPiano(i){
  P = {i, idx:0, misses:0, demo:false};
  renderPianoPlay();
}
function pianoKeysHTML(){
  // one octave C4–B4 (MIDI 60–71); black keys absolutely positioned
  const whites = [60, 62, 64, 65, 67, 69, 71];
  const blackAfter = {61:1, 63:2, 66:4, 68:5, 70:6}; // white index the black key follows
  const w = 100 / 7, bw = 9;
  let h = '<div class="pkeys" id="pkeys">';
  whites.forEach(m => {
    h += `<div class="pk-white" data-m="${m}"><span>${midiLabel(m).replace(/[0-9]/g, '')}</span></div>`;
  });
  Object.keys(blackAfter).forEach(ms => {
    const m = +ms, left = (blackAfter[m] * w) - bw / 2;
    h += `<div class="pk-black" data-m="${m}" style="left:${left}%"><span>${midiLabel(m).replace(/[0-9]/g, '')}</span></div>`;
  });
  return h + '</div>';
}
function renderPianoPlay(){
  hideSheet();
  const pc = PIANO_PIECES[P.i], key = pc.notes[P.idx][0];
  app.innerHTML = `
    <div class="topbar">
      <button class="xbtn" id="quitBtn">✕</button>
      <div class="progress"><i id="pbar"></i></div>
      <button class="hearbtn" id="hearBtn" aria-label="Hear it">▶</button>
    </div>
    <div class="mel-title">${pc.icon} ${pc.title}</div>
    <p class="q-hint" style="text-align:center">${pc.sub} · simplified for beginners</p>
    <div class="mchips" id="chips">
      ${pc.notes.map(([k, b], ni) =>
        `<div class="mchip${ni < P.idx ? ' done' : ni === P.idx ? ' cur' : ''}" style="min-width:${30 + 16 * b}px">${NOTES[k].label}</div>`).join('')}
    </div>
    ${staffSVG(key)}
    ${pianoKeysHTML()}
    <div class="sndstat">${midiAccess ? '🎹 MIDI ready — play on your keyboard' : ''}</div>`;
  document.getElementById('pbar').style.width = (P.idx / pc.notes.length * 100) + '%';
  document.getElementById('quitBtn').onclick = () => { P.demo = false; renderPiano(); };
  document.getElementById('hearBtn').onclick = demoPiano;
  const cur = document.querySelector('.mchip.cur');
  if(cur) cur.scrollIntoView({inline:'center', block:'nearest'});
  document.getElementById('pkeys').addEventListener('pointerdown', e => {
    const k = e.target.closest('.pk-white,.pk-black');
    if(k) pianoInput(+k.dataset.m, 'tap');
  });
  window.scrollTo(0, 0);
}
function flashKey(m, cls){
  const el = document.querySelector(`#pkeys [data-m="${m}"]`);
  if(!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), cls === 'right' ? 320 : 450);
}
function pianoInput(m, src){
  if(P && P.demo) return;
  withAudio(c => { // every keypress sounds, MIDI or tap
    cutPreview();
    previewVoices.push(scheduleNote(c, c.currentTime + 0.02, midiFreq(m), 1.2, 0.22));
  });
  if(!P) return; // menu screen: free play, no judging
  const pc = PIANO_PIECES[P.i];
  const want = NOTE_MIDI[pc.notes[P.idx][0]];
  if(m === want){
    flashKey(m, 'right');
    P.idx++;
    setTimeout(() => { P.idx >= pc.notes.length ? finishPiano() : renderPianoPlay(); }, 300);
  }else{
    P.misses++;
    flashKey(m, 'wrong');
  }
}
function demoPiano(){
  if(P.demo) return;
  P.demo = true;
  const btn = document.getElementById('hearBtn');
  if(btn) btn.classList.add('playing');
  const beat = 0.6, gap = 0.04;
  const notes = PIANO_PIECES[P.i].notes;
  let started = false;
  withAudio(c => {
    started = true;
    cutPreview();
    const t0 = c.currentTime + 0.08;
    let t = 0;
    notes.forEach(([k, b]) => {
      scheduleNote(c, t0 + t, midiFreq(NOTE_MIDI[k]), b * beat * 0.94, 0.22);
      t += b * beat + gap;
    });
    setTimeout(() => {
      P.demo = false;
      const b2 = document.getElementById('hearBtn');
      if(b2) b2.classList.remove('playing');
    }, t * 1000 + 400);
  });
  setTimeout(() => { // unlock failed: don't leave the button stuck
    if(!started){ P.demo = false; if(btn) btn.classList.remove('playing'); }
  }, 1500);
}
function finishPiano(){
  hideSheet();
  const pc = PIANO_PIECES[P.i];
  P = null;
  S.xp += 15; saveS(); bumpStreak(); confetti();
  app.innerHTML = `
    <div class="result">
      <div class="big">🎹</div>
      <h2>Lovely!</h2>
      <p class="sub">You played <b>${pc.title}</b> — ${pc.notes.length} notes</p>
      <div class="statgrid">
        <div class="statcard"><b>+15</b><span>XP</span></div>
        <div class="statcard"><b>${pc.notes.length}</b><span>Notes</span></div>
      </div>
      <div class="foot">
        <button class="btn btn-green" id="againBtn">Play again</button>
        <button class="btn btn-blue" id="listBtn">Piano pieces</button>
        <a class="btn btn-ghost" href="../" style="text-decoration:none;">🏠 Playground</a>
      </div>
    </div>`;
  document.getElementById('againBtn').onclick = () => startPiano(PIANO_PIECES.indexOf(pc));
  document.getElementById('listBtn').onclick = renderPiano;
  window.scrollTo(0, 0);
}

// ---------------- Go ----------------
renderPiano();
