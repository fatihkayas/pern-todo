import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Seiko Watch Store API",
      version: "1.0.0",
      description: "REST API for the Seiko Watch Store e-commerce platform",
    },
    servers: [{ url: "/api/v1", description: "API v1" }],
    tags: [
      { name: "Watches", description: "Watch catalog endpoints" },
      { name: "Auth", description: "Customer authentication" },
      { name: "Orders", description: "Order management" },
      { name: "Admin", description: "Admin-only operations (requires admin JWT)" },
      { name: "Stripe", description: "Payment processing" },
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
        Watch: {
          type: "object",
          properties: {
            watch_id: { type: "integer" },
            watch_name: { type: "string" },
            brand: { type: "string" },
            price: { type: "string" },
            image_url: { type: "string" },
            stock_quantity: { type: "integer" },
            description: { type: "string" },
          },
        },
        Order: {
          type: "object",
          properties: {
            order_id: { type: "integer" },
            customer_id: { type: "integer", nullable: true },
            total_amount: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            },
            shipping_address: { type: "string" },
            order_date: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.ts", "./app.ts"],
};

export default swaggerJsdoc(options);
