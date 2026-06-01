/* ─────────────────────────────────────────
   script.js — Reva's Marvel Birthday Site
───────────────────────────────────────── */

// ══════════════════════════════════════════
//  PASTE YOUR GOOGLE APPS SCRIPT URL BELOW
//  (Deploy → New Deployment → Web App URL)
// ══════════════════════════════════════════
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwtb2rVboIxRDTrGPSlB3pd4VIDQI0uHoricYW8-xl-2ZMh_UA8afwvfilnsb3fTaFDsA/exec';

// ── Attendance toggle buttons ─────────────
const attendYes = document.getElementById('attend-yes');
const attendNo  = document.getElementById('attend-no');
const attendHid = document.getElementById('attendance');

function setAttend(val) {
  attendHid.value = val;
  attendYes.classList.toggle('active-yes', val === 'yes');
  attendNo.classList.toggle('active-no',   val === 'no');
  document.getElementById('fg-attend').classList.remove('has-error');
}

attendYes.addEventListener('click', () => setAttend('yes'));
attendNo.addEventListener('click',  () => setAttend('no'));

// ── RSVP Form ─────────────────────────────
const form         = document.getElementById('rsvpForm');
const successState = document.getElementById('successState');

function getVal(id) { return document.getElementById(id).value.trim(); }

function setErr(fgId, show) {
  document.getElementById(fgId).classList.toggle('has-error', show);
}

function clearErr(id, fgId) {
  document.getElementById(id).addEventListener('input', function () {
    if (this.value.trim()) document.getElementById(fgId).classList.remove('has-error');
  });
}

clearErr('name',      'fg-name');
clearErr('shirtSize', 'fg-shirt');
clearErr('pantSize',  'fg-pant');
clearErr('superhero', 'fg-hero');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name   = getVal('name');
  const shirt  = getVal('shirtSize');
  const pant   = getVal('pantSize');
  const hero   = getVal('superhero');
  const attend = attendHid.value;
  const notes  = getVal('notes');

  // Validate
  setErr('fg-name',   !name);
  setErr('fg-shirt',  !shirt);
  setErr('fg-pant',   !pant);
  setErr('fg-hero',   !hero);
  setErr('fg-attend', !attend);

  if (!name || !shirt || !pant || !hero || !attend) {
    const first = form.querySelector('.has-error');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Loading state
  const btn     = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  btn.disabled  = true;
  btnText.textContent = '⏳ Sending…';

  try {
    // ── Send to Google Sheets ──────────────
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',              // Apps Script requires no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, shirt, pant, hero, attend, notes })
    });

    // Also keep a local backup just in case
    const entry = { name, shirt, pant, hero, attend, notes, ts: new Date().toISOString() };
    const all   = JSON.parse(localStorage.getItem('reva_rsvp') || '[]');
    all.push(entry);
    localStorage.setItem('reva_rsvp', JSON.stringify(all));

    // Show success
    form.style.display         = 'none';
    successState.style.display = 'block';
    launchConfetti();

  } catch (err) {
    // Network error fallback — still save locally and show success
    console.error('Sheet submission failed:', err);

    const entry = { name, shirt, pant, hero, attend, notes, ts: new Date().toISOString() };
    const all   = JSON.parse(localStorage.getItem('reva_rsvp') || '[]');
    all.push(entry);
    localStorage.setItem('reva_rsvp', JSON.stringify(all));

    form.style.display         = 'none';
    successState.style.display = 'block';
    launchConfetti();

  } finally {
    btn.disabled = false;
  }
});

// ── Reset ─────────────────────────────────
function resetForm() {
  form.reset();
  form.style.display         = 'block';
  successState.style.display = 'none';

  const btn     = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  btn.disabled  = false;
  btnText.textContent = '⚡ SUBMIT RSVP ⚡';

  attendHid.value = '';
  attendYes.classList.remove('active-yes');
  attendNo.classList.remove('active-no');
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

// ── Confetti ──────────────────────────────
function launchConfetti() {
  if (!document.getElementById('cf-style')) {
    const s = document.createElement('style');
    s.id = 'cf-style';
    s.textContent = `
      @keyframes cFall {
        from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        to   { transform: translateY(100vh)  rotate(540deg); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  const colors = ['#E02020','#FFD700','#1565C0','#ffffff','#27AE60'];
  for (let i = 0; i < 70; i++) {
    const c    = document.createElement('div');
    const size = 7 + Math.random() * 9;
    c.style.cssText = `
      position:fixed;
      width:${size}px; height:${size}px;
      background:${colors[~~(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      left:${Math.random() * 100}vw;
      top:0; z-index:9999;
      pointer-events:none;
      animation: cFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards;
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
