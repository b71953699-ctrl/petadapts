require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const adopterRoutes = require('./routes/adopter');
const petRoutes = require('./routes/pets');
const adoptionRoutes = require('./routes/adoption');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to allow inline scripts
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML files
app.use(express.static('.'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/adopter', adopterRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    app.listen(PORT, () => {
      console.log(`🐾 Pet Adoption System running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.log('Starting server without database connection...');
    app.listen(PORT, () => {
      console.log(`🐾 Pet Adoption System running on port ${PORT} (DB not connected)`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  }
}

startServer();

module.exports = app;