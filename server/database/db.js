const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/dealership.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_number TEXT UNIQUE,
    vin TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL,
    price REAL NOT NULL,
    mileage INTEGER DEFAULT 0,
    fuel_type TEXT DEFAULT 'Petrol',
    transmission TEXT DEFAULT 'Manual',
    body_type TEXT,
    color TEXT,
    engine TEXT,
    doors INTEGER DEFAULT 4,
    seats INTEGER DEFAULT 5,
    condition TEXT DEFAULT 'Used',
    badge TEXT,
    description TEXT,
    features TEXT DEFAULT '[]',
    images TEXT DEFAULT '[]',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_type TEXT NOT NULL CHECK(booking_type IN ('test_drive', 'viewing')),
    car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    alternate_date DATE,
    alternate_time TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    admin_reply TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trade_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    condition TEXT NOT NULL,
    color TEXT,
    service_history TEXT,
    extras TEXT,
    expected_price REAL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','reviewed','quoted','accepted','rejected')),
    offered_price REAL,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS finance_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_number TEXT,
    employment_type TEXT NOT NULL,
    employer TEXT,
    monthly_income REAL NOT NULL,
    deposit_amount REAL DEFAULT 0,
    loan_term INTEGER DEFAULT 72,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','processing','approved','rejected')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
  CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
  CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
  CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(is_featured, is_active);
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
  CREATE INDEX IF NOT EXISTS idx_messages_read ON contact_messages(is_read);
`);

module.exports = db;
