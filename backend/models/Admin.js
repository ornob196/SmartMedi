// ─── Admin Model (PostgreSQL / Sequelize) ─────────────────────────────────────
// Table: Admins
// Admin accounts for the SMARTMEDI admin panel.
// Admins can: approve/reject doctor registrations, manage users, view system stats.
// Default admin: seeded via scripts/seedAdmin.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  // ── Primary Key ────────────────────────────────────────────────────────────
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Personal Info ──────────────────────────────────────────────────────────
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // ── Role (always 'admin') ─────────────────────────────────────────────────
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'admin',
  },
}, {
  tableName: 'admins',
  timestamps: true,     // creates createdAt + updatedAt columns
  hooks: {
    // ── Hash password before creating/updating ──
    beforeSave: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await bcrypt.hash(admin.password, 12);
      }
    },
  },
});

// ── Instance method: compare password ──
Admin.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Admin;
