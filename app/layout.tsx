import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Thiệp Cưới",
  description: "Trân trọng kính mời",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Allura&family=Birthstone&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Dancing+Script:wght@400;500&family=Great+Vibes&family=Italianno&family=Kaushan+Script&family=Mea+Culpa&family=Mrs+Saint+Delafield&family=Montserrat:wght@300;400;500;600&family=Parisienne&family=Petit+Formal+Script&family=Pinyon+Script&family=Sacramento&family=Sail&family=Style+Script&family=Tangerine:wght@400;700&family=Yellowtail&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body min-h-full">{children}</body>
    </html>
  );
}
