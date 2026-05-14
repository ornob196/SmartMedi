// ─── SMARTMEDI Backend Server ──────────────────────────────────────────────────
// Tech: Express.js + PostgreSQL (Sequelize ORM) + Socket.IO (real-time chat)
// Database: PostgreSQL at localhost:5432, database name: smartmedi_db
// Tables auto-created on startup via sequelize.sync({ alter: true })
//
// API Endpoints:
//   POST   /api/auth/*          → authentication (login, signup, Google OAuth)
//   GET    /api/doctors          → list approved doctors
//   GET    /api/patients/me      → patient profile
//   /api/appointments            → appointment CRUD
//   /api/prescriptions           → prescription CRUD + PDF
//   /api/admin/*                → admin panel (doctor approval etc.)
//   /api/chat/*                 → chat history
//   /api/reports/*              → file uploads (PDF, JPG, etc.)
//   /api/ai/*                   → AI analysis
//
// Static Files:
//   /uploads/profiles/*         → profile photos
//   /uploads/reports/*          → patient medical reports
//
// Socket.IO Events:
//   join_room      → join chat room
//   send_message   → send a chat message
//   new_message    → broadcast to room
//   typing         → typing indicator

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, Message } = require('./models');

// ── Import all routes ──────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app); // HTTP server for Socket.IO

// ─── Socket.IO Setup (Real-time Chat) ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

// ─── Socket.IO Event Handlers ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── Join a chat room ──
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`📍 ${socket.id} joined room: ${roomId}`);
  });

  // ── Send a message ──
  socket.on('send_message', async (data) => {
    try {
      const { roomId, senderId, senderRole, senderName, receiverId, content } = data;
      // ── Save message to PostgreSQL ──
      const message = await Message.create({
        roomId, senderId, senderRole, senderName, receiverId, content,
      });
      // ── Broadcast to everyone in the room ──
      io.to(roomId).emit('new_message', message);
    } catch (err) {
      console.error('Message save error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ── Typing indicator ──
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', { name: data.name });
  });

  // ── Stop typing indicator ──
  socket.on('stop_typing', (data) => {
    socket.to(data.roomId).emit('stop_typing');
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Static File Serving ───────────────────────────────────────────────────────
// Serves uploaded files (profile photos + medical reports)
// Access via: http://localhost:5001/uploads/profiles/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);             // Authentication routes
app.use('/api/doctors', doctorRoutes);        // Doctor profile + list
app.use('/api/patients', patientRoutes);      // Patient profile
app.use('/api/appointments', appointmentRoutes); // Appointment booking
app.use('/api/prescriptions', prescriptionRoutes); // Prescriptions
app.use('/api/admin', adminRoutes);           // Admin panel
app.use('/api/chat', chatRoutes);             // Chat history
app.use('/api/reports', reportRoutes);        // Medical report uploads
app.use('/api/ai', aiRoutes);                 // AI analysis

// ─── Health Check ─────────────────────────────────────────────────────────────
// Verify server is running: GET http://localhost:5001/api/health
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏥 SMARTMEDI API is running!',
    version: '3.0.0 (PostgreSQL)',
    database: 'PostgreSQL',
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST + ':' + process.env.DB_PORT,
    uptime: process.uptime() + 's',
  });
});

// ─── Database Info ────────────────────────────────────────────────────────────
// GET /api/db-info → shows where PostgreSQL data is stored on your computer
app.get('/api/db-info', (req, res) => {
  res.json({
    success: true,
    info: {
      database: 'PostgreSQL',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'smartmedi_db',
      user: process.env.DB_USER || 'postgres',
      dataLocation: {
        mac_homebrew: '/usr/local/var/postgresql@<version> or /opt/homebrew/var/postgresql@<version>',
        mac_postgres_app: '~/Library/Application Support/Postgres',
        connect_terminal: `psql -U ${process.env.DB_USER || 'postgres'} -d ${process.env.DB_NAME || 'smartmedi_db'}`,
        gui_tools: 'TablePlus / pgAdmin / DBeaver → connect to localhost:5432',
      },
      uploadsLocation: path.join(__dirname, '../uploads'),
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Connect to PostgreSQL and Start Server ────────────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // ── Test database connection ──
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully!');
    console.log(`   Database: ${process.env.DB_NAME} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    // ── Sync all models to PostgreSQL (creates/alters tables automatically) ──
    // { alter: true } = update existing tables without dropping data
    // To RESET all data: change to { force: true } then change back to { alter: true }
    await sequelize.sync({ alter: true });
    console.log('✅ All PostgreSQL tables synced!');

    // ── Start the HTTP server ──
    server.listen(PORT, () => {
      console.log(`\n🚀 SMARTMEDI Backend running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  DB Info: http://localhost:${PORT}/api/db-info`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads/`);
      console.log(`🔌 Socket.IO: enabled for real-time chat\n`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.error('   Make sure PostgreSQL is running and .env credentials are correct.');
    console.error('   Run: brew services start postgresql@14 (Mac)');
    process.exit(1);
  }
};

startServer();
