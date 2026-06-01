/* ==============================================
   Adolph Motors — Car Detail Page (car-detail.js)
   ============================================== */

'use strict';

let currentCar   = null;
let currentImgIdx = 0;

// ── Fetch car data ────────────────────────────────────────────────────────────
async function loadCar() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return showError();

  try {
    const res  = await fetch(`/api/cars/${id}`);
    const data = await res.json();
    if (!data.success) return showError();

    currentCar = data.data;
    renderCar(currentCar);
    renderSimilar(data.similar || []);

    document.getElementById('loadingState').style.display    = 'none';
    document.getElementById('carDetailContent').style.display = 'block';
    document.title = `${currentCar.year} ${currentCar.make} ${currentCar.model} | Adolph Motors`;
  } catch {
    showError();
  }
}

function showError() {
  document.getElementById('loadingState').style.display = 'none';
  const err = document.getElementById('errorState');
  if (err) err.style.display = 'flex';
}

// ── Render car details ────────────────────────────────────────────────────────
function renderCar(car) {
  // Breadcrumb
  document.getElementById('breadcrumbCar').textContent = `${car.year} ${car.make} ${car.model}`;

  // Gallery
  renderGallery(car.images);

  // Badge
  const badgeRow = document.getElementById('carBadgeRow');
  if (car.badge) {
    badgeRow.innerHTML = `<span class="car-badge ${getBadgeClass(car.badge)}">${car.badge}</span>`;
  }

  // Titles
  document.getElementById('detailMake').textContent    = car.make;
  document.getElementById('detailTitle').textContent   = `${car.year} ${car.make} ${car.model}`;
  document.getElementById('detailVariant').textContent = car.variant || '';

  // Price
  document.getElementById('detailPrice').textContent   = Number(car.price).toLocaleString();
  document.getElementById('detailMonthly').textContent = calcMonthly(car.price, 0, 72).toLocaleString();

  // Quick specs row
  document.getElementById('detailMileage').textContent     = formatMileage(car.mileage);
  document.getElementById('detailYear').textContent         = car.year;
  document.getElementById('detailFuel').textContent         = car.fuel_type;
  document.getElementById('detailTransmission').textContent = car.transmission;

  // Specs grid
  const specsGrid = document.getElementById('specsGrid');
  const specs = [
    { label: 'Make',         value: car.make },
    { label: 'Model',        value: car.model },
    { label: 'Year',         value: car.year },
    { label: 'Variant',      value: car.variant || '—' },
    { label: 'Engine',       value: car.engine || '—' },
    { label: 'Fuel Type',    value: car.fuel_type },
    { label: 'Transmission', value: car.transmission },
    { label: 'Body Type',    value: car.body_type || '—' },
    { label: 'Mileage',      value: formatMileage(car.mileage) },
    { label: 'Colour',       value: car.color || '—' },
    { label: 'Doors',        value: car.doors },
    { label: 'Seats',        value: car.seats },
    { label: 'Condition',    value: car.condition },
    { label: 'Stock No.',    value: car.stock_number || '—' },
  ];
  specsGrid.innerHTML = specs.map(s =>
    `<div class="spec-item"><div class="spec-label">${s.label}</div><div class="spec-value">${s.value}</div></div>`
  ).join('');

  // Features
  const featuresList = document.getElementById('featuresList');
  if (car.features?.length) {
    featuresList.innerHTML = car.features.map(f =>
      `<span class="feature-tag"><i class="bi bi-check-circle-fill"></i>${f}</span>`
    ).join('');
  } else {
    featuresList.innerHTML = '<p style="color:var(--gray-400)">No features listed</p>';
  }

  // Description
  document.getElementById('carDescription').textContent = car.description || 'No description available.';

  // Footer meta
  document.getElementById('detailStock').textContent = car.stock_number || '—';
  document.getElementById('detailViews').textContent  = (car.views + 1).toLocaleString();

  // Wishlist button state
  const wBtn = document.getElementById('wishlistBtn');
  const wTxt = document.getElementById('wishlistBtnText');
  if (wishlist.has(car.id)) {
    wBtn.innerHTML = '<i class="bi bi-heart-fill" style="color:var(--accent)"></i> <span id="wishlistBtnText">Saved to Wishlist</span>';
  }
  wBtn?.addEventListener('click', () => {
    const added = wishlist.toggle(car.id);
    wBtn.innerHTML = added
      ? '<i class="bi bi-heart-fill" style="color:var(--accent)"></i> <span>Saved to Wishlist</span>'
      : '<i class="bi bi-heart"></i> <span>Save to Wishlist</span>';
    showToast(added ? 'Added to wishlist!' : 'Removed from wishlist', added ? 'success' : 'info', 2000);
  });

  // CTA Buttons
  const carInfoLabel = `${car.year} ${car.make} ${car.model}`;

  document.getElementById('testDriveBtn')?.addEventListener('click', () => {
    document.getElementById('tdCarInfo').textContent = `🚗 ${carInfoLabel}`;
    document.querySelectorAll('#testDriveModal input[type="date"]').forEach(el => {
      const d = new Date(); d.setDate(d.getDate() + 1);
      el.min = d.toISOString().split('T')[0]; el.value = el.min;
    });
    openModal('testDriveModal');
  });

  document.getElementById('viewingBtn')?.addEventListener('click', () => {
    document.getElementById('vwCarInfo').textContent = `👁 ${carInfoLabel}`;
    document.querySelectorAll('#viewingModal input[type="date"]').forEach(el => {
      const d = new Date(); d.setDate(d.getDate() + 1);
      el.min = d.toISOString().split('T')[0]; el.value = el.min;
    });
    openModal('viewingModal');
  });

  document.getElementById('financeBtn')?.addEventListener('click', () => {
    document.getElementById('fiCarInfo').textContent = `💳 Financing: ${carInfoLabel} — R ${Number(car.price).toLocaleString()}`;
    openModal('financeModal');
  });

  document.getElementById('whatsappBtn')?.addEventListener('click', () => {
    const msg = encodeURIComponent(`Hi Adolph Motors! I'm interested in the ${carInfoLabel} (Stock: ${car.stock_number || 'N/A'}) listed at R ${Number(car.price).toLocaleString()}. Can you give me more information?`);
    window.open(`https://wa.me/27820000000?text=${msg}`, '_blank');
  });

  // Booking form submissions
  initTestDriveForm(car.id);
  initViewingForm(car.id);
  initFinanceForm(car.id);
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function renderGallery(images) {
  if (!images?.length) {
    document.getElementById('galleryMain').innerHTML = `
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gray-400);flex-direction:column;gap:.5rem">
        <i class="bi bi-image" style="font-size:4rem"></i><p>No images available</p>
      </div>`;
    document.getElementById('galleryThumbs').innerHTML = '';
    document.querySelector('.gallery-prev')?.remove();
    document.querySelector('.gallery-next')?.remove();
    return;
  }

  const mainImg  = document.getElementById('mainGalleryImg');
  const thumbsEl = document.getElementById('galleryThumbs');

  mainImg.src  = images[0];
  mainImg.alt  = 'Vehicle';

  thumbsEl.innerHTML = images.map((img, i) => `
    <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <img src="${img}" alt="View ${i + 1}" loading="lazy">
    </div>`).join('');

  thumbsEl.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => goToImage(+thumb.dataset.idx));
  });

  document.getElementById('galleryPrev')?.addEventListener('click', () => goToImage((currentImgIdx - 1 + images.length) % images.length));
  document.getElementById('galleryNext')?.addEventListener('click', () => goToImage((currentImgIdx + 1) % images.length));

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goToImage((currentImgIdx - 1 + images.length) % images.length);
    if (e.key === 'ArrowRight') goToImage((currentImgIdx + 1) % images.length);
  });

  function goToImage(idx) {
    currentImgIdx = idx;
    mainImg.style.opacity = '0';
    setTimeout(() => { mainImg.src = images[idx]; mainImg.style.opacity = '1'; }, 150);
    thumbsEl.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
    thumbsEl.children[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// ── Similar Vehicles ──────────────────────────────────────────────────────────
function renderSimilar(cars) {
  const el = document.getElementById('similarCars');
  if (!el) return;
  if (!cars.length) { document.getElementById('similarSection')?.remove(); return; }
  el.innerHTML = cars.map(c => buildCarCard(c)).join('');
}

// ── Booking Form Handlers ─────────────────────────────────────────────────────
function initTestDriveForm(carId) {
  document.getElementById('testDriveForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await submitBooking('test_drive', carId, {
      first_name: document.getElementById('tdFirstName').value,
      last_name:  document.getElementById('tdLastName').value,
      email:      document.getElementById('tdEmail').value,
      phone:      document.getElementById('tdPhone').value,
      preferred_date: document.getElementById('tdDate').value,
      preferred_time: document.getElementById('tdTime').value,
      message:    document.getElementById('tdMessage').value,
    }, 'tdAlert', 'testDriveModal', 'Test drive booked!');
  });
}

function initViewingForm(carId) {
  document.getElementById('viewingForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await submitBooking('viewing', carId, {
      first_name: document.getElementById('vwFirstName').value,
      last_name:  document.getElementById('vwLastName').value,
      email:      document.getElementById('vwEmail').value,
      phone:      document.getElementById('vwPhone').value,
      preferred_date: document.getElementById('vwDate').value,
      preferred_time: document.getElementById('vwTime').value,
      message:    document.getElementById('vwMessage').value,
    }, 'vwAlert', 'viewingModal', 'Viewing booked!');
  });
}

function initFinanceForm(carId) {
  document.getElementById('financeModalForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto"></div>';

    const body = {
      car_id:          carId,
      first_name:      document.getElementById('fiFirstName').value,
      last_name:       document.getElementById('fiLastName').value,
      email:           document.getElementById('fiEmail').value,
      phone:           document.getElementById('fiPhone').value,
      employment_type: document.getElementById('fiEmployment').value,
      monthly_income:  document.getElementById('fiIncome').value,
      deposit_amount:  document.getElementById('fiDeposit').value || 0,
      loan_term:       document.getElementById('fiTerm').value,
    };

    try {
      const res    = await fetch('/api/bookings/finance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        closeModal('financeModal');
        showToast(`Finance application submitted! Ref: ${result.data.reference}`, 'success', 6000);
        e.target.reset();
      } else {
        document.getElementById('fiAlert').innerHTML = `<div class="alert alert-error"><i class="bi bi-exclamation-circle"></i>${result.error}</div>`;
      }
    } catch {
      document.getElementById('fiAlert').innerHTML = `<div class="alert alert-error"><i class="bi bi-wifi-off"></i>Network error.</div>`;
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-send"></i> Submit Application';
    }
  });
}

async function submitBooking(type, carId, body, alertId, modalId, successMsg) {
  const form = document.querySelector(`#${modalId} form`);
  const btn  = form?.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto"></div>'; }

  const endpoint = type === 'viewing' ? '/api/bookings/viewing' : '/api/bookings/test-drive';
  try {
    const res    = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ car_id: carId, ...body }) });
    const result = await res.json();
    if (result.success) {
      closeModal(modalId);
      showToast(`${result.message} Ref: ${result.data.reference}`, 'success', 6000);
      form?.reset();
    } else {
      document.getElementById(alertId).innerHTML = `<div class="alert alert-error"><i class="bi bi-exclamation-circle"></i>${result.error}</div>`;
    }
  } catch {
    document.getElementById(alertId).innerHTML = `<div class="alert alert-error"><i class="bi bi-wifi-off"></i>Network error.</div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = type === 'test_drive' ? '<i class="bi bi-calendar-check"></i> Confirm Test Drive' : '<i class="bi bi-calendar-check"></i> Confirm Viewing'; }
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadCar);
