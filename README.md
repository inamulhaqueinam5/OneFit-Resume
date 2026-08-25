# OneFit Resume

A web application that turns a predefined Word resume template into an editable one-page PDF — no more maintaining MS Word files. Keep one **Master Profile** as your baseline and produce any number of independent **Resume Documents** tailored to specific job applications.

## Features

- **Master Profile editor** (`/dashboard`) — edit all default resume data: Contact, Sections, Entries, Entry Fields, profile picture, links, with drag-and-drop reordering and autosave.
- **Resume Documents** (`/documents`) — create documents from the Master Profile or clone existing ones; each document is independently editable and tailorable.
- **Document editor** (`/documents/[id]`) — same editing surface as the Master Profile, plus Custom Sections, per-document tailoring, and Compression (10% steps to fit one page).
- **Live A4 preview** — side-by-side on desktop, Edit/Preview switcher on mobile.
- **DOCX Import** (`/import`) — download the Official Template, fill it in Word, import back; rule-based parsing with a mandatory review step before writing to the Master Profile.
- **Print / PDF export** — native browser print with exact A4 output; app styling never leaks into the printed resume.
- **Newsprint UI** — editorial design system (warm paper, ink, restrained red) applied to all app chrome.

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Auth | Clerk |
| Database | PostgreSQL (Neon) via Prisma |
| Styling | Tailwind CSS v4, shared primitives in `components/ui/` |
| DOCX parsing | mammoth + cheerio (rule-based, no AI) |
| File uploads | Cloudinary (profile pictures) |
| Drag & drop | dnd-kit |
| Testing | Vitest + Testing Library |

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env` from `.env.example` and fill in:
   - `DATABASE_URL` — a Neon/PostgreSQL connection string
   - Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
   - `CLOUDINARY_URL` — for profile-picture uploads

3. Set up the database schema:

   ```sh
   npx prisma generate
   npx prisma db push
   ```

4. Run the dev server:

   ```sh
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000), sign in, and start from `/dashboard`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Vitest in watch mode |
| `npm run test:ci` | Vitest single run |

## Documentation

- [`CONTEXT.md`](./CONTEXT.md) — domain glossary (canonical vocabulary: Master Profile, Resume Document, Section, Entry, Entry Field, Contact, Profile Picture, Custom Section, Section Catalog, Official Template, Compression, Import)
- [`DESIGN.md`](./DESIGN.md) — the Newsprint design system spec
- [`PRODUCT.md`](./PRODUCT.md) — product schema and brand commitments
- [`docs/adr/`](./docs/adr/) — architecture decision records (parsing, printing, document model, compression, section catalog, rendering ownership, Newsprint theme)
- [`AGENTS.md`](./AGENTS.md) — conventions for coding agents

## Architecture Notes

- Resume data is stored as a JSON blob per user (`MasterProfile`) and per document (`ResumeDocument`); writes use optimistic concurrency (`writeVersion`).
- The printable resume surface (`components/resume/`) is a deliberately isolated design system (A4, Arial) — see ADR-0006 and ADR-0007.
- Master Profile saves retry on write conflicts; unsaved changes are flushed via `sendBeacon` when leaving the page.
