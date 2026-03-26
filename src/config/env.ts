import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL?.trim() || undefined,
};

export function assertDatabaseUrl(): string {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return env.databaseUrl;
}
