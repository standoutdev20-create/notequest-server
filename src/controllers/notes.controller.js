import { Note } from "../models/Note.js";
import { notFound } from "../utils/http.js";
import { logEvent } from "../utils/logEvent.js";

const COLORS = ["yellow", "blue", "green", "pink", "purple"];
const SOURCE_TYPES = ["article", "path", "lesson", "subject"];

function readBody(body = {}) {
  const out = {};
  if (body.title !== undefined) out.title = String(body.title).trim().slice(0, 200) || "Untitled note";
  if (body.body !== undefined) out.body = String(body.body).slice(0, 100_000);
  if (body.color !== undefined && COLORS.includes(body.color)) out.color = body.color;
  if (body.quote !== undefined) out.quote = String(body.quote).slice(0, 2000);
  return out;
}

export async function listMine(req, res) {
  const filter = { user: req.user._id };
  if (req.query.source) filter["source.slug"] = String(req.query.source);
  if (req.query.sourcePrefix) filter["source.slug"] = new RegExp(`^${String(req.query.sourcePrefix).replace(/[^a-z0-9/-]/gi, "")}`);
  if (req.query.type) filter["source.type"] = String(req.query.type);
  const notes = await Note.find(filter).sort({ updatedAt: -1 });
  res.json({ notes });
}

export async function getMine(req, res) {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw notFound("Note not found");
  res.json({ note });
}

export async function create(req, res) {
  const data = { title: "Untitled note", body: "", ...readBody(req.body) };
  const src = req.body?.source;
  if (src && SOURCE_TYPES.includes(src.type) && src.slug) {
    data.source = {
      type: src.type,
      slug: String(src.slug).slice(0, 120),
      title: src.title ? String(src.title).slice(0, 200) : undefined,
    };
  }
  const note = await Note.create({ ...data, user: req.user._id });
  await logEvent({ user: req.user._id, type: "note_created", target: note.id, meta: data.source });
  res.status(201).json({ note });
}

export async function update(req, res) {
  const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, readBody(req.body), {
    returnDocument: "after",
    runValidators: true,
  });
  if (!note) throw notFound("Note not found");
  await logEvent({ user: req.user._id, type: "note_updated", target: note.id });
  res.json({ note });
}

export async function remove(req, res) {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) throw notFound("Note not found");
  await logEvent({ user: req.user._id, type: "note_deleted", target: note.id, meta: { title: note.title } });
  res.status(204).end();
}
