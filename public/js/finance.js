/* ==============================================
   Adolph Motors — Finance Page (finance.js)
   ============================================== */

'use strict';

// ── Finance Calculator ────────────────────────────────────────────────────────
(function initCalc() {
  const els = {
    price:   document.getElementById('vehiclePrice'),
    deposit: document.getElementById('depositAmount'),
    term:    document.getElementById('loanTerm'),
    rate:    document.getElementById('interestRate'),
    initFee: document.getElementById('includeInitFee'),
  };
  if (!els.price) return;

  function update() {
    const price   = +els.price.value;
    const deposit = +els.deposit.value;
    const term    = +els.term.value;
    const rate    = +els.rate.value;
    const initFee = els.initFee?.checked ? 1207.50 : 0;

    const principal = price - deposit + initFee;
    const r         = (rate / 100) / 12;
    const monthly   = principal > 0 && r > 0
      ? (principal * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1)
      : 0;
    const total    = monthly * term;
    const interest = total - principal;

    // Update labels
    document.getElementById('priceLabel').textContent   = `R ${price.toLocaleString()}`;
    document.getElementById('depositLabel').textContent  = `R ${deposit.toLocaleString()}`;
    document.getElementById('termLabel').textContent     = `${term} months`;
    document.getElementById('rateLabel').textContent     = `${rate.toFixed(2)}%`;

    // Update results
    document.getElementById('monthlyPayment').textContent = Math.round(monthly).toLocaleString();
    document.getElementById('loanAmount').textContent     = Math.round(principal).toLocaleString();
    document.getElementById('totalInterest').textContent  = Math.round(interest).toLocaleString();
    document.getElementById('totalRepayment').textContent = Math.round(total).toLocaleString();
    document.getElementById('effectiveRate').textContent  = rate.toFixed(2);
  }

  Object.values(els).forEach(el => el?.addEventListener('input', update));
  update();
})();

// ── Finance Application Form ──────────────────────────────────────────────────
(function initFinanceForm() {
  const form = document.getElementById('financeForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto"></div>';

    const body = {
      first_name:      document.getElementById('fiFirstName').value,
      last_name:       document.getElementById('fiLastName').value,
      email:           document.getElementById('fiEmail').value,
      phone:           document.getElementById('fiPhone').value,
      employment_type: document.getElementById('fiEmploymentType').value,
      employer:        document.getElementById('fiEmployer').value,
      monthly_income:  document.getElementById('fiMonthlyIncome').value,
      deposit_amount:  document.getElementById('fiDepositAmount').value || 0,
      loan_term:       document.getElementById('fiLoanTerm').value,
    };

    const alertEl = document.getElementById('financeAlert');
    try {
      const res    = await fetch('/api/bookings/finance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        alertEl.innerHTML = `<div class="alert alert-success"><i class="bi bi-check-circle-fill"></i>${result.message} Your reference is <strong>${result.data.reference}</strong>.</div>`;
        form.reset();
        if (typeof showToast === 'function') showToast('Finance application submitted!', 'success');
      } else {
        alertEl.innerHTML = `<div class="alert alert-error"><i class="bi bi-exclamation-circle"></i>${result.error}</div>`;
      }
    } catch {
      alertEl.innerHTML = `<div class="alert alert-error"><i class="bi bi-wifi-off"></i>Network error. Please try again.</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send"></i> Submit Finance Application';
    }
  });
})();
