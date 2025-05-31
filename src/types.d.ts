export interface CacheOptions {
  delExpiredMs: number;
  debug: boolean;
  maxSizeKb: number;
  ttlMs: number;
}

export interface CacheItem<T = any> {
  data: T;
  expiresAt: number;
  size: number;
}

export declare class MiniCache<T = any> {
  constructor(id: string, optionsArg?: CacheOptions);

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