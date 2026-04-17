<<<<<<< HEAD
# AgroSense – AWD Intelligence Dashboard Backend

This is the production-ready backend API system for the AgroSense platform, designed to simulate AWD detection, fetch weather data, compute methane savings via the IPCC model, and generate PDF compliance certificates.

## Tech Stack
- **Node.js + Express.js**
- **PostgreSQL** via Prisma ORM
- **pdfkit** for certificate generation
- **Axios** for OpenWeather API integration

## Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file (copy from `.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/agrosense?schema=public"
   OPENWEATHER_API_KEY="your_openweather_api_key_here"
   ```

3. Run Prisma Migrations:
   ```bash
   npx prisma db push
   ```
   *(Ensure you have a PostgreSQL database running and configured in `DATABASE_URL`)*

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. `POST /api/farm/analyze`
Submits farm data, runs AWD and methane detection engines, and returns a `farmId`.
- **Body:** `{ "lat": 28.7041, "lng": 77.1025, "state": "Delhi", "district": "New Delhi", "area": 5.5 }`

### 2. `GET /api/results/:farmId`
Returns full dashboard-ready JSON (Recharts compatible) containing analysis data, graphs, and methane savings.

### 3. `GET /api/certificate/:farmId`
Downloads a generated PDF certificate for the farm's compliance.

## Deployment on Railway / Render

This project is configured out-of-the-box for cloud platforms like Railway or Render.

1. **Connect Repository:** Link your GitHub repo to Railway/Render.
2. **Add PostgreSQL:** Provision a PostgreSQL database add-on and link it to the backend service.
3. **Environment Variables:** Set your `DATABASE_URL` and `OPENWEATHER_API_KEY` in the platform dashboard.
4. **Build & Start Commands:**
   - The platform will automatically run `npm install` and the `postinstall` hook (`prisma generate`).
   - Start Command is automatically read from `npm start` (`node src/app.js`).
5. **Database Push:** Make sure to run `npx prisma db push` once connected to your production DB to initialize the tables.
=======
# binary-brains-SBK-F20_SKB-P4
hackathon
team name- binary brains 
problem statement - SKB_P4. Stochastic Multi Modal Fusion for "Cloud Proof" dMRV 
and Methane Aware Carbon Governance
>>>>>>> c78de70a76efae9e445e42b8d6c5a44c29673e5f
