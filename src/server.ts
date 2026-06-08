// ===========================================
// Trodat Shop Backend - Entry Point
// ===========================================

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initTelegramBot } from './lib/telegram';

initTelegramBot();

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     🏭 Trodat Shop API Server           ║
║     Running on http://localhost:${PORT}/api-docs     ║
║     Environment: ${process.env.NODE_ENV || 'development'}        ║
╚══════════════════════════════════════════╝
  `);
});
