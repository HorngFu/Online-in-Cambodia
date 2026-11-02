import type { Metadata } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import en from "@/i18n/dictionaries/en.json";
import km from "@/i18n/dictionaries/km.json";
import "./globals.css";

// Shown for URLs that match no route at all, where the language is unknown,
// so the page is bilingual.

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
});

export const metadata: Metadata = {
  title: `${en.notFound.title} · ${en.site.name}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${kantumruy.variable} h-full antialiased`}
    >
      <body className="flex min-h-full items-center justify-center px-4">
        <main className="flex max-w-xl flex-col gap-8 py-16">
          {[
            { lang: "en", dict: en },
            { lang: "km", dict: km },
          ].map(({ lang, dict }) => (
            <section key={lang} lang={lang} className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {dict.notFound.title}
              </h1>
              <p className="text-muted">{dict.notFound.text}</p>
              <a href={`/${lang}`} className="text-accent hover:underline">
                {dict.notFound.home}
              </a>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
