# Rule-Based Document Parsing Without AI

Uploaded Word files are parsed with Mammoth.js plus custom rule-based heuristics (heading tags, regex, and user-defined keywords) instead of an LLM. This keeps extraction free of third-party AI API dependencies and deterministically accurate for the official OneFit template, accepting that arbitrary resumes parse only best-effort. Import always passes through a review step, where unmatched content is shown to the user, before the Master Profile is created or overwritten.
