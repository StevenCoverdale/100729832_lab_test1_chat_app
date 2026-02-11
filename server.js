const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./config/db');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');
const User = require('./models/User');

const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));
app.use('/views', express.static('views'));
// Basic test route
app.get('/', (req, res) => {
  res.send('Chat app backend is running');
});

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      firstname,
      lastname,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Room List
app.get('/rooms', (req, res) => {
  const rooms = ['devops', 'cloud computing', 'covid19', 'sports', 'nodeJS'];
  res.json(rooms);
});

app.get('/messages/:room', async (req, res) => {
  try {
    const room = req.params.room;
    const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error loading messages' });
  }
});

// Socket setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Leave room
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  // Group message
  socket.on('groupMessage', async (data) => {
    const { from_user, room, message } = data;

    const newMsg = new GroupMessage({
      from_user,
      room,
      message
    });

    await newMsg.save();

    io.to(room).emit('groupMessage', newMsg);
  });
 // Private message
  socket.on('privateMessage', async (data) => {
    const { from_user, to_user, message } = data;

    const newMsg = new PrivateMessage({
      from_user,
      to_user,
      message
    });

    await newMsg.save();

    io.emit(`privateMessage:${to_user}`, newMsg);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { room, username } = data;
    socket.to(room).emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});



// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});