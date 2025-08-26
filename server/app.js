const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const tripsRoutes = require('./routes/trips');
const generateRoutes = require('./routes/generate');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/trips', tripsRoutes);
app.use('/api/generate-trip', generateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', require('./routes/test'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;
