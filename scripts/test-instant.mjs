import { init } from '@instantdb/core';
import { readFileSync } from 'fs';

// Instant DB configuration - using same pattern as frontend
const APP_ID = '14bcf449-e9b5-4c78-82f0-e5c63336fd68';

// Initialize exactly like the frontend instant.ts
const dbCore = init({
  appId: APP_ID,
});

async function testConnection() {
  try {
    console.log('🔍 Testing dbCore object:', typeof dbCore);
    console.log('🔍 Available methods:', Object.getOwnPropertyNames(dbCore));
    console.log('🔍 Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(dbCore)));
    
    // Try to see if there's an admin property
    console.log('🔍 dbCore.admin:', typeof dbCore.admin);
    if (dbCore.admin) {
      console.log('🔍 Admin methods:', Object.getOwnPropertyNames(dbCore.admin));
    }
    
    // Try to access _reactor which might have admin
    console.log('🔍 dbCore._reactor:', typeof dbCore._reactor);
    if (dbCore._reactor) {
      console.log('🔍 Reactor methods:', Object.getOwnPropertyNames(dbCore._reactor));
      console.log('🔍 Reactor admin:', typeof dbCore._reactor.admin);
      if (dbCore._reactor.admin) {
        console.log('🔍 Reactor admin methods:', Object.getOwnPropertyNames(dbCore._reactor.admin));
      }
    }
    
    // Try a simple transaction instead
    console.log('🔍 dbCore.tx:', typeof dbCore.tx);
    if (dbCore.tx) {
      console.log('✅ Transaction system available');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

async function main() {
  console.log('🏆 Testing InstantDB connection...');
  await testConnection();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
