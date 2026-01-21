#!/usr/bin/env node

/**
 * Deployment Verification Script for Render
 * Checks if the deployed application is working correctly
 */

const https = require('https');
const http = require('http');

const APP_URL = process.env.RENDER_EXTERNAL_URL || 'https://malaica-calendar.onrender.com';

console.log('🔍 Starting deployment verification...');
console.log(`📍 Target URL: ${APP_URL}`);

async function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

async function checkEndpoint(path, expectedStatus = 200, description = '') {
  try {
    console.log(`\n🔍 Checking ${description || path}...`);
    const response = await makeRequest(`${APP_URL}${path}`);
    
    if (response.statusCode === expectedStatus) {
      console.log(`✅ ${description || path} - Status: ${response.statusCode}`);
      return true;
    } else {
      console.log(`❌ ${description || path} - Expected: ${expectedStatus}, Got: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description || path} - Error: ${error.message}`);
    return false;
  }
}

async function checkHealthEndpoint() {
  try {
    console.log('\n🏥 Checking health endpoint...');
    const response = await makeRequest(`${APP_URL}/api/health`);
    
    if (response.statusCode === 200) {
      const health = JSON.parse(response.body);
      console.log('✅ Health check passed');
      console.log(`   Status: ${health.status}`);
      console.log(`   Database: ${health.database}`);
      console.log(`   Uptime: ${health.uptime}s`);
      return true;
    } else {
      console.log(`❌ Health check failed - Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('\n🚀 Running deployment verification checks...\n');
  
  const checks = [
    () => checkEndpoint('/', 200, 'Landing page'),
    () => checkHealthEndpoint(),
    () => checkEndpoint('/api/auth/user', [200, 401], 'Auth endpoint'),
    () => checkEndpoint('/api/content', [200, 401], 'Content API'),
  ];

  let passed = 0;
  let total = checks.length;

  for (const check of checks) {
    if (await check()) {
      passed++;
    }
    // Small delay between checks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Verification Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All checks passed! Deployment is successful.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some checks failed. Please review the deployment.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run verification
runVerification().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});