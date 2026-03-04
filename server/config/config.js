"use strict";

const common = {
  dialect: "postgres",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_DATABASE || "jwtauth",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  logging: false,
};

module.exports = {
  development: {
    ...common,
    ssl: process.env.DB_SSL === "true",
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
  },
  test: {
    ...common,
    database: process.env.DB_DATABASE || "jwtauth_test",
  },
  production: {
    ...common,
    ssl: process.env.DB_SSL === "true",
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
  },
};
