require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('🌱 Seeding Adolph Motors database...\n');

// Admin user
const adminHash = bcrypt.hashSync('admin123', 10);
db.prepare(`INSERT OR IGNORE INTO admins (username, email, password_hash, role) VALUES (?,?,?,?)`)
  .run('admin', 'admin@adolphmotors.co.za', adminHash, 'superadmin');
console.log('✅ Admin created  →  username: admin  |  password: admin123');

// Car inventory
const cars = [
  {
    stock_number: 'AP001', vin: 'JTMRJREV0JD127501',
    make: 'Toyota', model: 'Fortuner', variant: '2.8GD-6 4x4 Legend Auto',
    year: 2024, price: 829900, mileage: 15200,
    fuel_type: 'Diesel', transmission: 'Automatic', body_type: 'SUV',
    color: 'Phantom Brown', engine: '2.8L Turbodiesel 4-cyl', doors: 5, seats: 7,
    condition: 'Used', badge: 'Hot Deal',
    description: 'The Toyota Fortuner Legend 2.8GD-6 4x4 is the pinnacle of tough yet refined SUV capability. Perfect for South African roads with exceptional ground clearance and Toyota\'s legendary reliability. Full service history, single owner, non-smoker.',
    features: JSON.stringify(['Leather seats', 'Bi-LED headlights', '360° camera system', 'Apple CarPlay & Android Auto', 'Wireless charging', '9-inch touchscreen', 'Lane departure warning', 'Automatic emergency braking', '7-seater configuration', 'Tow bar', 'Sunroof', 'Power tailgate', 'Cruise control', 'Rear park assist', '18" alloy wheels', 'Rear diff lock']),
    images: JSON.stringify(['/uploads/cars/car-1-1.jpg', '/uploads/cars/car-1-2.jpg', '/uploads/cars/car-1-3.jpg']),
    is_featured: 1,
  },
  {
    stock_number: 'AP002', vin: 'WBAJB9C58KB464631',
    make: 'BMW', model: '3 Series', variant: '320i M Sport Auto',
    year: 2023, price: 849900, mileage: 22000,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan',
    color: 'Alpine White', engine: '2.0L TwinPower Turbo 4-cyl', doors: 4, seats: 5,
    condition: 'Used', badge: 'Premium',
    description: 'Experience the ultimate driving machine with this stunning BMW 320i M Sport. Loaded with M Sport specification including aggressive body kit, sport seats, and iconic BMW driving dynamics. Dealer maintained with full service history.',
    features: JSON.stringify(['M Sport package', 'Harman Kardon sound', 'Heated front seats', 'BMW Live Cockpit Pro', 'Head-up display', 'Park Distance Control front & rear', 'Reversing camera', 'Gesture control', 'Wireless charging', 'Ambient lighting', '19" M Sport alloys', 'Active Driving Assistant', 'Sport brakes', 'Electric sports seats', 'Panoramic sunroof']),
    images: JSON.stringify(['/uploads/cars/car-2-1.jpg', '/uploads/cars/car-2-2.jpg', '/uploads/cars/car-2-3.jpg']),
    is_featured: 1,
  },
  {
    stock_number: 'AP003', vin: 'W1KZF8HB5NA214889',
    make: 'Mercedes-Benz', model: 'C-Class', variant: 'C200 AMG Line Auto',
    year: 2023, price: 919900, mileage: 18000,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan',
    color: 'Selenite Grey', engine: '1.5L EQ Boost MHEV 4-cyl', doors: 4, seats: 5,
    condition: 'Used', badge: 'Luxury',
    description: 'The all-new Mercedes-Benz C-Class sets a new standard in luxury motoring. MBUX hyperscreen-inspired system and AMG Line styling make this the embodiment of elegant performance. Full MBSA service history.',
    features: JSON.stringify(['MBUX Infotainment', 'AMG Line exterior & interior', 'Burmester® surround sound', 'Heated and ventilated seats', 'Head-up display', '360° surround camera', 'Active Lane Keeping Assist', 'Active Blind Spot Assist', 'Traffic Sign Assist', '64-color ambient lighting', '19" AMG alloys', 'Air balance package', 'Memory package', 'Night package', 'Keyless entry']),
    images: JSON.stringify(['/uploads/cars/car-3-1.jpg', '/uploads/cars/car-3-2.jpg', '/uploads/cars/car-3-3.jpg']),
    is_featured: 1,
  },
  {
    stock_number: 'AP004', vin: 'AAVZZZ8P5JA014234',
    make: 'Volkswagen', model: 'Golf', variant: 'GTI 2.0 TSI DSG',
    year: 2024, price: 699900, mileage: 8100,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Hatchback',
    color: 'Tornado Red', engine: '2.0L TSI 4-cyl', doors: 5, seats: 5,
    condition: 'Used', badge: 'Sport',
    description: 'The Volkswagen Golf GTI continues its legacy as the benchmark hot hatch. This near-new example features the powerful 2.0 TSI paired with the lightning-fast DSG gearbox. Almost factory fresh with minimal mileage.',
    features: JSON.stringify(['Performance Pack', 'Vienna leather seats', 'Harman Kardon sound', 'Digital Cockpit Pro', 'IQ.DRIVE', 'Front Assist', 'Lane Assist', 'Wireless CarPlay & Android Auto', 'Wireless charging', 'LED matrix headlights', '18" Pretoria alloys', 'Electronic diff lock', 'DCC adaptive suspension', 'Keyless entry & go']),
    images: JSON.stringify(['/uploads/cars/car-4-1.jpg', '/uploads/cars/car-4-2.jpg', '/uploads/cars/car-4-3.jpg']),
    is_featured: 1,
  },
  {
    stock_number: 'AP005', vin: 'MAHBK2BA4JM201847',
    make: 'Ford', model: 'Ranger', variant: '3.0D V6 Wildtrak 4x4 Auto',
    year: 2024, price: 769900, mileage: 11000,
    fuel_type: 'Diesel', transmission: 'Automatic', body_type: 'Bakkie',
    color: 'Meteor Grey', engine: '3.0L V6 TDCi', doors: 4, seats: 5,
    condition: 'Used', badge: 'Adventure',
    description: 'The all-new Ford Ranger 3.0L V6 Wildtrak is the pinnacle of pickup truck performance and luxury. With its powerful V6 engine and Wildtrak-specific features, this is the ultimate workhorse that doubles as a luxurious family vehicle.',
    features: JSON.stringify(['3.0L V6 engine', 'Wildtrak specification', '10-speed automatic', 'Ford Co-Pilot360', 'SYNC 4 with 12" screen', 'B&O Sound System', '360° camera', 'Wireless charging', 'Adaptive cruise control', 'Pro Trailer Backup Assist', 'Roll-N-Lock bed cover', 'Spray-in bedliner', '18" machine-faced alloys', 'Heated front seats', 'FordPass Connect']),
    images: JSON.stringify(['/uploads/cars/car-5-1.jpg', '/uploads/cars/car-5-2.jpg', '/uploads/cars/car-5-3.jpg']),
    is_featured: 1,
  },
  {
    
  param($m)
  $m -replace "JSON\.stringify\(\[([^\]]+)\]\)", "JSON.stringify(['/uploads/cars/car-6-1.jpg', '/uploads/cars/car-6-2.jpg', '/uploads/cars/car-6-3.jpg'])"
,
    is_featured: 0,
  },
  {
    stock_number: 'AP007', vin: 'KMHC81LCXKU253792',
    make: 'Hyundai', model: 'Tucson', variant: '2.0 Elite Auto',
    year: 2023, price: 519900, mileage: 32000,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'SUV',
    color: 'Dark Knight', engine: '2.0L Smartstream 4-cyl', doors: 5, seats: 5,
    condition: 'Used', badge: null,
    description: 'The Hyundai Tucson Elite is a stunning family SUV combining bold design with cutting-edge technology. Full complement of safety systems and infotainment options make it the smart family choice with excellent running costs.',
    features: JSON.stringify(['10.25" touchscreen', 'Apple CarPlay & Android Auto', 'Wireless charging', 'Blind-spot collision warning', 'Rear cross-traffic collision warning', 'Smart cruise control', 'Lane Keeping Assist', 'Driver Attention Warning', 'High beam assist', 'Powered tailgate', '18" alloy wheels', 'Panoramic sunroof', 'Leatherette seats', 'Dual-zone climate control']),
    images: JSON.stringify(['/uploads/cars/car-7-1.jpg', '/uploads/cars/car-7-2.jpg', '/uploads/cars/car-7-3.jpg']),
    is_featured: 0,
  },
  {
    stock_number: 'AP008', vin: 'KNDJP3A52J7574029',
    make: 'Kia', model: 'Sportage', variant: '1.6T GT Line AWD',
    year: 2024, price: 559900, mileage: 9100,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'SUV',
    color: 'Aurora Black', engine: '1.6L T-GDi 4-cyl', doors: 5, seats: 5,
    condition: 'Used', badge: 'New Arrival',
    description: 'The new-generation Kia Sportage GT Line brings a revolutionary design language to the compact SUV segment. Nearly new with factory warranty remaining, this is the perfect blend of sporty style and practical family capability.',
    features: JSON.stringify(['GT Line specification', 'AWD system', 'Panoramic curved dual 12.3" display', 'Bose premium sound', 'Wireless CarPlay & Android Auto', 'Wireless charging', 'Full LED with animated DRL', 'Heated and ventilated front seats', 'Heated rear seats', 'Smart power tailgate', '19" diamond-cut alloys', 'Full ADAS suite', 'Blind-spot collision avoidance']),
    images: JSON.stringify(['/uploads/cars/car-8-1.jpg', '/uploads/cars/car-8-2.jpg', '/uploads/cars/car-8-3.jpg']),
    is_featured: 0,
  },
  {
    stock_number: 'AP009', vin: 'SALLMAJ47JA266234',
    make: 'Land Rover', model: 'Discovery Sport', variant: 'D180 R-Dynamic SE',
    year: 2023, price: 1089900, mileage: 28000,
    fuel_type: 'Diesel', transmission: 'Automatic', body_type: 'SUV',
    color: 'Hakuba Silver', engine: '2.0L Ingenium Diesel 4-cyl', doors: 5, seats: 7,
    condition: 'Used', badge: 'Premium',
    description: 'The Land Rover Discovery Sport R-Dynamic SE combines British luxury with legendary off-road capability. Stunning R-Dynamic styling with Terrain Response 2 and the full complement of Land Rover\'s advanced driver assistance systems.',
    features: JSON.stringify(['R-Dynamic specification', 'Pivi Pro 11.4" touchscreen', 'Meridian sound system', 'Terrain Response 2', 'ClearSight 360° camera', '3D Surround Camera', 'Head-up display', 'Wireless CarPlay & Android Auto', 'Adaptive Dynamics', 'Wade sensing', 'Heated and cooled front seats', '19" alloy wheels', '7-seat configuration', 'Power tailgate']),
    images: JSON.stringify(['/uploads/cars/car-9-1.jpg', '/uploads/cars/car-9-2.jpg', '/uploads/cars/car-9-3.jpg']),
    is_featured: 1,
  },
  {
    stock_number: 'AP010', vin: 'MALTBMK47PG123456',
    make: 'Toyota', model: 'Corolla Cross', variant: '1.8 XR Hybrid CVT',
    year: 2024, price: 489900, mileage: 5100,
    fuel_type: 'Hybrid', transmission: 'Automatic', body_type: 'SUV',
    color: 'Pearl White', engine: '1.8L Hybrid', doors: 5, seats: 5,
    condition: 'Used', badge: 'Eco',
    description: 'The Toyota Corolla Cross Hybrid XR is the eco-conscious choice without compromise. Toyota\'s proven hybrid technology delivers exceptional fuel efficiency (under 5L/100km) while the factory warranty is still in full effect.',
    features: JSON.stringify(['Toyota Hybrid System II', 'Toyota Safety Sense 3.0', '8" Multimedia touchscreen', 'Apple CarPlay & Android Auto', 'Lane Trace Assist', 'Pre-collision system', 'Adaptive cruise control', 'Automatic high beam', 'Wireless charging', '17" alloy wheels', 'Rear cross-traffic alert', 'Blind spot monitoring', 'LED headlights', 'Dual-zone climate control', 'Rear camera']),
    images: JSON.stringify(['/uploads/cars/car-10-1.jpg', '/uploads/cars/car-10-2.jpg', '/uploads/cars/car-10-3.jpg']),
    is_featured: 0,
  },
  {
    stock_number: 'AP011', vin: 'VNKKTUD37NA012345',
    make: 'Toyota', model: 'Hilux', variant: '2.8 GD-6 Raider 4x4 Auto',
    year: 2023, price: 699900, mileage: 41000,
    fuel_type: 'Diesel', transmission: 'Automatic', body_type: 'Bakkie',
    color: 'Cool Grey', engine: '2.8L GD-6 Turbodiesel 4-cyl', doors: 4, seats: 5,
    condition: 'Used', badge: null,
    description: 'The Toyota Hilux Raider 4x4 remains Africa\'s most popular bakkie for good reason. This dealer-maintained example has full service history and is ready to tackle anything from city commuting to serious off-road adventures.',
    features: JSON.stringify(['Raider specification', '7" touchscreen', 'Apple CarPlay & Android Auto', 'Reverse camera', 'Front & rear park distance', 'Cruise control', 'Leather seats', 'Rear diff lock', 'Trailer brake controller', '17" alloy wheels', 'LED headlights', 'Keyless entry', 'Tow bar', 'Nudge bar', 'Roller shutter']),
    images: JSON.stringify(['/uploads/cars/car-11-1.jpg', '/uploads/cars/car-11-2.jpg', '/uploads/cars/car-11-3.jpg']),
    is_featured: 0,
  },
  {
    stock_number: 'AP012', vin: 'WVGZZZ5NZLW654321',
    make: 'Volkswagen', model: 'Tiguan', variant: '1.4 TSI Elegance DSG',
    year: 2023, price: 629900, mileage: 19000,
    fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'SUV',
    color: 'Atlantic Blue', engine: '1.4L TSI 4-cyl', doors: 5, seats: 5,
    condition: 'Used', badge: null,
    description: 'The Volkswagen Tiguan Elegance offers the perfect balance of luxury, practicality, and efficiency. Fully-loaded Elegance variant features every premium option including panoramic sunroof and full driver assistance suite.',
    features: JSON.stringify(['Elegance specification', 'Digital Cockpit Pro', '10" Discover Media navigation', 'Dynaudio sound system', 'LED matrix headlights', 'IQ.LIGHT cornering', 'Area View 360°', 'Ergo Active seats', 'Ambient lighting', 'Wireless CarPlay', 'Wireless charging', 'Panoramic sunroof', '20" Rioja alloys', 'Park Pilot', 'Keyless entry']),
    images: JSON.stringify(['/uploads/cars/car-12-1.jpg', '/uploads/cars/car-12-2.jpg', '/uploads/cars/car-12-3.jpg']),
    is_featured: 0,
  },
];

const insertCar = db.prepare(`
  INSERT OR IGNORE INTO cars (
    stock_number, vin, make, model, variant, year, price, mileage,
    fuel_type, transmission, body_type, color, engine, doors, seats,
    condition, badge, description, features, images, is_featured
  ) VALUES (
    @stock_number, @vin, @make, @model, @variant, @year, @price, @mileage,
    @fuel_type, @transmission, @body_type, @color, @engine, @doors, @seats,
    @condition, @badge, @description, @features, @images, @is_featured
  )
`);

const seedCars = db.transaction((cars) => {
  for (const car of cars) insertCar.run(car);
});

seedCars(cars);
console.log(`✅ ${cars.length} cars added to inventory`);
console.log('\n✨ Seeding complete! Run: npm run dev');
