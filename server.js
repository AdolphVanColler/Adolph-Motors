require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const carsRouter = require('./server/routes/cars');
const bookingsRouter = require('./server/routes/bookings');
const authRouter = require('./server/routes/auth');
const contactRouter = require('./server/routes/contact');
const authMiddleware = require('./server/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
['./uploads', './uploads/cars'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Auto-seed database on first run (creates admin + car inventory if empty)
const db = require('./server/database/db');
const carCount = db.prepare('SELECT COUNT(*) as c FROM cars').get().c;
const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
if (carCount === 0 || adminCount === 0) {
  require('./server/database/seed');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'unpkg.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'unpkg.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:', 'picsum.photos', 'images.unsplash.com'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', strictLimiter);
app.use('/api/bookings/', strictLimiter);
app.use('/api/contact/', strictLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// API routes
app.use('/api/cars', carsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);

// Admin dashboard stats
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const db = require('./server/database/db');
  try {
    const stats = {
      totalCars: db.prepare('SELECT COUNT(*) as c FROM cars WHERE is_active = 1').get().c,
      featuredCars: db.prepare('SELECT COUNT(*) as c FROM cars WHERE is_featured = 1 AND is_active = 1').get().c,
      totalBookings: db.prepare('SELECT COUNT(*) as c FROM bookings').get().c,
      pendingBookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'").get().c,
      confirmedBookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'confirmed'").get().c,
      totalMessages: db.prepare('SELECT COUNT(*) as c FROM contact_messages').get().c,
      unreadMessages: db.prepare('SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0').get().c,
      totalTradeIns: db.prepare('SELECT COUNT(*) as c FROM trade_ins').get().c,
      pendingTradeIns: db.prepare("SELECT COUNT(*) as c FROM trade_ins WHERE status = 'pending'").get().c,
      totalFinanceInquiries: db.prepare('SELECT COUNT(*) as c FROM finance_inquiries').get().c,
      recentBookings: db.prepare(`
        SELECT b.*, c.make, c.model, c.year FROM bookings b
        LEFT JOIN cars c ON b.car_id = c.id
        ORDER BY b.created_at DESC LIMIT 8
      `).all(),
      recentMessages: db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5').all(),
      bookingsByType: db.prepare(`
        SELECT booking_type, COUNT(*) as count FROM bookings GROUP BY booking_type
      `).all(),
      carsInventoryValue: db.prepare('SELECT SUM(price) as total FROM cars WHERE is_active = 1').get().total || 0,
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Redirect /admin to login
app.get('/admin', (req, res) => res.redirect('/admin/login.html'));

// 404 handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`\n🚗  Adolph Motors is running!`);
  console.log(`    Website:    http://localhost:${PORT}`);
  console.log(`    Admin:      http://localhost:${PORT}/admin`);
  console.log(`    API Docs:   http://localhost:${PORT}/api/cars`);
  console.log(`    Mode:       ${process.env.NODE_ENV || 'development'}\n`);
});
