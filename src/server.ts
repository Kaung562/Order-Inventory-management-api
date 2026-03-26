import "reflect-metadata";
import { env, assertDatabaseUrl } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { APIPrefix } from "./config/apiPrefix";
import { createApp } from "./app";

async function bootstrap(): Promise<void> {
  assertDatabaseUrl();
  await AppDataSource.initialize();

  const { app, context } = createApp();

  if (context.redis) {
    await context.redis.connect().catch((err: Error) => {
      console.warn("Redis unavailable; product list cache disabled:", err.message);
    });
  }

  const server = app.listen(env.port, () => {
    if (AppDataSource.options.synchronize) {
      console.log("TypeORM synchronize: schema updated from entities (no SQL migration files required).");
    }
  });

  const shutdown = (): void => {
    server.close(() => {
      void (async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        if (context.redis) await context.redis.quit().catch(() => undefined);
        process.exit(0);
      })();
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
