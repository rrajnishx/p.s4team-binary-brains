require('dotenv').config();
const express = require('express');
const cors = require('cors');

const farmRoutes = require('./routes/farmRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/farm', farmRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/certificate', certificateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AgroSense Backend Running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
