// ─── Patient Model (PostgreSQL / Sequelize) ───────────────────────────────────
// Table: Patients
// Stores all registered patient accounts.
// NEW fields: profilePhoto, googleId, resetPasswordToken, bloodGroup, address.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Patient = sequelize.define('Patient', {
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
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 120 },
  },
  sex: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
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
    allowNull: true, // null if using Google OAuth
  },

  // ── Google OAuth ───────────────────────────────────────────────────────────
  googleId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },

  // ── Profile Photo ──────────────────────────────────────────────────────────
  // Stored as relative URL: /uploads/profiles/filename.jpg
  profilePhoto: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },

  // ── Password Reset ─────────────────────────────────────────────────────────
  // resetPasswordToken: SHA-256 hashed token sent via email
  // resetPasswordExpires: token expiry (1 hour from generation)
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // ── Additional Health Info ────────────────────────────────────────────────
  bloodGroup: {
    type: DataTypes.STRING(10),
    defaultValue: '',
  },
  address: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'patients',
  timestamps: true,
  hooks: {
    // ── Hash password before save if modified ──
    beforeSave: async (patient) => {
      if (patient.changed('password') && patient.password) {
        patient.password = await bcrypt.hash(patient.password, 12);
      }
    },
  },
});

// ── Instance method: compare entered password with hashed DB password ──
Patient.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Patient;
