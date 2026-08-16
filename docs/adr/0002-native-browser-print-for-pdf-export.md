# Native Browser Print for PDF Export

The final PDF is produced by native browser printing with CSS `@page` media queries rather than a PDF library like @react-pdf/renderer. Rendering the same DOM twice — once for the web preview and once for print — guarantees the exported PDF mirrors the preview exactly, including compression scaling, without duplicating layout logic. The official template and the print CSS target A4 page size.
