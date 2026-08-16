import { load, type Cheerio, type CheerioAPI } from "cheerio";
import { isTag, isText, type ChildNode, type Element } from "domhandler";
import { sectionCatalog } from "./catalog";
import { newId } from "./id";
import { createEmptyContact } from "./operations";
import {
  type Contact,
  type Entry,
  type EntryField,
  type EntryFieldKind,
  type ParseResult,
  type Resume,
  type ReviewItem,
  type SectionCatalogItem,
  type TextRun,
} from "./types";

const DATE_RE = /\b\d{4}\b/;

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function isDateText(text: string): boolean {
  return DATE_RE.test(text);
}

function trimRuns(runs: TextRun[]): TextRun[] {
  const result = runs.map((run) => ({ ...run }));
  while (result.length > 0 && result[0].text.trim() === "") result.shift();
  while (result.length > 0 && result[result.length - 1].text.trim() === "") result.pop();
  if (result.length > 0) {
    result[0] = { ...result[0], text: result[0].text.trimStart() };
    result[result.length - 1] = {
      ...result[result.length - 1],
      text: result[result.length - 1].text.trimEnd(),
    };
  }
  return result.filter((run) => run.text.length > 0);
}

function extractRuns($: CheerioAPI, $el: Cheerio<Element>): TextRun[] {
  const runs: TextRun[] = [];

  const walk = (node: ChildNode, bold: boolean, italic: boolean, href: string | null) => {
    if (isText(node)) {
      runs.push({ text: node.data, bold, italic, href });
      return;
    }
    if (!isTag(node)) return;

    const name = node.name.toLowerCase();
    const nextBold = bold || name === "strong" || name === "b";
    const nextItalic = italic || name === "em" || name === "i";
    const nextHref = name === "a" ? (node.attribs?.href ?? href) : href;

    for (const child of node.children) {
      walk(child, nextBold, nextItalic, nextHref);
    }
  };

  for (const node of $el.get()) {
    for (const child of node.children) {
      walk(child, false, false, null);
    }
  }

  return runs;
}

function textOf($: CheerioAPI, $el: Cheerio<Element>): string {
  return extractRuns($, $el)
    .map((run) => run.text)
    .join("")
    .trim();
}

function isBoldOnly($: CheerioAPI, $el: Cheerio<Element>): boolean {
  const runs = extractRuns($, $el).filter((run) => run.text.trim().length > 0);
  return runs.length > 0 && runs.every((run) => run.bold);
}

function boldRuns(runs: TextRun[]): TextRun[] {
  return runs.filter((run) => run.bold);
}

function stripLeadingSeparator(runs: TextRun[]): TextRun[] {
  const trimmed = trimRuns(runs);
  if (trimmed.length === 0) return trimmed;
  trimmed[0] = { ...trimmed[0], text: trimmed[0].text.replace(/^[\s|—–·,]+/, "") };
  return trimmed.filter((run) => run.text.length > 0);
}

function splitHeadingRuns(runs: TextRun[]): {
  title: TextRun[];
  subtitle: TextRun[];
  dates: TextRun[];
} {
  return {
    title: runs.filter((run) => run.bold),
    subtitle: runs.filter((run) => !run.bold && !isDateText(run.text)),
    dates: runs.filter((run) => !run.bold && isDateText(run.text)),
  };
}

function matchCatalog(text: string): SectionCatalogItem | undefined {
  const norm = normalize(text);
  return sectionCatalog.find((item) =>
    [item.title, ...item.keywords].some((name) => normalize(name) === norm),
  );
}

function collectBullets(
  $: CheerioAPI,
  elements: Element[],
  startIndex: number,
): { items: TextRun[][]; nextIndex: number } {
  const items: TextRun[][] = [];
  let index = startIndex;
  while (index < elements.length) {
    const tag = elements[index].name.toLowerCase();
    if (tag !== "ul" && tag !== "ol") break;
    $(elements[index])
      .find("li")
      .each((_, li) => {
        items.push(trimRuns(extractRuns($, $(li))));
      });
    index += 1;
  }
  return { items, nextIndex: index };
}

function parseFieldGroup($: CheerioAPI, elements: Element[], fields: EntryFieldKind[]): Entry[] {
  const wanted = new Set(fields);
  const entries: Entry[] = [];
  let index = 0;
  while (index < elements.length) {
    const element = elements[index];
    if (element.name.toLowerCase() !== "p") {
      index += 1;
      continue;
    }

    const { title, subtitle, dates } = splitHeadingRuns(extractRuns($, $(element)));
    const { items, nextIndex } = collectBullets($, elements, index + 1);

    const entryFields: EntryField[] = [];
    if (title.length && wanted.has("title")) entryFields.push({ kind: "title", runs: trimRuns(title) });
    if (subtitle.length && wanted.has("subtitle")) {
      entryFields.push({ kind: "subtitle", runs: stripLeadingSeparator(subtitle) });
    }
    if (dates.length && wanted.has("dates")) entryFields.push({ kind: "dates", runs: trimRuns(dates) });
    if (items.length && wanted.has("bullets")) entryFields.push({ kind: "bullets", items });

    entries.push({ id: newId(), fields: entryFields });
    index = nextIndex;
  }
  return entries;
}

function parseEducation($: CheerioAPI, elements: Element[]): Entry[] {
  const entries: Entry[] = [];
  let current: Entry | null = null;

  for (const element of elements) {
    if (element.name.toLowerCase() !== "p") continue;
    const runs = extractRuns($, $(element));
    const hasBold = runs.some((run) => run.bold);

    if (hasBold) {
      const { title, dates } = splitHeadingRuns(runs);
      const fields: EntryField[] = [];
      if (title.length) fields.push({ kind: "title", runs: trimRuns(title) });
      if (dates.length) fields.push({ kind: "dates", runs: trimRuns(dates) });
      current = { id: newId(), fields };
      entries.push(current);
    } else if (current) {
      const subtitle = trimRuns(runs);
      if (subtitle.length) current.fields.push({ kind: "subtitle", runs: subtitle });
    }
  }
  return entries;
}

function parseSkills($: CheerioAPI, elements: Element[]): Entry[] {
  const entries: Entry[] = [];

  for (const element of elements) {
    if (element.name.toLowerCase() !== "p") continue;
    const runs = extractRuns($, $(element));
    const title = trimRuns(boldRuns(runs));
    const plainText = runs
      .filter((run) => !run.bold)
      .map((run) => run.text)
      .join("")
      .trim();

    const fields: EntryField[] = [];
    if (title.length) fields.push({ kind: "title", runs: trimColon(title) });
    const tags = plainText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags.length) fields.push({ kind: "tags", items: tags });

    entries.push({ id: newId(), fields });
  }
  return entries;
}

function trimColon(runs: TextRun[]): TextRun[] {
  const result = trimRuns(runs);
  if (result.length === 0) return result;
  const last = result[result.length - 1];
  result[result.length - 1] = { ...last, text: last.text.replace(/:+\s*$/, "") };
  return result.filter((run) => run.text.length > 0);
}

function parseTextLines($: CheerioAPI, elements: Element[]): Entry[] {
  const entries: Entry[] = [];
  for (const element of elements) {
    const tag = element.name.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      $(element)
        .find("li")
        .each((_, li) => {
          const runs = trimRuns(extractRuns($, $(li)));
          if (runs.length) entries.push({ id: newId(), fields: [{ kind: "text-line", runs }] });
        });
    } else if (tag === "p") {
      const runs = trimRuns(extractRuns($, $(element)));
      if (runs.length) entries.push({ id: newId(), fields: [{ kind: "text-line", runs }] });
    }
  }
  return entries;
}

function parseReferences($: CheerioAPI, elements: Element[]): Entry[] {
  const entries: Entry[] = [];
  let current: Entry | null = null;

  for (const element of elements) {
    if (element.name.toLowerCase() !== "p") continue;
    const runs = extractRuns($, $(element));
    const text = runs.map((run) => run.text).join("").trim();
    const isEmailLine = /^email\s*:/i.test(text);

    if (isEmailLine) {
      const line = trimRuns(runs);
      if (line.length) {
        if (current) {
          current.fields.push({ kind: "text-line", runs: line });
        } else {
          current = { id: newId(), fields: [{ kind: "text-line", runs: line }] };
          entries.push(current);
        }
      }
      continue;
    }

    const title = trimRuns(boldRuns(runs));
    const rest = stripLeadingSeparator(runs.filter((run) => !run.bold));
    current = { id: newId(), fields: [] };
    if (title.length) current.fields.push({ kind: "title", runs: title });
    if (rest.length) current.fields.push({ kind: "text-line", runs: rest });
    entries.push(current);
  }
  return entries;
}

function parseSectionEntries(
  catalogItem: SectionCatalogItem,
  elements: Element[],
  $: CheerioAPI,
): Entry[] {
  switch (catalogItem.id) {
    case "professional-summary":
      return [
        {
          id: newId(),
          fields: [
            {
              kind: "paragraph",
              runs: trimRuns(
                elements
                  .filter((el) => el.name.toLowerCase() === "p")
                  .flatMap((el) => extractRuns($, $(el))),
              ),
            },
          ],
        },
      ];
    case "experience":
    case "projects":
    case "extracurricular-activities":
      return parseFieldGroup($, elements, catalogItem.fields);
    case "education":
      return parseEducation($, elements);
    case "skills":
      return parseSkills($, elements);
    case "publications":
      return parseTextLines($, elements);
    case "references":
      return parseReferences($, elements);
    default:
      return [];
  }
}

function extractContact($: CheerioAPI, $cell: Cheerio<Element>): Contact {
  const paragraphs = $cell.find("p").toArray();

  const name = paragraphs.length > 0 ? textOf($, $(paragraphs[0])) : "";
  const tagline = paragraphs.length > 1 ? textOf($, $(paragraphs[1])) : "";

  const email = $cell.find('a[href^="mailto:"]').first().attr("href")?.replace(/^mailto:/, "") ?? "";
  const phone = $cell.find('a[href^="tel:"]').first().attr("href")?.replace(/^tel:/, "") ?? "";

  const links = $cell
    .find('a[href^="http"]')
    .toArray()
    .map((el) => ({ label: textOf($, $(el)), href: $(el).attr("href") ?? "" }));

  const locationParagraph = $cell
    .find("p")
    .filter((_, el) => $(el).text().includes("Location:"))
    .first();
  const location = locationParagraph.length
    ? extractRuns($, locationParagraph)
        .filter((run) => !run.bold && run.href === null)
        .map((run) => run.text)
        .join("")
        .trim()
    : "";

  const availabilityParagraph = $cell
    .find("p")
    .filter((_, el) => $(el).text().includes("Availability:"))
    .first();
  const availability = availabilityParagraph.length
    ? extractRuns($, availabilityParagraph)
        .filter((run) => !run.bold && run.href === null)
        .map((run) => run.text)
        .join("")
        .trim()
    : "";

  return { name, tagline, email, phone, location, links, availability };
}

export function parseDocx(html: string): ParseResult {
  const $ = load(html);
  const resume: Resume = {
    id: newId(),
    contact: createEmptyContact(),
    profilePicture: null,
    sections: [],
    compressionLevel: 100,
  };
  const review: ReviewItem[] = [];

  const $table = $("table").first();
  if ($table.length) {
    const cells = $table.find("td");
    if (cells.length > 0) {
      resume.contact = extractContact($, cells.first());
    }
    const imgSrc = $table.find("img").first().attr("src");
    if (imgSrc) {
      resume.profilePicture = { dataUrl: imgSrc };
    }
  }

  const topLevel = $table.length ? $table.first().nextAll() : $("body").children();

  let currentCatalogItem: SectionCatalogItem | null = null;
  let currentElements: Element[] = [];

  const flush = () => {
    if (currentCatalogItem) {
      const entries = parseSectionEntries(currentCatalogItem, currentElements, $);
      resume.sections.push({
        id: newId(),
        catalogId: currentCatalogItem.id,
        title: currentCatalogItem.title,
        entries,
        visible: true,
      });
    }
    currentCatalogItem = null;
    currentElements = [];
  };

  topLevel.each((_, node) => {
    const tag = node.name.toLowerCase();
    const text = $(node).text().trim();

    if (tag === "p") {
      const catalogItem = matchCatalog(text);
      if (catalogItem) {
        flush();
        currentCatalogItem = catalogItem;
        currentElements = [];
        return;
      }
      if (!currentCatalogItem && isBoldOnly($, $(node))) {
        review.push({ kind: "unmatched-heading", text: normalize(text) });
        return;
      }
    }

    if (currentCatalogItem) {
      currentElements.push(node);
    } else if (tag === "img" && text.length === 0) {
      review.push({ kind: "unmatched-image", text: $(node).attr("src") ?? "" });
    } else if (text.length > 0) {
      review.push({ kind: "unmatched-content", text: normalize(text) });
    }
  });

  flush();

  return { resume, review };
}
