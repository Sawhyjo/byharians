const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const groceryRoutes = require('./routes/groceries');
const packageRoutes = require('./routes/packages');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/packages', packageRoutes);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BYHARIANS Eco-Commerce API Engine',
    timestamp: new Date().toISOString(),
    backend: 'Node.js Express + Supabase'
  });
});

// Fallback Route for Single Page App (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server with Graceful Port Fallback
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌿 BYHARIANS Express Backend Server Live at http://localhost:${PORT}`);
  console.log(`📱 Frontend Hosted at http://localhost:${PORT}`);
  console.log(`⚡ API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    console.log(`⚠️ Port ${PORT} sedang terpakai oleh proses server sebelumnya.`);
    console.log(`🔄 Mengalihkan server secara otomatis ke Port 8081...`);
    const fallbackServer = app.listen(8081, () => {
      console.log(`====================================================`);
      console.log(`🌿 BYHARIANS Express Backend Server Live at http://localhost:8081`);
      console.log(`📱 Frontend Hosted at http://localhost:8081`);
      console.log(`⚡ API Health Check: http://localhost:8081/api/health`);
      console.log(`====================================================`);
    });
  } else {
    console.error('Server error:', err);
  }
});
