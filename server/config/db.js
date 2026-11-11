// server/config/db.js
// Connexion l-MongoDB Atlas b-Mongoose (connect + disconnect ndhif)

const mongoose = require('mongoose');

// Ma ya3melch process.exit : yrmi erreur w server.js yqarrer chnowa ya3mel
const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error("MONGO_URI mehech mawjouda fel .env");
  }

  mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Déconnecté'));
  mongoose.connection.on('reconnected', () => console.log('[MongoDB] Reconnecté'));
  mongoose.connection.on('error', (err) => console.error('[MongoDB] Erreur :', err.message));

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000 // Yfail fissa3 ken Atlas mehouch accessible
    });
    console.log(`[MongoDB] Atlas Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] If you are using your own cluster, please ensure 0.0.0.0/0 is added to Network Access in Atlas.');
    throw error;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB] Connexion msakkra ndhif');
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
