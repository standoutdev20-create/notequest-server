import mongoose from "mongoose";
import multer from "multer";
import { HttpError } from "../utils/http.js";

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err?.code === 11000) {
    status = 409;
    message = `A record with this ${Object.keys(err.keyValue || {}).join(", ") || "value"} already exists`;
  } else if (err instanceof multer.MulterError) {
    status = 400;
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && process.env.NODE_ENV === "production" ? "Internal server error" : message, details });
}
