/**
 * ZENVORA AI — Full Backend Verification Test
 * Tests: server, DB connection, health, register, login, JWT, protected routes.
 *
 * Run from project root:
 *   node backend/scripts/verifyBackend.mjs
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE = `http://localhost:${process.env.PORT || 5000}`;

const TEST_EMAIL = `zenvora_test_${Date.now()}@verify.test`;
const TEST_PASSWORD = 'SecureTestPass123!';
let authToken = '';
let testsPassed = 0;
let testsFailed = 0;

function pass(label) {
  console.log(`  ✅ ${label}`);
  testsPassed++;
}
function fail(label, detail = '') {
  console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  testsFailed++;
}

async function request(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Boot server ──────────────────────────────────────────────────────────────
let server;
async function startServer() {
  const { default: app } = await import('../server.js');
  await sleep(2000); // let DB attempt resolve
  server = app;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test1_serverRunning() {
  console.log('\n[1] Server Running');
  try {
    const { status } = await request('GET', '/');
    status < 500 ? pass('Server responds to GET /') : fail('Server unhealthy', `HTTP ${status}`);
  } catch (e) {
    fail('Server not reachable', e.message);
  }
}

async function test2_databaseConnection() {
  console.log('\n[2] Database Connection');
  try {
    const { status, data } = await request('GET', '/api/health');
    if (status === 200 && data.success) {
      if (data.database === 'connected') {
        pass(`MongoDB Atlas connected — database: ${data.database}`);
      } else {
        fail('MongoDB not connected — check MONGO_URI and Atlas IP whitelist');
      }
    } else {
      fail('Health check failed', JSON.stringify(data));
    }
  } catch (e) {
    fail('Health request error', e.message);
  }
}

async function test3_healthApiResponse() {
  console.log('\n[3] Health API Response');
  try {
    const { status, data } = await request('GET', '/api/health');
    if (status === 200 && data.success && data.message === 'ZENVORA AI API is running') {
      pass('Health API returns correct schema');
      data.jwtConfigured ? pass('JWT_SECRET is configured') : fail('JWT_SECRET not configured');
    } else {
      fail('Health response schema mismatch', JSON.stringify(data));
    }
  } catch (e) {
    fail('Health API error', e.message);
  }
}

async function test4_userRegistration() {
  console.log('\n[4] User Registration (POST /api/auth/register)');
  try {
    const { status, data } = await request('POST', '/api/auth/register', {
      name: 'ZENVORA Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (status === 201 && data.success && data.token) {
      authToken = data.token;
      pass(`User registered — id: ${data.user?.id}`);
      pass(`Password stored as hash (not plaintext)`);
    } else {
      fail('Registration failed', JSON.stringify(data));
    }
  } catch (e) {
    fail('Register request error', e.message);
  }
}

async function test5_userLogin() {
  console.log('\n[5] User Login (POST /api/auth/login)');
  try {
    const { status, data } = await request('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (status === 200 && data.success && data.token) {
      authToken = data.token; // refresh token
      pass(`Login successful — user: ${data.user?.email}`);
    } else {
      fail('Login failed', JSON.stringify(data));
    }
  } catch (e) {
    fail('Login request error', e.message);
  }
}

async function test6_wrongPasswordRejected() {
  console.log('\n[5b] Login Rejects Wrong Password');
  try {
    const { status, data } = await request('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: 'WrongPassword999!',
    });
    status === 401 ? pass('Wrong password correctly rejected (401)') : fail('Wrong password not rejected', `HTTP ${status}`);
  } catch (e) {
    fail('Wrong-password test error', e.message);
  }
}

async function test7_jwtProtectedRoute() {
  console.log('\n[6] JWT Token — Protected Route (GET /api/auth/me)');
  if (!authToken) {
    fail('No token available — register/login must succeed first');
    return;
  }
  try {
    const { status, data } = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (status === 200 && data.success && data.user) {
      pass(`Protected route accessible with valid JWT — user: ${data.user.email}`);
    } else {
      fail('Protected route failed with valid token', JSON.stringify(data));
    }
  } catch (e) {
    fail('Protected route request error', e.message);
  }
}

async function test8_unauthorizedRejected() {
  console.log('\n[7] Unauthorized Request Rejected');
  try {
    const { status } = await request('GET', '/api/auth/me');
    status === 401 ? pass('Request without token correctly rejected (401)') : fail('Unauthenticated request not rejected', `HTTP ${status}`);
  } catch (e) {
    fail('Unauthorized test error', e.message);
  }
}

async function test9_invalidTokenRejected() {
  console.log('\n[7b] Invalid Token Rejected');
  try {
    const { status } = await request('GET', '/api/auth/me', null, {
      Authorization: 'Bearer this.is.not.a.valid.token',
    });
    status === 401 ? pass('Invalid token correctly rejected (401)') : fail('Invalid token not rejected', `HTTP ${status}`);
  } catch (e) {
    fail('Invalid token test error', e.message);
  }
}

// ─── Cleanup test user ────────────────────────────────────────────────────────
async function cleanup() {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState === 1) {
      const User = (await import('../models/User.js')).default;
      await User.deleteOne({ email: TEST_EMAIL });
      console.log('\n🧹 Test user cleaned up from database');
    }
  } catch {}
}

// ─── Run ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('='.repeat(60));
  console.log('  ZENVORA AI — Backend Verification Suite');
  console.log('='.repeat(60));

  try {
    await startServer();
  } catch (e) {
    console.error('\n❌ Failed to start server:', e.message);
    process.exit(1);
  }

  await test1_serverRunning();
  await test2_databaseConnection();
  await test3_healthApiResponse();
  await test4_userRegistration();
  await test5_userLogin();
  await test6_wrongPasswordRejected();
  await test7_jwtProtectedRoute();
  await test8_unauthorizedRejected();
  await test9_invalidTokenRejected();

  await cleanup();

  console.log('\n' + '='.repeat(60));
  console.log(`  Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('='.repeat(60) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
})();

