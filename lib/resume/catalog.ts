import type { SectionCatalog } from "./types";

export const sectionCatalog: SectionCatalog = [
  {
    id: "professional-summary",
    title: "Professional Summary",
    keywords: ["professional summary", "summary", "career summary", "profile"],
    fields: ["paragraph"],
  },
  {
    id: "experience",
    title: "Experience",
    keywords: ["experience", "work history", "employment history", "work experience", "professional experience"],
    fields: ["title", "subtitle", "dates", "bullets"],
  },
  {
    id: "education",
    title: "Education",
    keywords: ["education", "academic background", "academic qualifications", "qualifications"],
    fields: ["title", "subtitle", "dates"],
  },
  {
    id: "skills",
    title: "Skills",
    keywords: ["skills", "technical skills", "core competencies", "areas of expertise"],
    fields: ["title", "tags"],
  },
  {
    id: "projects",
    title: "Projects",
    keywords: ["projects", "project experience", "personal projects"],
    fields: ["title", "subtitle", "bullets"],
  },
  {
    id: "publications",
    title: "Publications",
    keywords: ["publications", "papers", "research publications"],
    fields: ["text-line"],
    textLineStyle: "paragraph",
  },
  {
    id: "extracurricular-activities",
    title: "Extracurricular Activities",
    keywords: ["extracurricular activities", "extracurriculars", "activities and leadership", "leadership and activities"],
    fields: ["title", "dates", "bullets"],
  },
  {
    id: "references",
    title: "References",
    keywords: ["references", "referees", "recommendations"],
    fields: ["title", "text-line"],
  },
];
