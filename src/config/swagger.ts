import { APIPrefix } from "./apiPrefix";

export function buildOpenApiSpec(): object {
  const { products: p, orders: o } = APIPrefix;
  const productId = `${p}/{id}`;
  const orderId = `${o}/{id}`;
  const orderCancel = `${o}/{id}/cancel`;

  return {
    openapi: "3.0.3",
    info: {
      title: "Order Management & Inventory API",
      version: "1.0.0",
      description:
        "REST API for products, stock, and orders. Paths use the same base as the server (`API_PREFIX`; default segment `api` → `/api/products`, `/api/orders`).",
    },
    servers: [{ url: "/", description: "Current host" }],
    tags: [
      { name: "Health", description: "Liveness" },
      { name: "Products", description: "Product catalog and inventory" },
      { name: "Orders", description: "Orders and cancellations" },
    ],
    components: {
      schemas: {
        PageMeta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            pageSize: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            priceCents: { type: "integer" },
            price: { type: "number", description: "Dollars (derived from cents)" },
            stock: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateProductBody: {
          type: "object",
          required: ["name", "price", "stock"],
          properties: {
            name: { type: "string", maxLength: 255 },
            description: { type: "string", maxLength: 10000, nullable: true },
            price: { type: "number", exclusiveMinimum: 0, maximum: 1_000_000, description: "Dollars" },
            stock: { type: "integer", minimum: 0, maximum: 1_000_000_000 },
          },
        },
        UpdateProductBody: {
          type: "object",
          minProperties: 1,
          properties: {
            name: { type: "string", maxLength: 255 },
            description: { type: "string", maxLength: 10000, nullable: true },
            price: { type: "number", exclusiveMinimum: 0, maximum: 1_000_000 },
            stock: { type: "integer", minimum: 0, maximum: 1_000_000_000 },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            quantity: { type: "integer" },
            unitPriceCents: { type: "integer" },
            unitPrice: { type: "number" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            status: { type: "string", enum: ["confirmed", "cancelled"] },
            totalCents: { type: "integer" },
            total: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          },
        },
        CreateOrderBody: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "integer", minimum: 1 },
                  quantity: { type: "integer", minimum: 1, maximum: 1_000_000 },
                },
              },
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
                code: { type: "string" },
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      path: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      parameters: {
        IdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      env: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      [p]: {
        get: {
          tags: ["Products"],
          summary: "List products (paginated)",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            "200": {
              description: "Paginated list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                      page: { $ref: "#/components/schemas/PageMeta" },
                    },
                  },
                },
              },
            },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create product",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateProductBody" } } },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } },
                },
              },
            },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
      },
      [productId]: {
        get: {
          tags: ["Products"],
          summary: "Get product by ID",
          parameters: [{ $ref: "#/components/parameters/IdPath" }],
          responses: {
            "200": {
              description: "Product",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } },
                },
              },
            },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
        patch: {
          tags: ["Products"],
          summary: "Update product (partial)",
          parameters: [{ $ref: "#/components/parameters/IdPath" }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProductBody" } } },
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } },
                },
              },
            },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete product",
          parameters: [{ $ref: "#/components/parameters/IdPath" }],
          responses: {
            "204": { description: "Deleted" },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "409": { description: "Conflict (e.g. referenced by order lines)", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
      },
      [o]: {
        get: {
          tags: ["Orders"],
          summary: "List orders (paginated; includes line items)",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            "200": {
              description: "Paginated list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                      page: { $ref: "#/components/schemas/PageMeta" },
                    },
                  },
                },
              },
            },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
        post: {
          tags: ["Orders"],
          summary: "Place order (stock deducted in one transaction)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateOrderBody" } } },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } },
                },
              },
            },
            "409": { description: "Conflict (e.g. insufficient stock)", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
      },
      [orderId]: {
        get: {
          tags: ["Orders"],
          summary: "Get order by ID",
          parameters: [{ $ref: "#/components/parameters/IdPath" }],
          responses: {
            "200": {
              description: "Order",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } },
                },
              },
            },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
      },
      [orderCancel]: {
        post: {
          tags: ["Orders"],
          summary: "Cancel order and restore stock",
          parameters: [{ $ref: "#/components/parameters/IdPath" }],
          responses: {
            "200": {
              description: "Cancelled order",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } },
                },
              },
            },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "409": { description: "Conflict (e.g. already cancelled)", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
            "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          },
        },
      },
    },
  };
}
