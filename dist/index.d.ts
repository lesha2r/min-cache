import { CacheOptions, MinCache as MinCacheType } from "./types.js";
declare class MinCache<T = any> implements MinCacheType<T> {
    private readonly id;
    private storage;
    private options;
    private currentSizeBytes;
    private debug;
    constructor(id: string, optionsArg?: CacheOptions);
    private log;
    private calculateSize;
    private releaseSpaceIfNeeded;
    size(): number;
    del(key: string, reason?: string): boolean;
    delExpired(): number;
    delAll(): void;
    set(key: string, value: T, ttlMs?: number): boolean;
    get(key: string): T | undefined;
    getAll(): Record<string, T>;
    exists(key: string): boolean;
    keys(): string[];
    ttl(key: string): number;
    setTtl(key: string, ttlMs: number): boolean;
    rename(oldKey: string, newKey: string): boolean;
    scan(pattern: string, count?: number): string[];
}
export default MinCache;
