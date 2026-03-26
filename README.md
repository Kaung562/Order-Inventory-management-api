# Order Management & Inventory API

REST API for **products** (with stock), **orders** (with line items), **stock deduction** when an order is placed, and **stock restoration** when an order is cancelled. Built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, and **TypeORM** (transactions for order flows).

**Scope:** backend-only—no separate admin UI. **Swagger UI** at `/api-docs` is for documentation and trying requests (not a product dashboard). Use Swagger, Postman, or any HTTP client. The **Postman collection** for this project is in the **`docs/`** folder: `docs/postman_collection.json`.

Layering is similar to a typical **controller → service → repository** layout, with **Zod** validation at the HTTP edge and **domain types** in `entities/` separate from **TypeORM** mappings in `orm/entities/`.

## Features

| Area | Implementation |
|------|------------------|
| Products | `POST` / `PATCH` / `DELETE`, `GET` list & by id (prefix from `API_PREFIX`, default `/api/products`) |
| Orders | `POST` with `{ items: [{ productId, quantity }] }`; list + get + cancel |
| Stock on place order | **TypeORM** transaction: validate stock, insert order + lines, decrement `products.stock` |
| Cancel | `POST .../orders/:id/cancel` in a transaction: restore quantities, set `status = cancelled` |
| Validation & errors | **Zod** + `validateRequest` → **422**; domain errors → `ResponseError`; FK issues → **409** |
| Pagination | `?page=&pageSize=` (max 100); list responses use **`page`** (totals, `page`, `pageSize`, `totalPages`) |
| Redis (optional) | Product list cache (short TTL); cleared on product writes **and** when orders place/cancel (stock changes). Omit `REDIS_URL` to disable |
| Schema | **TypeORM `synchronize`** from `orm/entities/` when `DATABASE_SYNC=true` (see `migrations/README.md`) |
| Docker | `docker compose up --build` — config via `.env` (see below) |
| API docs | OpenAPI built in `config/swagger.ts` (paths follow `apiPrefix.ts`); **Swagger UI** at `/api-docs` |

## Quick start (local)

1. **PostgreSQL** running locally (or use Docker for the full stack).

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Set `DATABASE_URL` (and optional `REDIS_URL`) for `localhost`.

3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

4. **URLs** (default `PORT=3000`, `API_PREFIX=api`):
   - Health: `GET http://localhost:3000/health`
   - Swagger: `http://localhost:3000/api-docs`
   - Products: `http://localhost:3000/api/products`

On first start, tables are created/updated by TypeORM when `DATABASE_SYNC=true`.

## Docker

`docker-compose.yml` reads variables from **`./.env`** (no secrets hardcoded in the file). Copy **`.env.example` → `.env`** and fill all keys.

- **`DATABASE_URL`** / **`REDIS_URL`** — used when you run **`npm run dev`** on the host (`localhost`).
- **`DATABASE_URL_DOCKER`** / **`REDIS_URL_DOCKER`** — passed into the **API container** (hosts **`postgres`** / **`redis`**).
- **`NODE_ENV`** — local and container (e.g. `development`).

```bash
docker compose up --build
```

API listens on **`PORT`**. For a clean DB volume: `docker compose down -v` then `up` again.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | `tsx watch` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run `dist/server.js` |
| `npm test` | Jest + coverage |

## API summary

Default prefix **`/api`** (`API_PREFIX=api`). If `API_PREFIX` is empty, routes are `/products` and `/orders`.

### Products

- `GET /api/products?page=&pageSize=`
- `GET /api/products/:id`
- `POST /api/products` — `{ name, description?, price (dollars), stock }`
- `PATCH /api/products/:id` — partial; at least one field
- `DELETE /api/products/:id` — **409** if referenced by order lines

### Orders

- `GET /api/orders?page=&pageSize=` — includes `items` per order
- `GET /api/orders/:id`
- `POST /api/orders` — `{ items: [{ productId, quantity }] }` (transaction)
- `POST /api/orders/:id/cancel` — **409** if already cancelled

### Errors

**Application / not-found / conflict:**

```json
{
  "error": {
    "message": "…",
    "code": "NOT_FOUND"
  }
}
```

**Validation (422):**

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "errors": [{ "message": "…", "path": ["field"] }]
  }
}
```

## Database

- **Entities:** `src/orm/entities/` (TypeORM). **Domain types:** `src/entities/` (`Product`, `Order`).
- **Synchronize:** `DATABASE_SYNC=true` applies DDL on startup (`migrations/README.md`).
- **Money:** stored as integer cents (`price_cents`, `total_cents`, `unit_price_cents`); JSON also exposes `price` / `total` / `unitPrice` in dollars.

## Docs

- **Postman:** collection file **`docs/postman_collection.json`** (under the **`docs/`** folder). Import it in Postman and set the `baseUrl` variable.
- **Swagger UI:** `http://localhost:3000/api-docs` — paths match `API_PREFIX` / `config/apiPrefix.ts`.

### Request flow

1. `cors` → `express.json()` → `GET /health` → routers under **`APIPrefix.products`** / **`APIPrefix.orders`**.
2. Route: `validateRequest` → controller → service → repository (TypeORM / Redis).
3. After routes: 404 JSON → `pgErrorMiddleware` → `errorHandler`.


