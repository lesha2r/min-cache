import { calcApproxObjSize } from "./helpers.js";
const defaultOptions = {
    delExpiredMs: 10000,
    debug: false,
    maxSizeKb: 10 * 1024,
    ttlMs: 60 * 1000,
};
class MinCache {
    id;
    storage = new Map();
    options;
    currentSizeBytes = 0;
    debug;
    constructor(id, optionsArg = defaultOptions) {
        this.id = id;
        this.options = {
            ...defaultOptions,
            ...optionsArg,
        };
        this.debug = this.options.debug || false;
        this.id = id;
        this.storage = new Map();
    }
    log(...args) {
        if (!this.debug)
            return;
        console.log(`[MinCache: ${this.id}]`, ...args);
    }
    calculateSize(data) {
        return calcApproxObjSize(data);
    }
    releaseSpaceIfNeeded(newItemSize) {
        if (!this.options.maxSizeKb)
            return;
        const maxSizeBytes = this.options.maxSizeKb * 1024;
        if (this.currentSizeBytes + newItemSize <= maxSizeBytes)
            return;
        const sortedEntries = [...this.storage.entries()]
            .sort(([, a], [, b]) => a.expiresAt - b.expiresAt);
        let freedSpace = 0;
        for (const [key, item] of sortedEntries) {
            if (this.currentSizeBytes + newItemSize - freedSpace <= maxSizeBytes) {
                break;
            }
            this.storage.delete(key);
            freedSpace += item.size;
            this.log(`Cleared "${key}" to free up some space`);
        }
        this.currentSizeBytes -= freedSpace;
    }
    size() {
        return this.currentSizeBytes;
    }
    del(key, reason) {
        const item = this.storage.get(key);
        if (!item)
            return false;
        this.currentSizeBytes -= item.size;
        this.storage.delete(key);
        const reasonStr = reason ? `(${reason})` : '';
        this.log(`Cleared key "${key}" ${reasonStr}`);
        return true;
    }
    delExpired() {
        let deletedCount = 0;
        const now = Date.now();
        this.storage.forEach((item, key) => {
            if (item.expiresAt < now) {
                this.del(key, 'expired');
                deletedCount++;
            }
        });
        this.log(`Cleared ${deletedCount} expired items`);
        return deletedCount;
    }
    delAll() {
        this.storage.clear();
        this.currentSizeBytes = 0;
        this.log('Cleared all items');
    }
    set(key, value, ttlMs = this.options.ttlMs || 60000) {
        this.log(`Adding "${key}"`);
        if (key === undefined)
            throw new Error('Missing required field: key');
        if (value === undefined)
            throw new Error('Missing required field: dataToStore');
        const expiresAt = Date.now() + (ttlMs ?? this.options.ttlMs ?? 60000);
        const size = this.calculateSize(value);
        this.releaseSpaceIfNeeded(size);
        this.storage.set(key, { data: value, expiresAt, size });
        this.currentSizeBytes += size;
        this.log(`Added key "${key}"`, {
            expiresAt: new Date(expiresAt),
            sizeBytes: size
        });
        return true;
    }
    ;
    get(key) {
        this.log(`Getting "${key}"`);
        const item = this.storage.get(key);
        if (!item) {
            this.log(`Key "${key}" not found`);
            return undefined;
        }
        if (item.expiresAt < Date.now()) {
            this.log(`Key "${key}" expired`);
            this.del(key);
            return undefined;
        }
        return item.data;
    }
    getAll() {
        const result = {};
        this.storage.forEach((item, key) => {
            if (item.expiresAt >= Date.now()) {
                result[key] = item.data;
            }
        });
        return result;
    }
    exists(key) {
        const value = this.get(key);
        return value !== undefined;
    }
    keys() {
        return Array.from(this.storage.keys()).filter(key => {
            const item = this.storage.get(key);
            if (item.expiresAt < Date.now()) {
                this.del(key);
                return false;
            }
            return true;
        });
    }
    ttl(key) {
        const item = this.storage.get(key);
        if (!item) {
            this.log(`Key "${key}" not found for TTL`);
            return -1;
        }
        const remainingTime = item.expiresAt - Date.now();
        return remainingTime > 0 ? Math.floor(remainingTime / 1000) : -1;
    }
    setTtl(key, ttlMs) {
        const item = this.storage.get(key);
        if (!item) {
            this.log(`Key "${key}" not found for EXPIRE`);
            return false;
        }
        if (ttlMs <= 0) {
            this.log(`Invalid ttlMs for key "${key}": ${ttlMs}`);
            return false;
        }
        item.expiresAt = Date.now() + (ttlMs ?? this.options.ttlMs ?? 60000);
        this.storage.set(key, item);
        this.log(`Set new expiration for key "${key}" to ${new Date(item.expiresAt)}`);
        return true;
    }
    rename(oldKey, newKey) {
        const item = this.storage.get(oldKey);
        if (!item) {
            this.log(`Key "${oldKey}" not found for RENAME`);
            return false;
        }
        if (this.storage.has(newKey)) {
            this.log(`Key "${newKey}" already exists, cannot rename "${oldKey}"`);
            return false;
        }
        this.storage.delete(oldKey);
        this.storage.set(newKey, item);
        this.log(`Renamed key "${oldKey}" to "${newKey}"`);
        return true;
    }
    scan(pattern, count) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        const keys = [];
        for (const key of this.storage.keys()) {
            if (regex.test(key)) {
                keys.push(key);
                if (count && keys.length >= count)
                    break;
            }
        }
        this.log(`Scanned ${keys.length} keys matching pattern "${pattern}"`);
        return keys;
    }
}
export default MinCache;
