import http from "http";

const options: http.RequestOptions = {
  host: "localhost",
  port: process.env.PORT ?? 5000,
  path: "/ready",
  timeout: 2000,
};

const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on("error", () => process.exit(1));
req.on("timeout", () => process.exit(1));
req.end();
