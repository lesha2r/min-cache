# MiniCache

Ultra-lightweight, in-memory cache for Node.js with TTL support and configurable size limits.

## Features

- **In-memory storage** for fast access
- **Time-to-live (TTL)** for each record (ms)
- **Max cache size** (in KB) with automatic clearing oldest or expired records
- **Customizable options** (debug, TTL, cleanup interval)
- **Redis-like method names** (`SET`, `GET`, `DEL`, etc.)
- **TypeScript support**

## Installation

```sh
npm install mini-cache
```

## Usage

```js
import MiniCache from 'mini-cache';

const cache = new MiniCache('myCache', {
  maxSizeKb: 5 * 1024,    // Max cache size in KB
  clearExpiredMs: 60000,  // Clear interval
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

// Find up maximum 10 keys starting with "userid"
const matchesLimited = cache.scan('user*', 10);
```

## API

### Constructor

```ts
new MiniCache(id: string, options?: CacheOptions)
```

- `id`: Unique cache name (for logging/debugging)
- `options`:
  - `maxSizeKb` (number): Max cache size in KB (default: 5000)
  - `clearExpiredMs` (number): How often to clear expired items (default: 10000)
  - `ttlMs` (number): Default TTL for items in ms (default: 60000)
  - `debug` (boolean): Enable debug logging (default: false)

### Methods

- `set(key, value, ttlMs?)`: Add item with optional TTL
- `get(key)`: Get item by key
- `exists(key)`: Check if key exists and is not expired
- `del(key)`: Remove item by key
- `delAll()`: Remove all items
- `delExpired()`: Remove all expired items
- `keys()`: Get all valid keys
- `getAll()`: Get all valid items
- `ttl(key)`: Get time-to-live (seconds) for a key
- `setTtl(key, ttlMs)`: Set new TTL for a key
- `rename(oldKey, newKey)`: Rename a key
- `scan(pattern, count?)`: Get up to `count` keys matching a pattern (e.g. `userid*`). Returns an array of matching keys.