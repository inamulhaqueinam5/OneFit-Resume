# Data-Driven Section Catalog

The set of Section types a resume can contain is stored as data — seeded from the official template and editable — not hardcoded in the application. Each Resume Document draws its Sections from this catalog and can show, hide, add, or remove Sections and Entries per document without code changes. We chose a data-driven catalog over a hardcoded type registry because the user's template defines the exact output and they must be free to hide or extend Sections per application.
