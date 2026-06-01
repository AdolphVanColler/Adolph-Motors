/* ==============================================
   Adolph Motors — Inventory Page (inventory.js)
   ============================================== */

'use strict';

let currentPage    = 1;
let currentFilters = {};
let currentSort    = 'created_at-DESC';
let isGridView     = true;

// ── Read URL params on load ───────────────────────────────────────────────────
function readURLParams() {
  const p = new URLSearchParams(location.search);
  const map = {
    make: 'filterMake', body_type: 'filterBodyType', fuel_type: 'filterFuelType',
    transmission: 'filterTransmission', mileage_max: 'filterMileage',
  };
  for (const [param, elId] of Object.entries(map)) {
    const val = p.get(param);
    const el  = document.getElementById(elId);
    if (val && el) el.value = val;
    if (val) currentFilters[param] = val;
  }
  if (p.get('price_max'))  { document.getElementById('filterPriceMax').value  = p.get('price_max');  currentFilters.price_max  = p.get('price_max');  }
  if (p.get('price_min'))  { document.getElementById('filterPriceMin').value  = p.get('price_min');  currentFilters.price_min  = p.get('price_min');  }
  if (p.get('year_min'))   { document.getElementById('filterYearMin').value   = p.get('year_min');   currentFilters.year_min   = p.get('year_min');   }
  if (p.get('year_max'))   { document.getElementById('filterYearMax').value   = p.get('year_max');   currentFilters.year_max   = p.get('year_max');   }
  if (p.get('search'))     { document.getElementById('searchInput').value     = p.get('search');     currentFilters.search     = p.get('search');     }
  if (p.get('featured') === 'true') currentFilters.featured = 'true';
  if (p.get('wishlist') === 'true') {
    const ids = (JSON.parse(localStorage.getItem('adolphWishlist') || '[]')).join(',');
    if (ids) { currentFilters.ids = ids; } else { currentFilters._wishlistEmpty = true; }
  }
  if (p.get('condition')) {
    const urlCond = p.get('condition');
    document.querySelectorAll('input[name="condition"]').forEach(cb => {
      cb.checked = urlCond.split(',').includes(cb.value);
    });
    currentFilters.condition = urlCond;
  }
  if (p.get('sort')) {
    const sort = p.get('sort');
    const order = (p.get('order') || 'DESC').toUpperCase();
    currentSort = `${sort}-${order}`;
    const sortEl = document.getElementById('sortSelect');
    if (sortEl) sortEl.value = currentSort;
  }
  currentPage = parseInt(p.get('page') || '1');
}

// ── Build filters from form ───────────────────────────────────────────────────
function collectFilters() {
  const f = {};
  const get = id => document.getElementById(id)?.value || '';
  if (get('filterMake'))         f.make         = get('filterMake');
  if (get('filterBodyType'))     f.body_type     = get('filterBodyType');
  if (get('filterFuelType'))     f.fuel_type     = get('filterFuelType');
  if (get('filterTransmission')) f.transmission  = get('filterTransmission');
  if (get('filterPriceMin'))     f.price_min     = get('filterPriceMin');
  if (get('filterPriceMax'))     f.price_max     = get('filterPriceMax');
  if (get('filterYearMin'))      f.year_min      = get('filterYearMin');
  if (get('filterYearMax'))      f.year_max      = get('filterYearMax');
  if (get('filterMileage'))      f.mileage_max   = get('filterMileage');
  if (get('searchInput'))        f.search        = get('searchInput');

  const conds = [...document.querySelectorAll('input[name="condition"]:checked')].map(cb => cb.value);
  if (conds.length) f.condition = conds.join(',');

  return f;
}

// ── Build API URL ─────────────────────────────────────────────────────────────
function buildURL(page = 1) {
  const [sort, order] = currentSort.split('-');
  const params = new URLSearchParams({ ...currentFilters, sort, order, page, limit: 12 });
  return `/api/cars?${params.toString()}`;
}

// ── Render cars ───────────────────────────────────────────────────────────────
async function loadCars(page = 1) {
  currentPage = page;
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  if (currentFilters._wishlistEmpty) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="bi bi-heart"></i><h4>Your wishlist is empty</h4><p>Browse our inventory and save vehicles you like.</p><a href="/inventory.html" class="btn btn-primary" style="margin-top:1rem">Browse All Vehicles</a></div>`;
    document.getElementById('resultsCount').innerHTML = '<span>0</span> vehicles';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = `<div class="loading-overlay" style="grid-column:1/-1"><div class="spinner"></div></div>`;

  try {
    const res  = await fetch(buildURL(page));
    const data = await res.json();

    // Populate filter dropdowns once
    if (data.filters) {
      const makeEl = document.getElementById('filterMake');
      if (makeEl && makeEl.options.length <= 1) {
        data.filters.makes.forEach(m => {
          const o = document.createElement('option'); o.value = m; o.textContent = m; makeEl.appendChild(o);
        });
      }
      const btEl = document.getElementById('filterBodyType');
      if (btEl && btEl.options.length <= 1) {
        data.filters.bodyTypes.forEach(bt => {
          const o = document.createElement('option'); o.value = bt; o.textContent = bt; btEl.appendChild(o);
        });
      }
      const ftEl = document.getElementById('filterFuelType');
      if (ftEl && ftEl.options.length <= 1) {
        data.filters.fuelTypes.forEach(ft => {
          const o = document.createElement('option'); o.value = ft; o.textContent = ft; ftEl.appendChild(o);
        });
      }
      // Restore selections that came from URL after repopulation
      const p = new URLSearchParams(location.search);
      if (p.get('make') && makeEl) makeEl.value = p.get('make');
      if (p.get('body_type') && btEl) btEl.value = p.get('body_type');
      if (p.get('fuel_type') && ftEl) ftEl.value = p.get('fuel_type');
    }

    document.getElementById('resultsCount').innerHTML =
      `<span>${data.pagination.total}</span> vehicle${data.pagination.total !== 1 ? 's' : ''}`;

    if (!data.data.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <i class="bi bi-search"></i>
          <h4>No vehicles found</h4>
          <p>Try adjusting your filters or <a href="/inventory.html" style="color:var(--accent)">clear all filters</a>.</p>
        </div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.className = isGridView ? 'cars-grid' : 'cars-grid cars-list';
    grid.innerHTML = data.data.map(car => buildCarCard(car)).join('');

    // Animate
    grid.querySelectorAll('.car-card').forEach((card, i) => {
      card.style.opacity = '0'; card.style.transform = 'translateY(16px)';
      card.style.transition = 'opacity .35s ease, transform .35s ease';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, i * 60);
    });

    renderPagination(data.pagination);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  } catch (e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1; color:var(--accent)"><i class="bi bi-exclamation-circle"></i><h4>Failed to load vehicles</h4><p>Please refresh and try again.</p></div>`;
  }
}

// ── Pagination ────────────────────────────────────────────────────────────────
function renderPagination({ total, page, totalPages }) {
  const el = document.getElementById('pagination');
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }

  let html = '';
  if (page > 1) html += `<button class="page-btn" onclick="loadCars(${page - 1})"><i class="bi bi-chevron-left"></i></button>`;
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  if (start > 1) html += `<button class="page-btn" onclick="loadCars(1)">1</button>${start > 2 ? '<span style="padding:.5rem">…</span>' : ''}`;
  for (let i = start; i <= end; i++) html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadCars(${i})">${i}</button>`;
  if (end < totalPages) html += `${end < totalPages - 1 ? '<span style="padding:.5rem">…</span>' : ''}<button class="page-btn" onclick="loadCars(${totalPages})">${totalPages}</button>`;
  if (page < totalPages) html += `<button class="page-btn" onclick="loadCars(${page + 1})"><i class="bi bi-chevron-right"></i></button>`;

  el.innerHTML = html;
}

// ── Booking modal helpers ────────────────────────────────────────────────────
function openBookingModal(carId, carName, type = 'test_drive') {
  document.getElementById('bookingCarId').value = carId;
  document.getElementById('bookingType').value  = type;
  document.getElementById('bookingModalTitle').textContent = type === 'test_drive' ? 'Book a Test Drive' : 'Book a Viewing';

  const infoEl = document.getElementById('bookingCarInfo');
  if (carId && carName) {
    infoEl.style.display = 'block';
    infoEl.innerHTML = `<i class="bi bi-car-front" style="color:var(--accent)"></i> <strong>${carName}</strong>`;
  } else {
    infoEl.style.display = 'none';
  }
  openModal('bookingModal');
}
window.openBookingModal = openBookingModal;

// ── Booking form submission ───────────────────────────────────────────────────
(function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = document.getElementById('bookingSubmitBtn');
    const type = document.getElementById('bookingType').value;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto"></div>';

    const body = {
      car_id:         document.getElementById('bookingCarId').value  || null,
      first_name:     document.getElementById('bFirstName').value,
      last_name:      document.getElementById('bLastName').value,
      email:          document.getElementById('bEmail').value,
      phone:          document.getElementById('bPhone').value,
      preferred_date: document.getElementById('bDate').value,
      preferred_time: document.getElementById('bTime').value,
      message:        document.getElementById('bMessage').value,
    };

    const endpoint = type === 'viewing' ? '/api/bookings/viewing' : '/api/bookings/test-drive';
    try {
      const res    = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        closeModal('bookingModal');
        showToast(`${result.message} Reference: ${result.data.reference}`, 'success', 6000);
        form.reset();
      } else {
        document.getElementById('bookingFormAlert').innerHTML =
          `<div class="alert alert-error"><i class="bi bi-exclamation-circle"></i>${result.error}</div>`;
      }
    } catch {
      document.getElementById('bookingFormAlert').innerHTML =
        `<div class="alert alert-error"><i class="bi bi-wifi-off"></i>Network error. Please try again.</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-calendar-check"></i> Confirm Booking';
    }
  });
})();

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  readURLParams();

  // Search
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    currentFilters = collectFilters();
    loadCars(1);
  });
  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { currentFilters = collectFilters(); loadCars(1); }
  });
  document.getElementById('clearSearchBtn')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    currentFilters = collectFilters();
    loadCars(1);
  });

  // Filters
  document.getElementById('applyFilters')?.addEventListener('click', () => {
    currentFilters = collectFilters();
    loadCars(1);
  });
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    ['filterMake','filterBodyType','filterFuelType','filterTransmission','filterMileage','filterPriceMin','filterPriceMax','filterYearMin','filterYearMax','searchInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
    currentFilters = {};
    loadCars(1);
  });

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', function() {
    currentSort = this.value;
    loadCars(1);
  });

  // View toggle
  document.getElementById('gridViewBtn')?.addEventListener('click', function() {
    isGridView = true;
    this.classList.add('active');
    document.getElementById('listViewBtn')?.classList.remove('active');
    document.getElementById('carsGrid').className = 'cars-grid';
  });
  document.getElementById('listViewBtn')?.addEventListener('click', function() {
    isGridView = false;
    this.classList.add('active');
    document.getElementById('gridViewBtn')?.classList.remove('active');
    document.getElementById('carsGrid').className = 'cars-grid cars-list';
  });

  // Mobile filter toggle
  document.getElementById('mobileFilterToggle')?.addEventListener('click', () => {
    document.getElementById('filtersSidebar')?.classList.toggle('mobile-open');
  });

  // Show mobile filter bar on small screens
  if (window.innerWidth <= 768) {
    const bar = document.getElementById('mobileFilterBar');
    if (bar) bar.style.display = 'block';
    document.getElementById('mobileSearch')?.addEventListener('input', function() {
      document.getElementById('searchInput').value = this.value;
    });
  }

  loadCars(currentPage);
});
