// lib/env.ts

export function getEnv(key: string, fallback: string = ""): string {
  const value = process.env[key];
  if (!value) return fallback;
  return value.replace(/^["']|["']$/g, "").trim();
}
