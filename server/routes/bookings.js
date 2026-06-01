const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Invalid date';
  const today = new Date(); today.setHours(0,0,0,0);
  if (d < today) return 'Date must be in the future';
  if (d.getDay() === 0) return 'We are closed on Sundays';
  return null;
}

// POST /api/bookings/test-drive
router.post('/test-drive', (req, res) => {
  const { car_id, first_name, last_name, email, phone, preferred_date, preferred_time, alternate_date, alternate_time, message } = req.body;
  if (!first_name || !last_name || !email || !phone || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'All required fields must be filled in' });
  }
  if (!emailRx.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  const dateErr = validateDate(preferred_date);
  if (dateErr) return res.status(400).json({ error: dateErr });

  try {
    const r = db.prepare(`
      INSERT INTO bookings (booking_type, car_id, first_name, last_name, email, phone,
        preferred_date, preferred_time, alternate_date, alternate_time, message)
      VALUES ('test_drive',?,?,?,?,?,?,?,?,?,?)
    `).run(car_id||null, first_name.trim(), last_name.trim(), email.trim().toLowerCase(),
           phone.trim(), preferred_date, preferred_time, alternate_date||null, alternate_time||null, message?.trim()||null);

    res.status(201).json({
      success: true,
      message: 'Test drive booked! We will confirm your appointment by email or phone.',
      data: { id: r.lastInsertRowid, reference: `TD-${String(r.lastInsertRowid).padStart(5,'0')}` },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to book test drive' });
  }
});

// POST /api/bookings/viewing
router.post('/viewing', (req, res) => {
  const { car_id, first_name, last_name, email, phone, preferred_date, preferred_time, alternate_date, alternate_time, message } = req.body;
  if (!first_name || !last_name || !email || !phone || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'All required fields must be filled in' });
  }
  if (!emailRx.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  const dateErr = validateDate(preferred_date);
  if (dateErr) return res.status(400).json({ error: dateErr });

  try {
    const r = db.prepare(`
      INSERT INTO bookings (booking_type, car_id, first_name, last_name, email, phone,
        preferred_date, preferred_time, alternate_date, alternate_time, message)
      VALUES ('viewing',?,?,?,?,?,?,?,?,?,?)
    `).run(car_id||null, first_name.trim(), last_name.trim(), email.trim().toLowerCase(),
           phone.trim(), preferred_date, preferred_time, alternate_date||null, alternate_time||null, message?.trim()||null);

    res.status(201).json({
      success: true,
      message: 'Viewing booked! We will confirm your appointment by email or phone.',
      data: { id: r.lastInsertRowid, reference: `VW-${String(r.lastInsertRowid).padStart(5,'0')}` },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to book viewing' });
  }
});

// POST /api/bookings/trade-in
router.post('/trade-in', (req, res) => {
  const { first_name, last_name, email, phone, make, model, year, mileage, condition, color, service_history, extras, expected_price } = req.body;
  if (!first_name || !last_name || !email || !phone || !make || !model || !year || mileage===undefined || !condition) {
    return res.status(400).json({ error: 'All required fields must be filled in' });
  }
  if (!emailRx.test(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const r = db.prepare(`
      INSERT INTO trade_ins (first_name, last_name, email, phone, make, model, year, mileage, condition, color, service_history, extras, expected_price)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone.trim(),
           make.trim(), model.trim(), +year, +mileage, condition, color?.trim()||null, service_history?.trim()||null, extras?.trim()||null, expected_price?+expected_price:null);

    res.status(201).json({
      success: true,
      message: 'Trade-in request received! Our team will provide a valuation within 24 hours.',
      data: { id: r.lastInsertRowid, reference: `TI-${String(r.lastInsertRowid).padStart(5,'0')}` },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit trade-in' });
  }
});

// POST /api/bookings/finance
router.post('/finance', (req, res) => {
  const { car_id, first_name, last_name, email, phone, id_number, employment_type, employer, monthly_income, deposit_amount, loan_term } = req.body;
  if (!first_name || !last_name || !email || !phone || !employment_type || !monthly_income) {
    return res.status(400).json({ error: 'All required fields must be filled in' });
  }
  if (!emailRx.test(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const r = db.prepare(`
      INSERT INTO finance_inquiries (car_id, first_name, last_name, email, phone, id_number, employment_type, employer, monthly_income, deposit_amount, loan_term)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(car_id||null, first_name.trim(), last_name.trim(), email.trim().toLowerCase(), phone.trim(),
           id_number?.trim()||null, employment_type, employer?.trim()||null, +monthly_income, +deposit_amount||0, +loan_term||72);

    res.status(201).json({
      success: true,
      message: 'Finance application received! Our finance team will contact you within 2 business hours.',
      data: { id: r.lastInsertRowid, reference: `FI-${String(r.lastInsertRowid).padStart(5,'0')}` },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit finance application' });
  }
});

// GET /api/bookings (admin)
router.get('/', authMiddleware, (req, res) => {
  try {
    const { type, status, page=1, limit=20 } = req.query;
    const where = []; const params = [];
    if (type)   { where.push('b.booking_type=?'); params.push(type); }
    if (status) { where.push('b.status=?');        params.push(status); }
    const wc  = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const lim = Math.min(+limit||20, 100);
    const off = ((+page||1)-1)*lim;
    const total = db.prepare(`SELECT COUNT(*) as c FROM bookings b ${wc}`).get(...params).c;
    const data  = db.prepare(`
      SELECT b.*, c.make, c.model, c.year, c.stock_number FROM bookings b
      LEFT JOIN cars c ON b.car_id = c.id ${wc}
      ORDER BY b.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, lim, off);
    res.json({ success:true, data, pagination:{ total, page:+page, totalPages: Math.ceil(total/lim) } });
  } catch { res.status(500).json({ error: 'Failed to fetch bookings' }); }
});

// GET /api/bookings/trade-ins (admin)
router.get('/trade-ins', authMiddleware, (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM trade_ins ORDER BY created_at DESC').all();
    res.json({ success: true, data });
  } catch { res.status(500).json({ error: 'Failed to fetch trade-ins' }); }
});

// GET /api/bookings/finance-inquiries (admin)
router.get('/finance-inquiries', authMiddleware, (req, res) => {
  try {
    const data = db.prepare(`
      SELECT fi.*, c.make, c.model, c.year FROM finance_inquiries fi
      LEFT JOIN cars c ON fi.car_id = c.id ORDER BY fi.created_at DESC
    `).all();
    res.json({ success: true, data });
  } catch { res.status(500).json({ error: 'Failed to fetch finance inquiries' }); }
});

// PUT /api/bookings/:id (admin)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const valid = ['pending','confirmed','completed','cancelled'];
    if (status && !valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    db.prepare(`UPDATE bookings SET status=COALESCE(?,status), admin_notes=COALESCE(?,admin_notes), updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(status||null, admin_notes||null, req.params.id);
    res.json({ success: true, data: db.prepare('SELECT * FROM bookings WHERE id=?').get(req.params.id) });
  } catch { res.status(500).json({ error: 'Failed to update booking' }); }
});

module.exports = router;
