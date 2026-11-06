import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Repas",
  description: "Planning des repas et liste de courses du Foyer",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <main className="mx-auto w-full max-w-xl flex-1 p-4">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
