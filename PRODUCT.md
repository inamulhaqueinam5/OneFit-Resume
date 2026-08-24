# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Job seekers and professionals who maintain a OneFit Word resume template and need many tailored one-page PDF variants without re-editing Word each time.

## Product Purpose

Turn a predefined Word resume template into an editable one-page PDF workflow. Keep one Master Profile as the baseline and produce independent Resume Documents tailored to specific applications.

## Positioning

Rule-based DOCX import of the official OneFit template, a single Master Profile baseline, independent Resume Documents, live A4 preview, per-document Compression, and native browser print — without AI parsing and without changing the official printed resume template.

## Brand Commitments

- Product name: OneFit Resume
- Domain vocabulary: Master Profile, Resume Document, Section, Entry, Entry Field, Contact, Profile Picture, Custom Section, Section Catalog, Compression
- Preserve existing product copy and route information architecture unless a ticket says otherwise
- App chrome may change; the official resume template / ResumeRenderer print surface must not

## Accessibility

- Semantic landmarks, headings, labels, and image alternative text
- Keyboard access with visible focus
- Minimum 44px touch targets on interactive controls
- Respect `prefers-reduced-motion`
- Usable font fallbacks when remote fonts fail

## Constraints

- Next.js, React, Tailwind, Clerk, Vitest stay in place
- No dark mode / second theme in this redesign
- No new product functionality or API behavior as part of the Newsprint redesign
- ResumeRenderer and print/PDF behavior are isolated from app UI styling (ADR-0006)
