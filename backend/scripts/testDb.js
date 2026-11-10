import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testDatabaseConnection = async () => {
  console.log('='.repeat(65));
  console.log('  🔍 ZENVORA AI — MongoDB Connection Diagnostic');
  console.log('='.repeat(65));

  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === '') {
    console.error('\n❌ ERROR: MONGO_URI is missing or empty in backend/.env');
    console.log('\n👉 Instructions:');
    console.log('   1. Open backend/.env');
    console.log('   2. Set MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zenvora');
    console.log('   3. Run "npm run test:db" again.\n');
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  console.log(`\n📌 Target URI: ${maskedUri}`);

  if (uri.includes('<') || uri.includes('>')) {
    console.warn('\n⚠️ WARNING: Your MONGO_URI contains angle brackets "<" or ">".');
    console.log('   In MongoDB connection strings, <password> is a placeholder.');
    console.log('   Replace <password> with your actual password WITHOUT the "<" and ">" characters.');
    console.log('   Example:');
    console.log('     WRONG : mongodb+srv://user:<mypassword>@cluster.mongodb.net/');
    console.log('     RIGHT : mongodb+srv://user:mypassword@cluster.mongodb.net/zenvora\n');
  }

  console.log('⏳ Connecting to MongoDB Atlas (timeout: 8s)...');

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'zenvora_ai',
      serverSelectionTimeoutMS: 8000,
    });

    console.log('\n🎉 SUCCESS! Connected to MongoDB Atlas successfully.');
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State:    ReadyState ${conn.connection.readyState} (Connected)`);

    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log(`   Ping:     OK (${JSON.stringify(pingResult)})\n`);

    console.log('✅ ZENVORA AI database connection verified.');
    console.log('='.repeat(65) + '\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed:');
    console.error(`   ${error.message}\n`);

    console.log('🛠️ Troubleshooting Guide:');
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('   • Authentication failed: check username & password in Atlas Database Access.');
      console.log('   • Ensure angle brackets "<" and ">" are removed from around the password.');
    } else if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
      console.log('   • Cluster host not found: check cluster name in MongoDB Atlas.');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('Server selection timed out')) {
      console.log('   • Network/IP Whitelist issue:');
      console.log('     In MongoDB Atlas -> Network Access -> Add IP Address.');
      console.log('     Add your current IP or allow access from anywhere (0.0.0.0/0) for development.');
    }
    console.log('='.repeat(65) + '\n');
    process.exit(1);
  }
};

testDatabaseConnection();

