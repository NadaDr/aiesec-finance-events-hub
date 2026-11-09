// server/config/db.js
// Configuration and connection to MongoDB Atlas database using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Atlas Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Error connecting to MongoDB: ${error.message}`);
    console.error('[MongoDB] If you are using your own cluster, please ensure 0.0.0.0/0 is added to Network Access in Atlas.');
    process.exit(1);
  }
};

module.exports = connectDB;
