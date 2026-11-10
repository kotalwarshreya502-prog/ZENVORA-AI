import mongoose from 'mongoose';

let _connectionAttempted = false;

/** @returns {boolean} */
export const isDbConnected = () => mongoose.connection.readyState === 1;

/** @returns {'connected' | 'disconnected'} */
export const getDbStatusString = () => (isDbConnected() ? 'connected' : 'disconnected');

/**
 * Connect to MongoDB Atlas.
 * Uses the MONGO_URI env variable targeting the `zenvora_ai` database.
 * Server stays up even when the database is unreachable.
 */
export const connectDB = async () => {
  if (_connectionAttempted && isDbConnected()) return true;
  _connectionAttempted = true;

  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === '') {
    console.warn('\n⚠️  [Database]: MONGO_URI is not set in backend/.env');
    console.warn('ℹ️  [Database]: Server running in disconnected mode.\n');
    return false;
  }

  if (uri.includes('<') || uri.includes('>')) {
    console.warn('\n⚠️  [Database]: MONGO_URI still contains angle-bracket placeholders (e.g. <password>).');
    console.warn('ℹ️  [Database]: Remove < and > from around the password in backend/.env.\n');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      dbName: 'zenvora_ai',
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log('\n✅ [Database]: MongoDB Atlas connected!');
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);

    // Reconnect gracefully on drop
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  [Database]: Connection lost. Will reconnect automatically.');
    });

    return true;
  } catch (err) {
    console.error(`\n❌ [Database]: Connection failed — ${err.message}`);
    console.warn('ℹ️  [Database]: Server continues in disconnected mode.\n');
    return false;
  }
};
