/* ===== Now Boarding: shared code for every page ===== */
var $ = function (i) { return document.getElementById(i); };
function pad(n) { return (n < 10 ? '0' : '') + n; }
function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function getID() { try { return JSON.parse(localStorage.getItem('kid')) || null; } catch (e) { return null; } }
var PLANE = '<svg viewBox="0 0 64 56" fill="currentColor"><path d="M3 24H50C60 24 64 27 64 28S60 32 50 32H3Z M30 26L16 3H24L46 26Z M30 30L16 53H24L46 30Z M3 25L1 15H7L15 25Z M3 31L1 41H7L15 31Z"/></svg>';
var DEST = { music: ["Music", "A21", "KHL 101"], playlist: ["Playlist", "B45", "KHL 202"], film: ["Film", "C14", "KHL 303"], diary: ["Diary", "D32", "KHL 404"], passport: ["Passport", "E64", "KHL 505"], confessions: ["Confessions", "F75", "KHL 606"] };
var KEYS = Object.keys(DEST);

function go(h) { document.body.classList.add('leaving'); setTimeout(function () { location.href = h; }, 350); }
function takeoff(h) { var f = document.createElement('div'); f.id = 'fly'; f.innerHTML = PLANE; document.body.appendChild(f); setTimeout(function () { location.href = h; }, 950); }
function toast(t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3400); }

document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]'); if (!a) return;
  var h = a.getAttribute('href');
  if (!h || h.charAt(0) === '#' || a.target || /^(https?:|mailto:)/.test(h)) return;
  e.preventDefault();
  if (a.hasAttribute('data-fly')) takeoff(h); else go(h);
});
addEventListener('pageshow', function (e) { if (e.persisted) { document.body.classList.remove('leaving'); var f = $('fly'); if (f) f.remove(); } });
document.querySelectorAll('[data-plane]').forEach(function (e) { e.innerHTML = PLANE; });

var page = document.body.dataset.page;

/* ---------- LOADING SCREEN ---------- */
if (page === 'loading') {
  var me0 = getID();
  if (me0 && me0.name) $('hl').innerHTML = 'HELLO ' + esc(me0.name.toUpperCase()) + ', <b>WELCOME ABOARD</b>';
  var dots = 0; setInterval(function () { dots = (dots + 1) % 4; $('ld').textContent = 'landing' + new Array(dots + 1).join('.'); }, 450);
  setTimeout(function () { go('departures.html'); }, 3800);
}

/* ---------- DEPARTURES BOARD ---------- */
if (page === 'departures') {
  var ST = [["BOARDING", "green"], ["DELAYED", "orange"], ["CANCELLED", "red"], ["GATE OPENED", "orange"], ["ON TIME", "gold"], ["REBOOKED", "gold"]];
  var stat = [0, 1, 2, 3, 0, 4];
  function tm(off) { var d = new Date(Date.now() + off * 60000); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  $('rows').innerHTML = KEYS.map(function (k, i) {
    return '<button class="dt" data-i="' + i + '"><span class="t">' + tm(12 + i * 17) + '</span><span class="d">' + DEST[k][0] + '</span><span class="g">' + DEST[k][1] + '</span><span class="r" id="r' + i + '"></span></button>';
  }).join('');
  function paint(i) { var e = $('r' + i); e.className = 'r ' + ST[stat[i]][1]; e.textContent = ST[stat[i]][0]; }
  KEYS.forEach(function (k, i) { paint(i); });
  setInterval(function () { var i = Math.floor(Math.random() * KEYS.length); if (stat[i] === 5) return; stat[i] = Math.floor(Math.random() * 5); paint(i); }, 4500);
  function clock() { var d = new Date(); $('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()); $('date').textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
  clock(); setInterval(clock, 10000);
  document.querySelectorAll('button.dt').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i, k = KEYS[i];
      if (stat[i] === 2) { stat[i] = 5; paint(i); toast('Flight cancelled... rebooking you now'); setTimeout(function () { go('boarding.html?to=' + k); }, 1500); }
      else go('boarding.html?to=' + k);
    };
  });
}

/* ---------- BOARDING PASS ---------- */
if (page === 'boarding') {
  var to = new URLSearchParams(location.search).get('to');
  if (!DEST[to]) location.replace('departures.html');
  else {
    var who = getID(), nm = who && who.name ? who.name.toUpperCase() : 'GUEST', d = DEST[to], lock = to === 'confessions';
    var seat = (Math.floor(Math.random() * 30) + 1) + 'ABCDEF'[Math.floor(Math.random() * 6)];
    $('tk').innerHTML = '<div class="tk-h">BOARDING PASS</div>' +
      '<div class="tk-b"><div class="row2"><div><small>Passenger</small>' + esc(nm) + '</div><div><small>To</small>' + d[0] + '</div></div>' +
      '<div>First Class</div>' +
      '<div class="row2"><div><small>Flight</small>' + d[2] + '</div><div><small>Gate</small>' + d[1] + '</div><div><small>Seat</small>' + seat + '</div></div>' +
      '<div class="bar"></div></div>' +
      '<div class="tk-s"><div class="ring" data-plane></div></div>';
    document.querySelectorAll('[data-plane]').forEach(function (e) { e.innerHTML = PLANE; });
    if (lock) $('lockbox').innerHTML = '<input class="code" id="code" inputmode="numeric" maxlength="4" placeholder="····"><p class="msg" id="msg">Security check: enter the 4-digit code (hint: 1234)</p>';
    $('trav').onclick = function (e) {
      e.preventDefault();
      if (lock) { if ($('code').value !== '1234') { $('msg').textContent = 'Access denied. Look for clues.'; return; } try { sessionStorage.setItem('unlock', '1'); } catch (x) {} }
      takeoff(to + '.html');
    };
  }
}

/* ---------- DESTINATION PLACEHOLDERS ---------- */
if (page === 'gate' && document.body.dataset.key === 'confessions') {
  var okay = false; try { okay = sessionStorage.getItem('unlock') === '1'; } catch (x) {}
  if (!okay) location.replace('boarding.html?to=confessions');
}

/* ---------- ID ---------- */
if (page === 'id') {
  var FACE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 160'><rect width='120' height='160' fill='%23fff'/><path d='M22 150q0-34 38-34t38 34z' fill='%234a90d9'/><circle cx='60' cy='72' r='34' fill='%23ffd7b5'/><path d='M26 70q-2-40 34-40t34 40q-12-18-34-18T26 70z' fill='%23111'/><path d='M42 72q4-5 8 0M70 72q4-5 8 0' stroke='%23111' stroke-width='3' fill='none' stroke-linecap='round'/><path d='M44 86q16 18 32 0z' fill='%23b8244a'/></svg>";
  var id = getID() || { name: '', gender: '', dob: '', place: '', nat: '', photo: '', sig: '', issued: '' };
  function age(s) { if (!s) return ''; var b = new Date(s + 'T00:00'), n = new Date(), a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a >= 0 ? a : ''; }
  function expires() { var x = new Date(id.issued || Date.now()); x.setFullYear(x.getFullYear() + 5); return pad(x.getDate()) + ' ' + pad(x.getMonth() + 1) + ' ' + x.getFullYear(); }
  function show() { $('age').textContent = age(id.dob); $('exp').textContent = expires(); $('phimg').src = id.photo || FACE; }
  $('fName').value = id.name; $('fG').value = id.gender; $('fDob').value = id.dob; $('fBp').value = id.place; $('fNat').value = id.nat;
  $('fName').oninput = function () { id.name = this.value; };
  $('fG').onchange = function () { id.gender = this.value; };
  $('fDob').oninput = function () { id.dob = this.value; show(); };
  $('fBp').oninput = function () { id.place = this.value; };
  $('fNat').oninput = function () { id.nat = this.value; };
  $('ph').onclick = function () { $('file').click(); };
  $('file').onchange = function () {
    var f = this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { var im = new Image(); im.onload = function () {
      var c = document.createElement('canvas'); c.width = 300; c.height = 400; var x = c.getContext('2d'), s = Math.max(300 / im.width, 400 / im.height);
      x.drawImage(im, (300 - im.width * s) / 2, (400 - im.height * s) / 2, im.width * s, im.height * s); id.photo = c.toDataURL('image/jpeg', .8); show();
    }; im.src = r.result; }; r.readAsDataURL(f);
  };
  /* signature pad */
  var cv = $('sig'), cx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1, drawing = false;
  function fit() { var r = cv.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; cx.lineWidth = 2.6 * dpr; cx.lineCap = 'round'; cx.strokeStyle = '#10202e';
    if (id.sig) { var im = new Image(); im.onload = function () { cx.drawImage(im, 0, 0, cv.width, cv.height); }; im.src = id.sig; } }
  function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; }
  cv.onpointerdown = function (e) { drawing = true; cv.setPointerCapture(e.pointerId); var p = pos(e); cx.beginPath(); cx.moveTo(p[0], p[1]); };
  cv.onpointermove = function (e) { if (!drawing) return; var p = pos(e); cx.lineTo(p[0], p[1]); cx.stroke(); };
  cv.onpointerup = function () { if (drawing) { drawing = false; id.sig = cv.toDataURL(); } };
  $('clr').onclick = function (e) { e.stopPropagation(); cx.clearRect(0, 0, cv.width, cv.height); id.sig = ''; };
  setTimeout(fit, 60);
  $('save').onclick = function () {
    if (!id.issued) id.issued = new Date().toISOString(); show();
    try { localStorage.setItem('kid', JSON.stringify(id)); toast('ID saved. Welcome aboard' + (id.name ? ', ' + id.name : '')); } catch (e) { toast('Could not save on this device'); }
  };
  show();
}
