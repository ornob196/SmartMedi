// ─── Doctor Model (PostgreSQL / Sequelize) ────────────────────────────────────
// Table: Doctors
// Stores all registered doctor accounts.
// NEW fields: profilePhoto, googleId, isApproved, bio, qualifications, hospital.
// Doctors MUST be approved by Admin before they can login.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Doctor = sequelize.define('Doctor', {
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
    validate: { min: 1, max: 100 },
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
  // Stores Google sub ID when doctor signs up via Google
  googleId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },

  // ── Profile Photo ──────────────────────────────────────────────────────────
  // Relative URL path: /uploads/profiles/filename.jpg
  profilePhoto: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },

  // ── Medical/Professional Info ──────────────────────────────────────────────
  specialty: {
    type: DataTypes.STRING(100),
    defaultValue: 'General Physician',
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5,
    validate: { min: 0, max: 5 },
  },
  consultationFee: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
  },
  availability: {
    type: DataTypes.STRING(100),
    defaultValue: 'Available Today',
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  qualifications: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  hospital: {
    type: DataTypes.STRING(200),
    defaultValue: '',
  },

  // ── Admin Approval ─────────────────────────────────────────────────────────
  // isApproved: must be true before doctor can login
  // Admin sets this via the Admin Panel
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'doctors',
  timestamps: true,
  hooks: {
    // ── Hash password before save if modified ──
    beforeSave: async (doctor) => {
      if (doctor.changed('password') && doctor.password) {
        doctor.password = await bcrypt.hash(doctor.password, 12);
      }
    },
  },
});

// ── Instance method: compare entered password with hashed DB password ──
Doctor.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Doctor;
