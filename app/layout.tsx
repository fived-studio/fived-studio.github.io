import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fived-studio.github.io"),
  title: "FiveD Studio — Five engineers. One studio. Software that ships.",
  description:
    "FiveD Studio is a five-person product studio from Saigon. We build real software with real users — from coffee shop POS to AI-assisted commerce.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title: "FiveD Studio",
    description: "Five engineers. One studio. Software that ships.",
    url: "https://fived-studio.github.io",
    images: [{ url: "/og.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <div className="grid-bg" aria-hidden="true" />
        <div className="glow glow-1" aria-hidden="true" />
        <div className="glow glow-2" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
