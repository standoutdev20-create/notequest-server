export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details);
export const notFound = (msg = "Not found") => new HttpError(404, msg);

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function pageParams(query, defaultLimit = 25) {
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaultLimit));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, page, skip: (page - 1) * limit };
}
