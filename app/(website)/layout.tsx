import BaiDuAnalytics from "@/app/BaiDuAnalytics";
import GoogleAnalytics from "@/app/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { siteConfig } from "@/config/site";
import { defaultLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import "@/styles/loading.css";
import { Analytics } from "@vercel/analytics/react";
import { Viewport } from "next";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  alternates: {
    canonical: siteConfig.canonical,
  },
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  icons: siteConfig.icons,
  metadataBase: siteConfig.metadataBase,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
};
export const viewport: Viewport = {
  themeColor: siteConfig.themeColors,
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string[] | undefined };
}) {
  return (
    
      <html lang={(lang && lang[0]) || defaultLocale} suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={siteConfig.nextThemeColor}
            enableSystem
          >
            <Header />
            <main className="flex flex-col items-center py-6">{children}</main>
            <ToastContainer />
            <Footer />
            <Analytics />
            <TailwindIndicator />
          </ThemeProvider>
          {process.env.NODE_ENV === "development" ? (
            <></>
          ) : (
            <>
              <BaiDuAnalytics />
              <GoogleAnalytics />
              <GoogleAdSense pId={process.env.GOOGLE_ADSENSE_ID} />
            </>
          )}
        </body>
      </html>
  );
}
