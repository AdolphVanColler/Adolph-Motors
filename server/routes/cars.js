const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/cars')),
  filename: (req, file, cb) => cb(null, `car-${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
});

const parseCar = (car) => ({
  ...car,
  images: JSON.parse(car.images || '[]'),
  features: JSON.parse(car.features || '[]'),
});

// GET /api/cars
router.get('/', (req, res) => {
  try {
    const {
      make, model, year_min, year_max, price_min, price_max,
      mileage_max, fuel_type, transmission, body_type, condition,
      featured, search, sort = 'created_at', order = 'DESC',
      page = 1, limit = 12,
    } = req.query;

    const where = ['is_active = 1'];
    const params = [];

    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(Number).filter(n => n > 0);
      if (ids.length) { where.push(`id IN (${ids.map(() => '?').join(',')})`); params.push(...ids); }
    }
    if (make)         { where.push('LOWER(make) = LOWER(?)');              params.push(make); }
    if (model)        { where.push('LOWER(model) LIKE LOWER(?)');          params.push(`%${model}%`); }
    if (year_min)     { where.push('year >= ?');                           params.push(+year_min); }
    if (year_max)     { where.push('year <= ?');                           params.push(+year_max); }
    if (price_min)    { where.push('price >= ?');                          params.push(+price_min); }
    if (price_max)    { where.push('price <= ?');                          params.push(+price_max); }
    if (mileage_max)  { where.push('mileage <= ?');                        params.push(+mileage_max); }
    if (fuel_type)    { where.push('LOWER(fuel_type) = LOWER(?)');         params.push(fuel_type); }
    if (transmission) { where.push('LOWER(transmission) = LOWER(?)');      params.push(transmission); }
    if (body_type)    { where.push('LOWER(body_type) = LOWER(?)');         params.push(body_type); }
    if (condition) {
      const conds = condition.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      if (conds.length === 1) {
        where.push('LOWER(condition) = ?'); params.push(conds[0]);
      } else if (conds.length > 1) {
        where.push(`LOWER(condition) IN (${conds.map(() => '?').join(',')})`); params.push(...conds);
      }
    }
    if (featured === 'true') { where.push('is_featured = 1'); }
    if (search) {
      where.push('(LOWER(make) LIKE LOWER(?) OR LOWER(model) LIKE LOWER(?) OR LOWER(variant) LIKE LOWER(?) OR stock_number LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const wc = `WHERE ${where.join(' AND ')}`;
    const sf = ['price','year','mileage','created_at','make','model','views'].includes(sort) ? sort : 'created_at';
    const so = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const lim = Math.min(+limit || 12, 50);
    const offset = ((+page || 1) - 1) * lim;

    const total = db.prepare(`SELECT COUNT(*) as c FROM cars ${wc}`).get(...params).c;
    const cars = db.prepare(`
      SELECT id, stock_number, make, model, variant, year, price, mileage,
             fuel_type, transmission, body_type, color, engine, doors, seats,
             condition, badge, images, is_featured, views, created_at
      FROM cars ${wc} ORDER BY ${sf} ${so} LIMIT ? OFFSET ?
    `).all(...params, lim, offset);

    const makes     = db.prepare("SELECT DISTINCT make FROM cars WHERE is_active=1 ORDER BY make").all().map(r=>r.make);
    const bodyTypes = db.prepare("SELECT DISTINCT body_type FROM cars WHERE is_active=1 AND body_type IS NOT NULL ORDER BY body_type").all().map(r=>r.body_type);
    const fuelTypes = db.prepare("SELECT DISTINCT fuel_type FROM cars WHERE is_active=1 AND fuel_type IS NOT NULL ORDER BY fuel_type").all().map(r=>r.fuel_type);
    const years     = db.prepare("SELECT MIN(year) as min, MAX(year) as max FROM cars WHERE is_active=1").get();
    const prices    = db.prepare("SELECT MIN(price) as min, MAX(price) as max FROM cars WHERE is_active=1").get();

    res.json({
      success: true,
      data: cars.map(c => ({ ...c, images: JSON.parse(c.images || '[]') })),
      pagination: { total, page: +page, limit: lim, totalPages: Math.ceil(total / lim) },
      filters: { makes, bodyTypes, fuelTypes, yearRange: years, priceRange: prices },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// GET /api/cars/featured
router.get('/featured', (req, res) => {
  try {
    const cars = db.prepare('SELECT * FROM cars WHERE is_featured=1 AND is_active=1 ORDER BY created_at DESC LIMIT 6').all();
    res.json({ success: true, data: cars.map(parseCar) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch featured cars' });
  }
});

// GET /api/cars/makes
router.get('/makes', (req, res) => {
  try {
    const makes = db.prepare("SELECT DISTINCT make FROM cars WHERE is_active=1 ORDER BY make").all().map(r=>r.make);
    res.json({ success: true, data: makes });
  } catch {
    res.status(500).json({ error: 'Failed to fetch makes' });
  }
});

// GET /api/cars/:id
router.get('/:id', (req, res) => {
  try {
    const car = db.prepare('SELECT * FROM cars WHERE id=? AND is_active=1').get(req.params.id);
    if (!car) return res.status(404).json({ error: 'Vehicle not found' });

    db.prepare('UPDATE cars SET views = views + 1 WHERE id=?').run(car.id);

    const similar = db.prepare(`
      SELECT id, make, model, variant, year, price, mileage, fuel_type, transmission, body_type, images, badge
      FROM cars WHERE id != ? AND is_active=1 AND (body_type=? OR make=?)
      ORDER BY ABS(price - ?) ASC LIMIT 4
    `).all(car.id, car.body_type, car.make, car.price);

    res.json({
      success: true,
      data: parseCar(car),
      similar: similar.map(s => ({ ...s, images: JSON.parse(s.images || '[]') })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// POST /api/cars (admin)
router.post('/', authMiddleware, upload.array('images', 20), (req, res) => {
  try {
    const {
      stock_number, vin, make, model, variant, year, price, mileage,
      fuel_type, transmission, body_type, color, engine, doors, seats,
      condition, badge, description, features, is_featured, existing_images,
    } = req.body;

    if (!make || !model || !year || !price) {
      return res.status(400).json({ error: 'Make, model, year and price are required' });
    }

    const newImgs    = (req.files || []).map(f => `/uploads/cars/${f.filename}`);
    const existImgs  = existing_images ? JSON.parse(existing_images) : [];
    const allImages  = [...existImgs, ...newImgs];
    const parsedFeats = typeof features === 'string' ? JSON.parse(features || '[]') : (features || []);

    const result = db.prepare(`
      INSERT INTO cars (stock_number, vin, make, model, variant, year, price, mileage,
        fuel_type, transmission, body_type, color, engine, doors, seats,
        condition, badge, description, features, images, is_featured)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      stock_number||null, vin||null, make, model, variant||null,
      +year, +price, +mileage||0,
      fuel_type||'Petrol', transmission||'Manual', body_type||null,
      color||null, engine||null, +doors||4, +seats||5,
      condition||'Used', badge||null, description||null,
      JSON.stringify(parsedFeats), JSON.stringify(allImages),
      ['true','1',true,1].includes(is_featured) ? 1 : 0,
    );

    const newCar = db.prepare('SELECT * FROM cars WHERE id=?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: parseCar(newCar) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to create vehicle' });
  }
});

// PUT /api/cars/:id (admin)
router.put('/:id', authMiddleware, upload.array('images', 20), (req, res) => {
  try {
    const car = db.prepare('SELECT * FROM cars WHERE id=?').get(req.params.id);
    if (!car) return res.status(404).json({ error: 'Vehicle not found' });

    const {
      stock_number, vin, make, model, variant, year, price, mileage,
      fuel_type, transmission, body_type, color, engine, doors, seats,
      condition, badge, description, features, is_featured, is_active, existing_images,
    } = req.body;

    const newImgs   = (req.files || []).map(f => `/uploads/cars/${f.filename}`);
    const existImgs = existing_images ? JSON.parse(existing_images) : JSON.parse(car.images || '[]');
    const allImages = [...existImgs, ...newImgs];
    const parsedFeats = typeof features === 'string' ? JSON.parse(features || '[]') : (features || JSON.parse(car.features || '[]'));

    db.prepare(`
      UPDATE cars SET stock_number=?, vin=?, make=?, model=?, variant=?, year=?, price=?,
        mileage=?, fuel_type=?, transmission=?, body_type=?, color=?, engine=?, doors=?, seats=?,
        condition=?, badge=?, description=?, features=?, images=?, is_featured=?, is_active=?,
        updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(
      stock_number??car.stock_number, vin??car.vin,
      make||car.make, model||car.model, variant??car.variant,
      +(year||car.year), +(price||car.price), +(mileage??car.mileage),
      fuel_type||car.fuel_type, transmission||car.transmission,
      body_type||car.body_type, color??car.color, engine??car.engine,
      +(doors||car.doors), +(seats||car.seats),
      condition||car.condition, badge??car.badge, description??car.description,
      JSON.stringify(parsedFeats), JSON.stringify(allImages),
      ['true','1',true,1].includes(is_featured) ? 1 : (is_featured===undefined ? car.is_featured : 0),
      ['true','1',true,1].includes(is_active)   ? 1 : (is_active===undefined   ? car.is_active   : 0),
      req.params.id,
    );

    const updated = db.prepare('SELECT * FROM cars WHERE id=?').get(req.params.id);
    res.json({ success: true, data: parseCar(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to update vehicle' });
  }
});

// DELETE /api/cars/:id (soft delete, admin)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const car = db.prepare('SELECT id FROM cars WHERE id=?').get(req.params.id);
    if (!car) return res.status(404).json({ error: 'Vehicle not found' });
    db.prepare('UPDATE cars SET is_active=0, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(req.params.id);
    res.json({ success: true, message: 'Vehicle removed from inventory' });
  } catch {
    res.status(500).json({ error: 'Failed to remove vehicle' });
  }
});

module.exports = router;
