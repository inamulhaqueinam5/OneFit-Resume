# App-Owned Rendering with Baked Design

The parser extracts content and structure (Sections, Entries, fields, bullets, run-level bold/italic) but never layout; the app's own CSS reproduces the official template's design exactly. Because the template is predefined, its design is a known constant we hand-craft in CSS rather than extracting from the docx — Mammoth.js is intentionally lossy on layout, and pixel-exact docx-to-web extraction is fragile. "Exact output" is verified by visually comparing the exported PDF against the template PDF.
