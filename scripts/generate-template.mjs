// Generates the blank official OneFit template (.docx) served by the app.
// Run from the repo root: `node scripts/generate-template.mjs`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "..", "public", "official-template.docx");

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const text = (content) =>
  `<w:t xml:space="preserve">${escapeXml(content)}</w:t>`;

const run = (content, { bold = false } = {}) =>
  `<w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}${text(content)}</w:r>`;

const hyperlink = (id, content) =>
  `<w:hyperlink r:id="${id}" w:history="1">${run(content)}</w:hyperlink>`;

const paragraph = (children, { indent = false } = {}) =>
  `<w:p>${indent ? '<w:pPr><w:ind w:left="360"/></w:pPr>' : ""}${children}</w:p>`;

const bulletItem = (content) =>
  `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${run(
    content,
  )}</w:p>`;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const heading = (title) => paragraph(run(title, { bold: true }));

const cell = (children, { width } = {}) =>
  `<w:tc><w:tcPr><w:tcW w:w="${width ?? 8500}" w:type="dxa"/></w:tcPr>${children}</w:tc>`;

// Relationships collected as the document body is assembled, in order of use.
const rels = [];
const rel = (target, mode = "External") => {
  const id = `rId${rels.length + 1}`;
  rels.push({ id, target, mode });
  return id;
};

const contactTable = () => {
  const email = rel("mailto:you@example.com");
  const phone = rel("tel:+10000000000");
  const linkedin = rel("https://www.linkedin.com/in/your-handle");
  const github = rel("https://github.com/your-handle");

  const left = [
    paragraph(run("Your Name", { bold: true })),
    paragraph(run("Your Tagline")),
    paragraph(
      run("Email: ", { bold: true }) +
        hyperlink(email, "you@example.com") +
        run("  |  Phone: ", { bold: true }) +
        hyperlink(phone, "+1 (000) 000-0000"),
    ),
    paragraph(
      run("Location: ", { bold: true }) +
        run("Your City, Country") +
        run(" | ", { bold: true }) +
        hyperlink(linkedin, "LinkedIn") +
        run(" | ", { bold: true }) +
        hyperlink(github, "GitHub"),
    ),
    paragraph(run("Availability: ", { bold: true }) + run("Full-Time")),
  ].join("");

  return (
    `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/></w:tblPr>` +
    `<w:tblGrid><w:gridCol w:w="8500"/><w:gridCol w:w="1000"/></w:tblGrid>` +
    `<w:tr>${cell(left, { width: 8500 })}${cell(
      '<w:p><w:pPr><w:jc w:val="right"/></w:pPr></w:p>',
      { width: 1000 },
    )}</w:tr>` +
    `</w:tbl>`
  );
};

const body = [
  contactTable(),
  heading("Professional Summary"),
  paragraph(run("Write a short summary of your background and goals.")),
  heading("Experience"),
  paragraph(
    run("Job Title", { bold: true }) +
      run("Company Name") +
      run("  |  ", { bold: true }) +
      run("2020 – 2024"),
  ),
  bulletItem("Describe a key responsibility or achievement."),
  heading("Education"),
  paragraph(run("Degree", { bold: true }) + run("2020 – 2024")),
  paragraph(run("Institution | GPA: 3.5 / 4.0")),
  heading("Skills"),
  paragraph(
    run("Category: ", { bold: true }) + run("Skill One, Skill Two, Skill Three"),
  ),
  heading("Projects"),
  paragraph(run("Project Name", { bold: true }) + run("Link")),
  bulletItem("Describe the project."),
  heading("Publications"),
  paragraph(run("Publication title — authors, venue, year")),
  heading("Extracurricular Activities"),
  paragraph(run("Activity", { bold: true }) + run("2024 – 2025")),
  bulletItem("Describe the activity."),
  heading("References"),
  paragraph(
    run("Referee Name", { bold: true }) +
      run(", Title, Organization — email: referee@example.com"),
  ),
].join("");

const documentXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:document xmlns:w="${W}" xmlns:r="${R}"><w:body>` +
  body +
  `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>` +
  `</w:body></w:document>`;

const documentRelsXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  rels
    .map(
      (r) =>
        `<Relationship Id="${r.id}" Type="${R}/hyperlink" Target="${escapeXml(
          r.target,
        )}" TargetMode="${r.mode}"/>`,
    )
    .join("") +
  `</Relationships>`;

const contentTypesXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
  `</Types>`;

const rootRelsXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/>` +
  `</Relationships>`;

const stylesXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:styles xmlns:w="${W}">` +
  `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault/></w:docDefaults>` +
  `<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:qFormat/></w:style>` +
  `</w:styles>`;

const numberingXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:numbering xmlns:w="${W}">` +
  `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val=""/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>` +
  `<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>` +
  `</w:numbering>`;

const files = {
  "[Content_Types].xml": contentTypesXml,
  "_rels/.rels": rootRelsXml,
  "word/document.xml": documentXml,
  "word/_rels/document.xml.rels": documentRelsXml,
  "word/styles.xml": stylesXml,
  "word/numbering.xml": numberingXml,
};

const zip = new JSZip();
for (const [name, content] of Object.entries(files)) {
  zip.file(name, content);
}

const buffer = await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
