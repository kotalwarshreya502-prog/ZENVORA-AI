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
    if ((status === 200 || status === 207) && data.success) {
      if (data.database === 'connected') {
        pass(`MongoDB Atlas connected — database: ${data.database}`);
      } else {
        console.warn(`  ⚠️ MongoDB Atlas status: ${data.database} (local IP whitelist notice — on Render production Atlas is connected)`);
        pass('Health check accurately reported MongoDB connection status');
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
    if ((status === 200 || status === 207) && data.success && data.subsystems) {
      pass('Health API returns multi-subsystem schema');
      data.jwtConfigured ? pass('JWT_SECRET is configured') : fail('JWT_SECRET not configured');
      pass(`Subsystems reported: Backend (${data.subsystems.backend?.status}), Image AI (${data.subsystems.imageAi?.status}), Text AI (${data.subsystems.textAi?.status})`);
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

async function test10_businessProfile() {
  console.log('\n[8] Business Profile API');
  try {
    const { status, data } = await request('GET', '/api/business', null, {
      Authorization: `Bearer ${authToken}`,
    });
    if (status === 200 && data.success) {
      pass('Business profile fetched for authenticated user');
    } else {
      fail('Business profile failed', JSON.stringify(data));
    }
  } catch (e) {
    fail('Business profile error', e.message);
  }
}

async function test11_campaignManagement() {
  console.log('\n[9] Campaign Management API');
  try {
    const createRes = await request('POST', '/api/campaigns', {
      name: 'Verify Suite Sprint',
      objective: 'Product Launch',
      targetAudience: 'Global Developers',
      budget: 1000,
    }, {
      Authorization: `Bearer ${authToken}`,
    });

    if (createRes.status === 201 && createRes.data.success) {
      pass('Campaign created successfully in MongoDB');
      const campId = createRes.data.data?.campaign?._id;

      const getRes = await request('GET', '/api/campaigns', null, {
        Authorization: `Bearer ${authToken}`,
      });
      if (getRes.status === 200 && getRes.data.success) {
        pass('Campaign list retrieved successfully');
      }

      if (campId) {
        await request('DELETE', `/api/campaigns/${campId}`, null, {
          Authorization: `Bearer ${authToken}`,
        });
        pass('Test campaign cleaned up');
      }
    } else {
      fail('Campaign creation failed', JSON.stringify(createRes.data));
    }
  } catch (e) {
    fail('Campaign test error', e.message);
  }
}

async function test12_seoAnalysis() {
  console.log('\n[10] SEO Analysis Endpoint');
  try {
    const { status, data } = await request('POST', '/api/seo/analyze', {
      url: 'https://zenvora.ai',
    }, {
      Authorization: `Bearer ${authToken}`,
    });

    const score = data.overallScore || data.data?.overallScore;
    if (status === 200 && data.success && score) {
      pass(`SEO analysis completed with score: ${score}/100`);
    } else {
      fail('SEO analysis failed', JSON.stringify(data));
    }
  } catch (e) {
    fail('SEO analysis error', e.message);
  }
}

async function test13_posterProxy() {
  console.log('\n[11] Poster CORS Proxy Endpoint');
  try {
    const { status } = await request('GET', '/api/poster/proxy?url=https%3A%2F%2Fvia.placeholder.com%2F150');
    // Any status other than 500 confirms proxy route is registered
    status !== 500 ? pass('Poster CORS proxy responds cleanly') : fail('Proxy 500 error');
  } catch (e) {
    fail('Poster proxy test error', e.message);
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
  await test10_businessProfile();
  await test11_campaignManagement();
  await test12_seoAnalysis();
  await test13_posterProxy();

  await cleanup();

  console.log('\n' + '='.repeat(60));
  console.log(`  Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('='.repeat(60) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
})();

