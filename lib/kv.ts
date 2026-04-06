/**
 * KV abstraction:
 * - In development (NODE_ENV !== 'production'): in-memory Map
 * - In production: @vercel/kv
 */

interface KVClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ex?: number; nx?: boolean }): Promise<string | null>;
  del(key: string): Promise<number>;
}

// ── Dev: in-memory store ─────────────────────────────────────────────

interface MemEntry {
  value: unknown;
  expiresAt?: number;
}

class MemoryKV implements KVClient {
  private store = new Map<string, MemEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(
    key: string,
    value: unknown,
    options?: { ex?: number; nx?: boolean }
  ): Promise<string | null> {
    if (options?.nx && this.store.has(key)) {
      const entry = this.store.get(key)!;
      if (!entry.expiresAt || Date.now() < entry.expiresAt) {
        return null; // lock already held
      }
    }
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

// ── KV singleton ──────────────────────────────────────────────────────

let _kv: KVClient | null = null;

async function getKV(): Promise<KVClient> {
  if (_kv) return _kv;

  if (process.env.NODE_ENV !== "production") {
    _kv = new MemoryKV();
    return _kv;
  }

  const { kv } = await import("@vercel/kv");
  _kv = kv as unknown as KVClient;
  return _kv;
}

// ── Public API ────────────────────────────────────────────────────────

export async function kvGet<T>(key: string): Promise<T | null> {
  const client = await getKV();
  return client.get<T>(key);
}

export async function kvSet(
  key: string,
  value: unknown,
  options?: { ex?: number; nx?: boolean }
): Promise<string | null> {
  const client = await getKV();
  return client.set(key, value, options);
}

export async function kvDel(key: string): Promise<number> {
  const client = await getKV();
  return client.del(key);
}

// ── KV keys ───────────────────────────────────────────────────────────

export const KV_KEYS = {
  STATE: "macro-map:disruption-state",
  LOCK: "macro-map:refresh-lock",
} as const;
