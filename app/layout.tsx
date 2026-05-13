import type { Metadata } from "next";
import "./globals.css";
import { createServerAnonClient } from "@/lib/supabase/server";
import { resolveTheme, buildCssVars, DEFAULT_THEME } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Thiệp Cưới",
  description: "Trân trọng kính mời",
};

// All curated fonts preloaded so switching fonts is instant (no additional network request)
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Alice&family=Allura&family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Dancing+Script:wght@400;500&family=DM+Sans:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Gilda+Display&family=Great+Vibes&family=Italianno&family=Jost:wght@300;400;500&family=Lato:wght@300;400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Marcellus&family=Montserrat:wght@300;400;500;600&family=Mulish:wght@300;400;500&family=Nunito:wght@300;400;500&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Raleway:wght@300;400;500;600&family=Satisfy&family=Source+Sans+3:wght@300;400;500&family=Tangerine:wght@400;700&family=Yeseva+One&display=swap";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let cssVars = buildCssVars(DEFAULT_THEME)
  try {
    const supabase = await createServerAnonClient()
    const { data } = await supabase
      .from('wedding_config')
      .select('theme_json')
      .eq('id', 1)
      .single()
    if (data?.theme_json) {
      cssVars = buildCssVars(resolveTheme(data.theme_json))
    }
  } catch { /* use DEFAULT_THEME */ }

  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      </head>
      <body className="font-body min-h-full">{children}</body>
    </html>
  );
}
