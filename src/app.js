import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (process.env.NODE_ENV !== "test") app.use(morgan(env.isProd ? "combined" : "dev"));

  app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "365d", immutable: true }));
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
