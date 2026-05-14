// ─── Database Configuration ───────────────────────────────────────────────────
// Connects to PostgreSQL using Sequelize ORM.
// On macOS Homebrew, PostgreSQL data is typically under:
//   /usr/local/var/postgresql@<version> or /opt/homebrew/var/postgresql@<version>
// To access DB from terminal: psql -U <db_user> -d smartmedi_db
// To access with GUI: TablePlus or pgAdmin → host: localhost, port: 5432
// All credentials are read from .env file

const { Sequelize } = require('sequelize');

// ── Create Sequelize instance with PostgreSQL dialect ──
const sequelize = new Sequelize(
  process.env.DB_NAME || 'smartmedi_db',    // database name
  process.env.DB_USER || 'mahmudulhasan',    // PostgreSQL username
  process.env.DB_PASSWORD || 'mahmudul010@maruf', // PostgreSQL password
  {
    host: process.env.DB_HOST || 'localhost', // DB server host
    port: parseInt(process.env.DB_PORT) || 5432, // DB port
    dialect: 'postgres',                      // Use PostgreSQL
    logging: false,                           // Disable SQL query logging in console
    pool: {
      max: 10,          // Maximum number of connections in pool
      min: 0,           // Minimum number of connections in pool
      acquire: 30000,   // Max time (ms) to get connection before throwing error
      idle: 10000,      // Time (ms) before idle connection is released
    },
    define: {
      underscored: false,    // Use camelCase column names
      timestamps: true,      // Auto-add createdAt and updatedAt columns
      freezeTableName: false, // Pluralize table names automatically
    },
  }
);

module.exports = sequelize;
