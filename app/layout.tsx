import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-faire-octave",
  subsets: ["latin"],
  weight: "300",
  display: "swap",
});

const inter = Inter({
  variable: "--font-suisse-intl",
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
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
