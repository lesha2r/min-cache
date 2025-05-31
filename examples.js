import MiniCache from './dist/index.js';

const cache = new MiniCache('myCache', {
  maxSizeKb: 5 * 1024,    // Max cache size in KB
  delExpiredMs: 60000,    // Clear interval
  ttlMs: 30000,           // Default TTL for items (ms)
  debug: true             // On/Off logging
});

// Add an item
cache.set('key', { foo: 'bar' }, 10000); // TTL: 10s

// Get an item
const value = cache.get('key');

// Check if a key exists
const exists = cache.exists('key');

// Remove a key
cache.del('key');

// Get list of all keys
const keys = cache.keys();

// Get all valid items
const all = cache.getAll();

// Set a new TTL for a key
cache.setTtl('key', 20000); // exact 20 seconds from now

// Find up all keys starting with "userid"
const matches = cache.scan('user*');

// Find up 10 keys starting with "userid"
const matchesLimited = cache.scan('user*', 10);