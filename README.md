# Vaibride Car Rental Website

**Business:** Vaibride Car Rental  
**Location:** Hadapsar, Pune, Maharashtra  
**Phone:** +91 98505 89787  
**Email:** vaibhavmarewar952@gmail.com

---

## Run Locally

```bash
npm install
cp .env.example .env
# Add your MongoDB URI in .env
npm run dev
# Open http://localhost:3000
```

---

## Deploy on Render.com (Free — Step by Step)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Vaibride website"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/vaibride.git
git push -u origin main
```

### Step 2 — Free MongoDB at mongodb.com/cloud/atlas
1. Sign up → Create free cluster
2. Click Connect → Drivers → copy connection string
3. Replace `<password>` with your password

### Step 3 — Deploy on render.com
1. Sign up at render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
4. Environment Variables → Add:
   - `MONGO_URI` = your MongoDB connection string
5. Click Deploy

Your site goes live at: `https://vaibride.onrender.com` (or similar)

---

## View All Bookings (Admin)
Visit: `https://your-site.onrender.com/api/admin/bookings`

This shows all bookings as JSON with customer name, phone, email, car, dates, and total amount.

---

## Cars Included
1. Maruti Swift — ₹1,199/day
2. Maruti Dzire — ₹1,399/day
3. Honda City — ₹1,899/day
4. Hyundai Creta — ₹2,499/day
5. Kia Seltos — ₹2,699/day
6. Mahindra Scorpio N — ₹2,999/day
7. Toyota Innova Crysta — ₹3,199/day
8. Toyota Fortuner — ₹4,999/day
