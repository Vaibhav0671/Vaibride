const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Models ───────────────────────────────────────────────────────────────────

const carSchema = new mongoose.Schema({
  name: String,
  type: String,
  seats: Number,
  transmission: String,
  fuel: String,
  pricePerDay: Number,
  available: { type: Boolean, default: true },
  emoji: String,
  features: [String]
});

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  pickupLocation: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  totalDays: Number,
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// ─── Seed Cars ────────────────────────────────────────────────────────────────

async function seedCars() {
  const count = await Car.countDocuments();
  if (count > 0) return;
  await Car.insertMany([
    {
      name: 'Maruti Swift',
      type: 'Hatchback', seats: 5, transmission: 'Manual', fuel: 'Petrol',
      pricePerDay: 1199, emoji: '🚗',
      features: ['AC', 'Music System', 'Power Steering']
    },
    {
      name: 'Maruti Dzire',
      type: 'Sedan', seats: 5, transmission: 'Manual', fuel: 'Petrol',
      pricePerDay: 1399, emoji: '🚘',
      features: ['AC', 'Music System', 'Power Windows']
    },
    {
      name: 'Honda City',
      type: 'Sedan', seats: 5, transmission: 'Automatic', fuel: 'Petrol',
      pricePerDay: 1899, emoji: '🚘',
      features: ['AC', 'Sunroof', 'Reverse Camera', 'Cruise Control']
    },
    {
      name: 'Hyundai Creta',
      type: 'SUV', seats: 5, transmission: 'Automatic', fuel: 'Diesel',
      pricePerDay: 2499, emoji: '🚙',
      features: ['AC', 'Panoramic Sunroof', 'GPS', 'Reverse Camera']
    },
    {
      name: 'Kia Seltos',
      type: 'SUV', seats: 5, transmission: 'Automatic', fuel: 'Petrol',
      pricePerDay: 2699, emoji: '🚙',
      features: ['AC', 'Sunroof', 'Ventilated Seats', 'Wireless Charging']
    },
    {
      name: 'Toyota Innova Crysta',
      type: 'MPV', seats: 7, transmission: 'Manual', fuel: 'Diesel',
      pricePerDay: 3199, emoji: '🚐',
      features: ['AC', '7 Seats', 'Captain Seats', 'Large Boot']
    },
    {
      name: 'Toyota Fortuner',
      type: 'SUV', seats: 7, transmission: 'Automatic', fuel: 'Diesel',
      pricePerDay: 4999, emoji: '🏎️',
      features: ['AC', '4WD', 'Leather Seats', 'Sunroof', 'GPS']
    },
    {
      name: 'Mahindra Scorpio N',
      type: 'SUV', seats: 7, transmission: 'Manual', fuel: 'Diesel',
      pricePerDay: 2999, emoji: '🚙',
      features: ['AC', '7 Seats', 'Rugged Build', 'Music System']
    }
  ]);
  console.log('Vaibride cars seeded successfully.');
}

// ─── API Routes ───────────────────────────────────────────────────────────────

app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find({ available: true }).sort({ pricePerDay: 1 });
    res.json(cars);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { customerName, phone, email, carId, pickupLocation, pickupDate, returnDate } = req.body;

    if (!customerName || !phone || !email || !carId || !pickupLocation || !pickupDate || !returnDate)
      return res.status(400).json({ error: 'All fields are required.' });

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: 'Car not found.' });

    const p = new Date(pickupDate), r = new Date(returnDate);
    if (r <= p) return res.status(400).json({ error: 'Return date must be after pickup date.' });

    const conflict = await Booking.findOne({
      carId, status: { $ne: 'cancelled' },
      pickupDate: { $lt: r }, returnDate: { $gt: p }
    });
    if (conflict) return res.status(400).json({ error: 'This car is already booked for the selected dates. Please choose different dates or another car.' });

    const totalDays = Math.ceil((r - p) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * car.pricePerDay;

    const booking = await Booking.create({
      customerName, phone, email, carId,
      pickupLocation, pickupDate: p, returnDate: r,
      totalDays, totalAmount
    });

    await booking.populate('carId', 'name emoji pricePerDay');
    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — view all bookings
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('carId', 'name emoji type pricePerDay')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — update booking status
app.patch('/api/admin/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    ).populate('carId', 'name');
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vaibride';

mongoose.connect(MONGO_URI)
  .then(async () => {
    await seedCars();
    app.listen(PORT, () => console.log(`\n🚗 Vaibride running at http://localhost:${PORT}\n`));
  })
  .catch(err => console.error('MongoDB error:', err));
