/* ==============================================
   Adolph Motors — Home Page (home.js)
   ============================================== */

'use strict';

// ── Featured Cars ─────────────────────────────────────────────────────────────
async function loadFeaturedCars() {
  const grid = document.getElementById('featuredCarsGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/api/cars/featured');
    const data = await res.json();
    if (!data.success || !data.data.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="bi bi-car-front"></i><h4>No featured vehicles</h4></div>';
      return;
    }
    grid.innerHTML = data.data.map(car => buildCarCard(car)).join('');

    // Animate cards in
    const observer = new IntersectionObserver(entries => {
      entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, i * 80); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.car-card').forEach(card => {
      card.style.opacity = '0'; card.style.transform = 'translateY(20px)'; card.style.transition = 'opacity .4s ease, transform .4s ease';
      observer.observe(card);
    });
  } catch (e) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1; color:var(--accent)">Failed to load featured vehicles.</div>';
  }
}

// ── Load Makes into Hero Search ───────────────────────────────────────────────
async function loadHeroMakes() {
  const sel = document.getElementById('heroMake');
  if (!sel) return;
  try {
    const res  = await fetch('/api/cars/makes');
    const data = await res.json();
    if (data.success) {
      data.data.forEach(make => {
        const opt = document.createElement('option');
        opt.value = make; opt.textContent = make;
        sel.appendChild(opt);
      });
    }
  } catch {}
}

// ── Hero Search Form ──────────────────────────────────────────────────────────
(function initHeroSearch() {
  const form = document.getElementById('heroSearchForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const params = new URLSearchParams();
    ['heroMake', 'heroBodyType', 'heroMaxPrice', 'heroTransmission'].forEach(id => {
      const el = document.getElementById(id);
      if (el?.value) params.set(el.name, el.value);
    });
    window.location.href = `/inventory.html?${params.toString()}`;
  });
})();

// ── Quick Finance Calculator ──────────────────────────────────────────────────
(function initQuickCalc() {
  const price   = document.getElementById('quickPrice');
  const deposit = document.getElementById('quickDeposit');
  const term    = document.getElementById('quickTerm');
  const output  = document.getElementById('quickMonthly');
  if (!price || !output) return;

  function update() {
    const p = +price.value; const d = +deposit.value; const t = +term.value;
    document.getElementById('quickPriceLabel').textContent = `R ${p.toLocaleString()}`;
    document.getElementById('quickDepositLabel').textContent = `R ${d.toLocaleString()}`;
    document.getElementById('quickTermLabel').textContent = `${t} months`;
    output.textContent = calcMonthly(p, d, t).toLocaleString();
  }

  [price, deposit, term].forEach(el => { if (el) el.addEventListener('input', update); });
  update();
})();

// ── Newsletter Form ───────────────────────────────────────────────────────────
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = '...';
    try {
      const res  = await fetch('/api/contact/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.success) { showToast(data.message, 'success'); form.reset(); }
      else              { showToast(data.error || 'Failed to subscribe', 'error'); }
    } catch { showToast('Network error. Please try again.', 'error'); }
    finally  { btn.disabled = false; btn.textContent = 'Subscribe'; }
  });
})();

// ── Live stock count ──────────────────────────────────────────────────────────
async function loadStatsCars() {
  try {
    const res  = await fetch('/api/cars?limit=1');
    const data = await res.json();
    const el   = document.getElementById('statCars');
    if (el && data.pagination) el.innerHTML = `${data.pagination.total}<span>+</span>`;
  } catch {}
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedCars();
  loadHeroMakes();
  loadStatsCars();
});
