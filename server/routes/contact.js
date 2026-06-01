const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, subject and message are required' });
  }
  if (!emailRx.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  if (message.trim().length < 10) return res.status(400).json({ error: 'Message is too short' });

  try {
    db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)')
      .run(name.trim(), email.trim().toLowerCase(), phone?.trim()||null, subject.trim(), message.trim());
    res.status(201).json({ success: true, message: 'Message sent! We will respond within 24 hours.' });
  } catch { res.status(500).json({ error: 'Failed to send message' }); }
});

router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !emailRx.test(email)) return res.status(400).json({ error: 'Valid email required' });
  try {
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(email.trim().toLowerCase());
    res.json({ success: true, message: 'Subscribed! Thank you for joining our newsletter.' });
  } catch { res.status(500).json({ error: 'Failed to subscribe' }); }
});

router.get('/', authMiddleware, (req, res) => {
  try {
    const { is_read, page=1, limit=20 } = req.query;
    const where = []; const params = [];
    if (is_read !== undefined) { where.push('is_read=?'); params.push(is_read==='true'?1:0); }
    const wc = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const lim = Math.min(+limit||20, 100);
    const off = ((+page||1)-1)*lim;
    const total = db.prepare(`SELECT COUNT(*) as c FROM contact_messages ${wc}`).get(...params).c;
    const data  = db.prepare(`SELECT * FROM contact_messages ${wc} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, lim, off);
    res.json({ success:true, data, pagination:{ total, page:+page, totalPages: Math.ceil(total/lim) } });
  } catch { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { is_read, admin_reply } = req.body;
    db.prepare(`UPDATE contact_messages SET is_read=COALESCE(?,is_read), admin_reply=COALESCE(?,admin_reply) WHERE id=?`)
      .run(is_read!==undefined?(is_read?1:0):null, admin_reply||null, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update message' }); }
});

router.get('/newsletter-subscribers', authMiddleware, (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM newsletter_subscribers WHERE is_active=1 ORDER BY subscribed_at DESC').all();
    res.json({ success: true, data, total: data.length });
  } catch { res.status(500).json({ error: 'Failed to fetch subscribers' }); }
});

module.exports = router;
