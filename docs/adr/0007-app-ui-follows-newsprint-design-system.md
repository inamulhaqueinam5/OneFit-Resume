# App UI Follows the Newsprint Design System

Supersedes the Ease Health botanical theme for app chrome.

The app's UI chrome (editor, navigation, document list, import/review wizard, buttons, modals, auth screens, landing) follows a permanent light Newsprint system: warm paper `#F9F9F7`, ink `#111111`, rule `#E5E5E0`, editorial red `#CC0000`, sharp 0-radius geometry, flat surfaces with structural borders, Playfair Display (display), Lora (body), Inter (UI), and JetBrains Mono (metadata), with deliberate fallbacks. Tokens live in `app/styles/newsprint-theme.css` and are wired through `app/globals.css`. Shared primitives live under `components/ui/`.

The resume page itself (A4 preview + print CSS) remains a separate design surface that keeps the official template's exact design per ADR-0006; Newsprint must never leak into ResumeRenderer.

Botanical token names in older components may temporarily alias to Newsprint values until those routes are restyled in later tickets.
