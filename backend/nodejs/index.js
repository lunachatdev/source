const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketRoutes = require('./routes/socket_route'); // Import the socketRoutes module

const app = express();

PORT = 3000

// Enable CORS for the HTTP part
app.use(cors({
  origin: `https://67602dc432b0a03f5a4c218f--frolicking-heliotrope-4d6cff.netlify.app/`, // Your frontend URL
  methods: ['GET', 'POST'],       // Allow specific methods
  allowedHeaders: ['Content-Type'],
}));

// Create an HTTP server with Express
const server = http.createServer(app);

// Use the socketRoutes to handle Socket.io functionality
socketRoutes(server);

// Start the server
server.listen(1200, () => {
  console.log('Server running on http://localhost:1200');
});
