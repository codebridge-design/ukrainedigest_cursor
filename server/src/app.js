const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

function normalizeOrigin(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return null;
  if (raw === "*") return "*";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function parseAllowedOrigins(value) {
  return String(value || "http://localhost:8080")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);
const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin(origin, callback) {
      // Allow health checks / curl / server-to-server calls.
      if (!origin || allowAllOrigins) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      callback(null, Boolean(normalized && allowedOrigins.includes(normalized)));
    },
  }),
);

app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

app.use(errorHandler);

module.exports = { app };
