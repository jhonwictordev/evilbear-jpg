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
    title: "EVILBEAR.JPG — Som, Visual & Identidade",
    description: "Identidade criativa independente do Brasil, criando música, design, ilustração e mundos audiovisuais.",
    keywords: ["beatmaker", "designer", "illustrator", "video editor", "Brazil", "EVILBEAR.JPG"],
    openGraph: {
      title: "EVILBEAR.JPG — Som, Visual & Identidade",
      description: "Criando sons e visuais. Construindo mundos do Brasil para todos os lugares.",
      type: "website",
      images: [{ url: origin + "/og.jpg", width: 1672, height: 941, alt: "EVILBEAR.JPG — estúdio de produção musical" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "EVILBEAR.JPG — Som, Visual & Identidade",
      description: "Criando sons e visuais. Construindo mundos.",
      images: [origin + "/og.jpg"],
    },
    icons: { icon: "/mascot.png", shortcut: "/mascot.png" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
