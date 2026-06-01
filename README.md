# 🚗 Adolph Motors — Full Car Dealership Website

A fully-featured, production-ready car dealership website built with Node.js, Express, and SQLite. Includes a customer-facing frontend and a complete admin panel.

---

## ✨ Features

### Customer-Facing
- **Homepage** — Hero search, featured vehicles, finance calculator teaser, brands, testimonials
- **Inventory** — Advanced search & filters (make, model, price, mileage, fuel, transmission, body type), grid/list view, sorting, pagination
- **Vehicle Detail** — Image gallery, full specs, feature list, similar vehicles
- **Book Test Drive** — Online booking with date/time selection
- **Book Viewing** — Schedule a dealership visit
- **Finance Calculator** — Real-time monthly payment estimator + application form
- **Trade-In Valuation** — Submit current vehicle for valuation
- **Vehicle Comparison** — Side-by-side comparison of up to 3 vehicles
- **Wishlist** — Save favourite vehicles (localStorage)
- **Contact Form** — General enquiries + WhatsApp quick link
- **About Page** — Story, team, values, awards
- **PWA** — Installable as an app, offline-capable CSS/JS caching

### Admin Panel (`/admin`)
- **Dashboard** — Live stats (cars, bookings, messages, trade-ins)
- **Inventory Management** — Add, edit, delete vehicles with image upload
- **Bookings** — View, confirm, cancel test drives and viewings
- **Messages** — Read and reply to contact form submissions
- **Trade-Ins** — Review trade-in requests
- **Finance Applications** — View finance inquiries
- **JWT Authentication** — Secure admin login

---

## 🛠 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Runtime   | Node.js 18+ |
| Framework | Express.js 4 |
| Database  | SQLite (better-sqlite3) |
| Auth      | JWT + bcrypt |
| Upload    | Multer |
| Security  | Helmet, CORS, Rate Limiting |
| Frontend  | Vanilla HTML5 / CSS3 / ES2024 JS |
| Icons     | Bootstrap Icons |
| Fonts     | Google Fonts (Inter, Plus Jakarta Sans) |

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/adolph-motors.git
cd adolph-motors
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### 4. Seed the database (creates demo cars + admin user)
```bash
npm run seed
```

### 5. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 6. Open in browser
- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

---

## 🔑 Default Admin Credentials

> **Change these immediately in production!**

| Field    | Value    |
|----------|----------|
| Username | `admin`  |
| Password | `admin123` |

---

## 📁 Project Structure

```
adolph-motors/
├── public/                  # Static frontend files
│   ├── css/main.css         # All styles
│   ├── js/                  # Page-specific JavaScript
│   ├── admin/               # Admin panel HTML pages
│   ├── images/              # Static images & favicon
│   ├── index.html           # Home page
│   ├── inventory.html       # Browse vehicles
│   ├── car-detail.html      # Vehicle detail page
│   ├── finance.html         # Finance calculator
│   ├── trade-in.html        # Trade-in form
│   ├── compare.html         # Vehicle comparison
│   ├── about.html           # About us
│   ├── contact.html         # Contact form
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── server/
│   ├── database/
│   │   ├── db.js            # SQLite setup & schema
│   │   └── seed.js          # Demo data seeder
│   ├── middleware/auth.js    # JWT middleware
│   └── routes/
│       ├── auth.js          # Login/verify
│       ├── cars.js          # Vehicle CRUD API
│       ├── bookings.js      # Bookings API
│       └── contact.js       # Contact/newsletter API
├── uploads/cars/            # Uploaded vehicle images
├── data/dealership.db       # SQLite database (auto-created)
├── server.js                # Main Express server
├── package.json
└── .env.example
```

---

## 🌐 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars` | List cars with filters |
| GET | `/api/cars/featured` | Featured vehicles |
| GET | `/api/cars/:id` | Single vehicle detail |
| POST | `/api/bookings/test-drive` | Book test drive |
| POST | `/api/bookings/viewing` | Book viewing |
| POST | `/api/bookings/trade-in` | Submit trade-in |
| POST | `/api/bookings/finance` | Finance application |
| POST | `/api/contact` | Send contact message |
| POST | `/api/contact/newsletter` | Newsletter signup |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/cars` | Add vehicle |
| PUT | `/api/cars/:id` | Update vehicle |
| DELETE | `/api/cars/:id` | Remove vehicle |
| GET | `/api/bookings` | List bookings |
| PUT | `/api/bookings/:id` | Update booking status |
| GET | `/api/contact` | List messages |

---

## 📸 Adding Real Vehicle Images

1. Log into the admin panel at `/admin`
2. Go to **Inventory → Add Vehicle** or edit an existing one
3. Upload images directly from the car form (up to 20 images per vehicle)
4. Images are stored in `uploads/cars/` and served at `/uploads/cars/filename.jpg`

---

## 🔐 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Generate a strong `JWT_SECRET` (minimum 32 random characters)
3. Set `ALLOWED_ORIGINS` to your domain
4. Use a process manager like **PM2**: `pm2 start server.js --name adolph-motors`
5. Put **Nginx** or **Caddy** in front as a reverse proxy with SSL

---

## 📄 Legal

This project is original work created from scratch. It is not affiliated with, derived from, or copying any existing dealership website. All car data in the seed file is fictional demo data.

---

## 🤝 Contributing

Pull requests welcome. For major changes, please open an issue first.

---

*Built with ❤️ — Adolph Motors © 2026*
