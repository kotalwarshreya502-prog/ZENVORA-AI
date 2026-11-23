import mongoose from 'mongoose';

let _reconnectTimer = null;
let _isConnecting = false;

/** @returns {boolean} */
export const isDbConnected = () => mongoose.connection.readyState === 1;

/** @returns {'connected' | 'disconnected' | 'connecting' | 'disconnecting'} */
export const getDbStatusString = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'disconnected';
};

/**
 * Resolve the connection string from either MONGODB_URI or MONGO_URI
 */
export const getMongoUri = () => {
  return (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
};

/**
 * Connect to MongoDB Atlas with robust connection handling and automatic retry.
 */
export const connectDB = async () => {
  if (isDbConnected()) return true;
  if (_isConnecting) return false;

  const uri = getMongoUri();

  if (!uri) {
    console.warn('\n⚠️  [Database]: Neither MONGODB_URI nor MONGO_URI is configured.');
    console.warn('ℹ️  [Database]: Please set MONGODB_URI in Render dashboard or backend/.env.\n');
    return false;
  }

  if (uri.includes('<') || uri.includes('>')) {
    console.warn('\n⚠️  [Database]: Connection string contains unreplaced angle brackets <password>.');
    console.warn('ℹ️  [Database]: Please replace <password> with your actual Atlas user password.\n');
    return false;
  }

  _isConnecting = true;

  // Safe URI for logging (redacts password)
  const safeUri = uri.replace(/:([^:@]+)@/, ':****@');

  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(uri, {
      dbName: 'zenvora_ai',
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4, // Force IPv4 to avoid IPv6 resolution timeouts on Render/cloud
    });

    console.log('\n=============================================================');
    console.log('✅ [Database]: MongoDB Atlas connected successfully!');
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log('=============================================================\n');

    if (_reconnectTimer) {
      clearInterval(_reconnectTimer);
      _reconnectTimer = null;
    }

    _isConnecting = false;
    return true;
  } catch (err) {
    _isConnecting = false;
    console.error(`\n❌ [Database Connection Failed]: ${err.message}`);
    console.log(`   Target: ${safeUri}`);

    if (err.message.includes('whitelisted') || err.message.includes('Could not connect to any servers')) {
      console.warn('\n🔒 [Atlas IP Access Notice]:');
      console.warn('   MongoDB Atlas rejected this connection because the client IP is not on the IP Access List.');
      console.warn('   👉 Action: Log into cloud.mongodb.com -> Network Access -> Add IP Address: 0.0.0.0/0 (or Render outbound IPs)');
      console.warn('   👉 Once added, this backend will auto-connect without requiring a restart.\n');
    }

    // Schedule automatic background retry every 15 seconds
    if (!_reconnectTimer) {
      _reconnectTimer = setInterval(async () => {
        if (!isDbConnected() && !_isConnecting) {
          console.log('🔄 [Database]: Retrying MongoDB Atlas connection...');
          await connectDB();
        }
      }, 15000);
      // Unref timer so it doesn't prevent Node process shutdown
      if (_reconnectTimer.unref) _reconnectTimer.unref();
    }

    return false;
  }
};

// Listen to connection lifecycle events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [Database]: MongoDB Atlas connection lost.');
  if (!_reconnectTimer) {
    _reconnectTimer = setInterval(async () => {
      if (!isDbConnected() && !_isConnecting) {
        console.log('🔄 [Database]: Reconnecting to MongoDB Atlas...');
        await connectDB();
      }
    }, 10000);
    if (_reconnectTimer.unref) _reconnectTimer.unref();
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [Database]: MongoDB Atlas reconnected successfully!');
  if (_reconnectTimer) {
    clearInterval(_reconnectTimer);
    _reconnectTimer = null;
  }
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error]: ${err.message}`);
});

export default connectDB;
