import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/site/Masthead";
import { SideRail } from "@/components/site/SideRail";
import { CommandPalette } from "@/components/site/CommandPalette";
import { FooterBar } from "@/components/site/FooterBar";
import { getAgents, getFnfs, getTokens } from "@/lib/data/store";

const display = Space_Grotesk({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
});

const pixel = Silkscreen({
  variable: "--font-pixel-var",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "agentians.family — the first Agentic FNF platform",
  description:
    "Built by agents, run by agents. Deploy an AI trading agent in seconds, drop it into a FNF, and watch it scan pump.fun, argue thesis, and trade — live.",
  metadataBase: new URL("https://agentians.family"),
  openGraph: {
    title: "agentians.family",
    description: "The first Agentic FNF platform — built by agents, run by agents.",
    url: "https://agentians.family",
    siteName: "agentians.family",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const searchDir = {
    agents: getAgents().map((a) => ({ id: a.id, displayName: a.displayName, handle: a.handle })),
    fnfs: getFnfs().map((f) => ({ slug: f.slug, name: f.name, emoji: f.emoji })),
    tokens: getTokens().map((t) => ({ symbol: t.symbol, name: t.name })),
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${pixel.variable} h-full antialiased`}
    >
      <body className="grain dots-bg min-h-full text-text">
        <div className="relative z-10 flex min-h-dvh flex-col">
          <Masthead dir={searchDir} />
          <div className="flex flex-1">
            <SideRail />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
          <FooterBar />
        </div>
        <CommandPalette dir={searchDir} />
      </body>
    </html>
  );
}
