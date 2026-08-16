# Decoupled Resume Documents

A Resume Document is stored as a fully independent JSON record — a deep copy of the Master Profile taken at creation time — not as relational links to it. Edits to a document never touch the Master Profile or any other document, and a Master Profile re-import cannot corrupt existing documents. New documents can be cloned from any existing document, not only the Master Profile.
