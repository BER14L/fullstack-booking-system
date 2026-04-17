/**
 * Swagger / OpenAPI configuration.
 *
 * We generate the spec from JSDoc annotations embedded in the route files so
 * docs and code never drift. Served at `/api/docs` by `server.ts`.
 */
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SmartReserve API",
      version: "1.0.0",
      description:
        "REST API for the SmartReserve booking platform. All non-public endpoints require a Bearer JWT obtained from `/api/auth/login`.",
      contact: { name: "SmartReserve" },
      license: { name: "MIT" },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api`, description: "Local development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date-time" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"],
            },
            notes: { type: "string", nullable: true },
            priceCents: { type: "integer" },
            currency: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            details: { type: "object", nullable: true },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan route files for JSDoc `@openapi` blocks.
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
