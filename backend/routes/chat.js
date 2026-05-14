// ─── Chat Routes (PostgreSQL / Sequelize) ─────────────────────────────────────
// REST API for chat history (real-time is handled via Socket.IO in server.js).
// GET /api/chat/:partnerId → get message history with a specific user
// GET /api/chat → get list of unique conversation partners

const express = require('express');
const { Op } = require('sequelize');
const { Message, Doctor, Patient } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Helper: generate consistent room ID ──────────────────────────────────────
// Room ID = two user IDs sorted alphabetically and joined with "_"
const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/:partnerId
// Get chat history with a specific partner (doctor ↔ patient)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:partnerId', protect, async (req, res) => {
  try {
    const roomId = getRoomId(req.user.id, req.params.partnerId);
    const messages = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']],
      limit: 100, // Last 100 messages
    });

    // Mark messages from partner as read
    await Message.update(
      { read: true },
      { where: { roomId, receiverId: req.user.id, read: false } }
    );

    res.json({ success: true, messages, roomId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat
// Get list of all conversation partners for current user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Find all messages involving this user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
      attributes: ['roomId', 'senderId', 'receiverId', 'senderName', 'senderRole', 'content', 'read', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    // Build unique conversations
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      if (!seen.has(partnerId.toString())) {
        seen.add(partnerId.toString());
        conversations.push({
          partnerId,
          partnerName: msg.senderId === req.user.id ? null : msg.senderName,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          roomId: msg.roomId,
          unread: !msg.read && msg.receiverId === req.user.id,
        });
      }
    }

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
