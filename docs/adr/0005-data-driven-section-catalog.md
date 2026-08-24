# Data-Driven Section Catalog

The set of Section types a resume can contain is represented as data by a bundled, immutable array of `SectionCatalogItem`s. Each item carries a title, keywords, and Entry-field shape. Each Resume Document can show, hide, add, or remove Sections and Entries using this catalog without component changes.

For the MVP, the catalog describes the single official template and is resolved from the bundled constant. Import and re-import parse content against this catalog; they do not seed, mutate, or refresh it. Existing Resume Documents remain independent records and are not changed by a Master Profile re-import.

Dynamic catalog management is deferred to issue #14. It must not be implemented by mutating the current global catalog: documents currently persist `catalogId` rather than a catalog definition snapshot, while parsing, editing, and rendering resolve catalog metadata at runtime. Any future per-user or import-derived catalog requires immutable catalog versions or document-level snapshots, plus explicit migration rules, before catalog refresh or editing is enabled.
