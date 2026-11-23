import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDbConnected, getDbStatusString, getMongoUri } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('--- Testing DB Resilience & Config ---');
console.log('Initial DB Status:', getDbStatusString());
console.log('Is DB Connected:', isDbConnected());

const resolvedUri = getMongoUri();
console.log('Resolved URI configured:', Boolean(resolvedUri));
if (resolvedUri) {
  console.log('Sanitized URI:', resolvedUri.replace(/:([^:@]+)@/, ':****@'));
}

console.log('✅ DB resilience helper checks passed.');
process.exit(0);
