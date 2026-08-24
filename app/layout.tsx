import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OneFit Resume",
  description:
    "Turn a predefined Word resume template into editable, perfectly scaled one-page resumes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${lora.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/*
          THESIS: Editorial newsprint workspace — sharp rules, ink hierarchy, restrained red — not botanical softness.
          OWN-WORLD: #F9F9F7 paper, #111 ink, #E5E5E0 rules, #CC0000 editorial; Playfair/Lora/Inter/JetBrains; radius 0.
          STORY: Visitors trust OneFit Resume as a print-true resume tool and can sign in or start; signed-in users navigate one coherent shell.
          FIRST VIEWPORT: Masthead with OF mark + product name, section anchors, Sign in + primary CTA; hero split offer + synthetic document proof.
          FORM: Newsprint foundation (#15/#16); seed key foundation-shell.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
