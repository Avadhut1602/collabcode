// server/config/db.js
// Resilient MongoDB connection with automatic embedded in-memory fallback
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let mongodInstance = null;
let isReady = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/coding_platform';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback seamlessly if local daemon isn't running
    });
    console.log(`[MongoDB] Connected to external MongoDB instance: ${conn.connection.host}`);
    isReady = true;
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to configured MongoDB (${uri}): ${err.message}`);
    console.log('[MongoDB] Starting embedded MongoDB memory server fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Embedded in-memory MongoDB connected successfully at ${memoryUri}`);

      // Seed initial data into memory server
      try {
        const seedScript = require('../seed');
        if (typeof seedScript.seedData === 'function') {
          await seedScript.seedData();
          console.log('[MongoDB] In-memory database seeded with default demo accounts and rooms.');
        }
      } catch (seedErr) {
        console.error('[MongoDB] Seeding error:', seedErr.message);
      }

      isReady = true;
      return conn;
    } catch (fallbackErr) {
      console.error('[MongoDB] Warning: Failed to start embedded MongoDB fallback:', fallbackErr.message);
      console.log('[MongoDB] CollabCode server will continue running. You can set MONGO_URI in Render environment variables for persistent cloud MongoDB Atlas.');
      isReady = false;
      return null;
    }
  }
};

connectDB.isReady = () => isReady;

process.on('SIGINT', async () => {
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
