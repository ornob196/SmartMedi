// ─── Message Model (PostgreSQL / Sequelize) ───────────────────────────────────
// Table: Messages
// Stores chat messages between doctors and patients.
// roomId format: "{smallerId}_{largerId}" (sorted UUIDs for consistency)
// Used by Socket.IO real-time chat system.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  // ── Primary Key ────────────────────────────────────────────────────────────
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Room (conversation identifier) ────────────────────────────────────────
  // roomId = doctorId + "_" + patientId (alphabetically sorted)
  roomId: {
    type: DataTypes.STRING(200),
    allowNull: false,
    // Indexed for fast lookup of conversation history
  },

  // ── Sender Info ────────────────────────────────────────────────────────────
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  senderRole: {
    type: DataTypes.ENUM('doctor', 'patient'),
    allowNull: false,
  },
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  // ── Receiver ───────────────────────────────────────────────────────────────
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // ── Message Content ────────────────────────────────────────────────────────
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // ── Read Status ────────────────────────────────────────────────────────────
  // false = unread (shown as notification badge)
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    // ── Index on roomId for fast chat history lookup ──
    { fields: ['roomId'] },
  ],
});

module.exports = Message;
