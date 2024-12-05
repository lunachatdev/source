const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
 
// Enable CORS for the HTTP part
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST'],       // Allow specific methods
  allowedHeaders: ['Content-Type'],
}));

// Create an HTTP server with Express
const server = http.createServer(app);

// Setup socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Connect to MongoDB once when the application starts
mongoose.connect('mongodb://localhost:27017/lc_users')
  .then(() => console.log('Connected to primary MongoDB'))
  .catch((err) => console.error('Primary MongoDB connection error:', err));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chats', async (data) => {
    try {
      const modelNameReceiving = data.reciver;
      const modelNameSending = data.sender;
  
      // Check if model already exists, otherwise define it
      const ReceivingModel = mongoose.models[modelNameReceiving] || mongoose.model(
        modelNameReceiving,
        new mongoose.Schema({
          usr: String,
          body: String,
          sends: Boolean,
          seen: Boolean,
          created: String,
          receiving: Object,
        })
      );
  
      const receivingData = new ReceivingModel({
        receiving: {
          usr: data.sender,
          body: data.body,
          sends: true,
          seen: data.seen,
          created: data.created,
        },
      });
  
      await receivingData.save();
  
      // Check if model already exists, otherwise define it
      const SendingModel = mongoose.models[modelNameSending] || mongoose.model(
        modelNameSending,
        new mongoose.Schema({
          usr: String,
          body: String,
          sends: Boolean,
          seen: Boolean,
          created: String,
          sents: Object,
        })
      );
  
      const sendingData = new SendingModel({
        sents: {
          usr: data.sender,
          body: data.body,
          sends: true,
          seen: data.seen,
          created: data.created,
        },
      });
  
      await sendingData.save();
  
      console.log('Data saved successfully for both models.');
      io.emit('processCompleted', { user: data.sender });
  
    } catch (err) {
      console.error('Error saving data:', err);
      socket.emit('error', { message: 'Error saving data.' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Schema and Model
const UserSchema = new mongoose.Schema({
  usr: String,
  body: String,
  sends: Boolean,
  seen: Boolean,
  created: String,
  sents: Object,
  receiving: Object
});

// Route to fetch all documents
app.get('/api/users/:usr', async (req, res) => {
  const User = mongoose.model(req.params.usr, UserSchema);
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

const secondaryDb = mongoose.createConnection('mongodb://localhost:27017/ic_users_datas');

// Define a schema for the secondary database
const secondarySchema = new mongoose.Schema({
  usr: String,
  body: String,
  sends: Boolean,
  seen: Boolean,
  created: String,
  sents: Object,
  receiving: Object,
});

// Create a model associated with the secondary database connection
const SecondaryModel = secondaryDb.model('mathi', secondarySchema);

app.get('/api/secondary-users', async (req, res) => {
  try {
    // Use the model associated with the secondary database
    const users = await SecondaryModel.find(); // SecondaryModel is already defined above
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users from secondary DB', error: err });
  }
});

// Start the server
server.listen(1200, () => {
  console.log('Server running on http://localhost:1200');
});
