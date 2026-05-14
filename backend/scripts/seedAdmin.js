// ─── Seed Admin Script ────────────────────────────────────────────────────────
// Run: node scripts/seedAdmin.js
// Creates default admin account in PostgreSQL.
// Default credentials: admin@smartmedi.com / admin123
// CHANGE PASSWORD after first login!

require('dotenv').config({ path: '../.env' });
const { sequelize, Admin } = require('../models');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    await sequelize.sync({ alter: true });

    const existing = await Admin.findOne({ where: { email: 'admin@smartmedi.com' } });
    if (existing) {
      console.log('ℹ️  Admin account already exists: admin@smartmedi.com');
    } else {
      await Admin.create({
        name: 'SMARTMEDI Admin',
        email: 'admin@smartmedi.com',
        password: 'admin123',  // ← CHANGE THIS AFTER FIRST LOGIN!
      });
      console.log('✅ Admin account created!');
      console.log('   Email: admin@smartmedi.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
