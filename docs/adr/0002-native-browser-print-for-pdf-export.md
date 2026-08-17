# Native Browser Print for PDF Export

The final PDF is produced by native browser printing with CSS `@page` media queries rather than a PDF library like @react-pdf/renderer. The editor's preview renderer is also the sole print target, so the surrounding editing controls are excluded without duplicating layout logic. Layout-aware compression reflows in the same DOM before pagination, and the official template and print CSS target A4 page size.
