import type { SectionCatalog } from "./types";

export const sectionCatalog: SectionCatalog = [
  {
    id: "professional-summary",
    title: "Professional Summary",
    keywords: ["professional summary"],
    fields: ["paragraph"],
  },
  {
    id: "experience",
    title: "Experience",
    keywords: ["experience"],
    fields: ["title", "subtitle", "dates", "bullets"],
  },
  {
    id: "education",
    title: "Education",
    keywords: ["education"],
    fields: ["title", "subtitle", "dates"],
  },
  {
    id: "skills",
    title: "Skills",
    keywords: ["skills"],
    fields: ["title", "tags"],
  },
  {
    id: "projects",
    title: "Projects",
    keywords: ["projects"],
    fields: ["title", "subtitle", "bullets"],
  },
  {
    id: "publications",
    title: "Publications",
    keywords: ["publications"],
    fields: ["text-line"],
    textLineStyle: "paragraph",
  },
  {
    id: "extracurricular-activities",
    title: "Extracurricular Activities",
    keywords: ["extracurricular activities"],
    fields: ["title", "dates", "bullets"],
  },
  {
    id: "references",
    title: "References",
    keywords: ["references"],
    fields: ["title", "text-line"],
  },
];
