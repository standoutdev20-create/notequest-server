import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { badRequest } from "../utils/http.js";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${crypto.randomBytes(12).toString("hex")}.${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(badRequest("Image must be a JPG, PNG, WebP or GIF.")),
}).single("image");
