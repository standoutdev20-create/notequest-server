/**
 * Normalise rich-content sections coming from the CRM editor.
 * Accepts `{ heading, body | paragraphs, code, language }` and returns
 * `{ heading, paragraphs[], code?, language? }` with empty sections dropped.
 */
export function readSections(input) {
  return (Array.isArray(input) ? input : [])
    .map((s) => {
      const paragraphs = Array.isArray(s.paragraphs) ? s.paragraphs.map(String) : String(s.body || "").split(/\n\s*\n/);
      const section = {
        heading: String(s.heading || "").trim().slice(0, 200),
        paragraphs: paragraphs.map((p) => p.trim()).filter(Boolean),
      };
      if (String(s.code || "").trim()) section.code = String(s.code).replace(/\s+$/, "");
      if (String(s.language || "").trim()) section.language = String(s.language).trim().slice(0, 30);
      return section;
    })
    .filter((s) => s.heading || s.paragraphs.length || s.code);
}

export function readList(input, max = 20, len = 200) {
  const arr = Array.isArray(input) ? input : String(input || "").split("\n");
  return arr.map((x) => String(x).trim().slice(0, len)).filter(Boolean).slice(0, max);
}
