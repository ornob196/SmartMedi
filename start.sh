#!/bin/bash

# ╔══════════════════════════════════════════════════════════════╗
# ║           SMARTMEDI — Full Project Startup Script           ║
# ║         Run this once to start everything at once           ║
# ╚══════════════════════════════════════════════════════════════╝

echo ""
echo "🏥  Starting SMARTMEDI Healthcare Platform..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: Start PostgreSQL (Homebrew) ─────────────────────────
echo "🗄️  Starting PostgreSQL..."
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
brew services start postgresql@16 2>/dev/null || pg_ctl -D /opt/homebrew/var/postgresql@16 start 2>/dev/null
sleep 2

# ── Step 2: Kill any old processes on our ports ─────────────────
echo "🧹  Cleaning up old processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1
echo "✅  Ports 5001 & 5173 → Free"


# ── Step 2: Start Backend + Frontend together ────────────────────
echo "🚀  Starting Backend (port 5001) + Frontend (port 5173)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   🌐  App URL    → http://localhost:5173"
echo "   🔌  API URL    → http://localhost:5001"
echo "   👤  Admin      → admin@smartmedi.com / admin123"
echo ""
echo "   Press Ctrl+C to stop all servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run both in parallel
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "bgBlue.bold,bgGreen.bold" \
  --kill-others-on-fail \
  "cd backend && node server.js" \
  "cd frontend && npm run dev"
