/* ==============================================
   Adolph Motors — Shared JavaScript (main.js)
   ============================================== */

'use strict';

// ── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icons = { success: 'bi-check-circle-fill', error: 'bi-exclamation-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.success}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all .3s ease'; setTimeout(() => toast.remove(), 300); }, duration);
}
window.showToast = showToast;

// ── Navigation ────────────────────────────────────────────────────────────────
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  // Scroll behavior
  function onScroll() {
    if (navbar.classList.contains('transparent')) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
})();

// ── Wishlist ──────────────────────────────────────────────────────────────────
const wishlist = {
  get()           { try { return JSON.parse(localStorage.getItem('adolphWishlist') || '[]'); } catch { return []; } },
  set(ids)        { localStorage.setItem('adolphWishlist', JSON.stringify(ids)); this.updateBadge(); },
  has(id)         { return this.get().includes(String(id)); },
  add(id)         { const l = this.get(); if (!this.has(id)) { l.push(String(id)); this.set(l); return true; } return false; },
  remove(id)      { this.set(this.get().filter(x => x !== String(id))); },
  toggle(id)      { return this.has(id) ? (this.remove(id), false) : (this.add(id), true); },
  updateBadge()   {
    const count = this.get().length;
    document.querySelectorAll('#wishlistCount').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });
  },
};
window.wishlist = wishlist;
document.addEventListener('DOMContentLoaded', () => wishlist.updateBadge());

// ── Format Utilities ──────────────────────────────────────────────────────────
function formatPrice(n)      { return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`; }
function formatMileage(n)    { return `${Number(n).toLocaleString()} km`; }
function calcMonthly(price, deposit = 0, term = 72, rate = 11.5) {
  const principal = price - deposit;
  if (principal <= 0) return 0;
  const r = (rate / 100) / 12;
  const monthly = (principal * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
  return Math.round(monthly);
}
window.formatPrice = formatPrice;
window.formatMileage = formatMileage;
window.calcMonthly = calcMonthly;

// ── Badge Colour Mapping ──────────────────────────────────────────────────────
function getBadgeClass(badge) {
  if (!badge) return '';
  const map = { 'hot deal': 'badge-hot', 'hot': 'badge-hot', 'premium': 'badge-premium', 'luxury': 'badge-luxury', 'sport': 'badge-sport', 'adventure': 'badge-adventure', 'eco': 'badge-eco', 'new arrival': 'badge-new', 'new': 'badge-new' };
  return map[badge.toLowerCase()] || 'badge-new';
}
window.getBadgeClass = getBadgeClass;

// ── Car Card Builder ──────────────────────────────────────────────────────────
function buildCarCard(car) {
  const imgs    = Array.isArray(car.images) ? car.images : JSON.parse(car.images || '[]');
  const thumb   = imgs[0] || null;
  const monthly = calcMonthly(car.price, 0, 72, 11.5);
  const inWish  = wishlist.has(car.id);

  return `
  <div class="car-card" data-car-id="${car.id}">
    <div class="car-card-image">
      ${thumb
        ? `<img src="${thumb}" alt="${car.make} ${car.model}" loading="lazy">`
        : `<div class="no-image"><i class="bi bi-car-front"></i><span>No Image</span></div>`}
      ${car.badge ? `<span class="car-badge ${getBadgeClass(car.badge)}">${car.badge}</span>` : ''}
      <button class="car-wishlist-btn ${inWish ? 'active' : ''}" data-id="${car.id}" title="${inWish ? 'Remove from Wishlist' : 'Save to Wishlist'}">
        <i class="bi ${inWish ? 'bi-heart-fill' : 'bi-heart'}"></i>
      </button>
    </div>
    <div class="car-card-body">
      <div class="car-make">${car.make}</div>
      <div class="car-name">${car.model}</div>
      <div class="car-variant">${car.variant || ''}</div>
      <div class="car-specs">
        <span class="car-spec"><i class="bi bi-calendar3"></i>${car.year}</span>
        <span class="car-spec"><i class="bi bi-speedometer2"></i>${formatMileage(car.mileage)}</span>
        <span class="car-spec"><i class="bi bi-fuel-pump"></i>${car.fuel_type}</span>
        <span class="car-spec"><i class="bi bi-gear-wide"></i>${car.transmission}</span>
        ${car.body_type ? `<span class="car-spec"><i class="bi bi-ev-front"></i>${car.body_type}</span>` : ''}
      </div>
      <div class="car-card-footer">
        <div>
          <div class="car-price"><span class="currency">R</span>${Number(car.price).toLocaleString()}</div>
          <div class="car-per-month">~R ${monthly.toLocaleString()}/mo over 72mo</div>
        </div>
        <a href="/car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View <i class="bi bi-arrow-right"></i></a>
      </div>
    </div>
  </div>`;
}
window.buildCarCard = buildCarCard;

// ── Wishlist Button Delegation ────────────────────────────────────────────────
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.car-wishlist-btn');
  if (!btn) return;
  e.preventDefault();
  const id = btn.dataset.id;
  const added = wishlist.toggle(id);
  btn.classList.toggle('active', added);
  btn.querySelector('i').className = added ? 'bi bi-heart-fill' : 'bi bi-heart';
  showToast(added ? 'Added to wishlist!' : 'Removed from wishlist', added ? 'success' : 'info', 2000);
});

// ── Intersection Observer for Animations ─────────────────────────────────────
(function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
})();

// ── Modal Helpers ─────────────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(el => closeModal(el.id));
});

// ── Set Min Date on Date Inputs ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(inp => { inp.min = minDate; if (!inp.value) inp.value = minDate; });
});
