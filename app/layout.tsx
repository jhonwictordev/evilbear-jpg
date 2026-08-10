import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") || "evilbear.jpg";
  const protocol = host.includes("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = protocol + "://" + host;

  return {
    metadataBase: new URL(origin),
    title: "EVILBEAR.JPG — Sound, Visual & Identity",
    description: "Independent creative identity from Brazil creating music, design, illustration and audiovisual worlds.",
    keywords: ["beatmaker", "designer", "illustrator", "video editor", "Brazil", "EVILBEAR.JPG"],
    openGraph: {
      title: "EVILBEAR.JPG — Sound, Visual & Identity",
      description: "Creating sounds & visuals. Building worlds from Brazil to everywhere.",
      type: "website",
      images: [{ url: origin + "/og.jpg", width: 1536, height: 1024, alt: "EVILBEAR.JPG" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "EVILBEAR.JPG — Sound, Visual & Identity",
      description: "Creating sounds & visuals. Building worlds.",
      images: [origin + "/og.jpg"],
    },
    icons: { icon: "/mascot.png", shortcut: "/mascot.png" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
