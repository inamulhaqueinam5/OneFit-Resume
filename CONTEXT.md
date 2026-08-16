# OneFit Resume

A web application that turns a predefined Word resume template into an editable one-page PDF, removing the need to maintain MS Word files. It keeps one Master Profile as the baseline and produces any number of independent Resume Documents tailored to specific job applications.

## Language

**Master Profile**:
The user's primary repository of all default resume data (Sections and Entries), used as the baseline for creating new Resume Documents.
_Avoid_: Main profile, default resume

**Resume Document**:
An independent, editable, and clonable resume instance tailored for a specific job application. It is a copy at creation time; modifying it does not affect the Master Profile, and vice versa.
_Avoid_: Draft, tailored resume, snapshot, saved version

**Section**:
A distinct category of information within a resume (e.g. Education, Experience).
_Avoid_: Category, block

**Entry**:
A single specific record within a Section (e.g. a specific degree or a specific job role).
_Avoid_: Item, detail, row

**Entry Field**:
A typed element within an Entry (e.g. title, subtitle, dates, bullets, paragraph, tags, text-line). Each Section declares which fields its Entries use.
_Avoid_: Column, property, attribute

**Contact**:
The fixed header block of a resume holding the person's details (name, email, phone, links). Unlike a Section, it is a single typed instance and is not reorderable.
_Avoid_: Header, personal info

**Profile Picture**:
The square photo shown in the top-right of a resume's header, stored in its original form and masked into a circle by the UI. Every Resume Document carries its own copy, independent of the Master Profile's.
_Avoid_: Avatar, photo

**Custom Section**:
A Section added by the user within a Resume Document that does not belong to the official template's typed Section set. It is stored as a generic title with free-text Entries and lives only in that document.
_Avoid_: Unknown section, ad-hoc section

**Section Catalog**:
The data-driven set of Section types a resume can contain, derived from the official template rather than hardcoded. A Resume Document draws its Sections from it and can show, hide, add, or remove them per document.
_Avoid_: Section registry, hardcoded sections, known sections

**Compression**:
The per-document scale reduction that shrinks a Resume Document in 10% steps so its content fits on a single page. It is persisted on the document and mirrored exactly in the exported PDF.
_Avoid_: Zoom, shrink, scale-down
