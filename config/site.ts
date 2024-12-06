import { SiteConfig } from "@/types/siteConfig";
import { BsGithub, BsTwitterX } from "react-icons/bs";
import { FaBluesky } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const OPEN_SOURCE_URL = "";

const baseSiteConfig = {
  name: "AI Disturbance Overlay - Protect Your Art with Unique AI Textures and Filters",
  description:
    "Enhance and secure your digital art with our AI Disturbance Overlay solutions. Experience the power of AI disturbance textures and filters to safeguard your creative work from AI replication. Try our innovative tools now!",
  url: "https://AIdisturbance.online/",
  ogImage: "/images/logo-ai-disturbance.svg",
  metadataBase: "/",
  keywords: [
    "ai disturbance overlay",
    "ai disturbance",
    "ai disturbance texture",
    "ai disturbance filter"
  ],
  canonical: "https://aidisturbance.online/",
  authors: [
    {
      name: "ai disturbance",
      url: "https://AIdisturbance.online/",
      twitter: "https://twitter.com/ai_reply_work",
    },
  ],
  creator: "@ai_reply_work",
  openSourceURL: OPEN_SOURCE_URL,
  themeColors: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  nextThemeColor: "light", // next-theme option: system | dark | light
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  headerLinks: [
    // { name: "repo", href: OPEN_SOURCE_URL, icon: BsGithub },
    {
      name: "bluesky",
      href: "https://aidisturbance.bsky.social/",
      icon: FaBluesky,
    },
    {
      name: "twitter",
      href: "https://twitter.com/ai_reply_work",
      icon: BsTwitterX,
    },
  ],
  footerLinks: [
    { name: "email", href: "mailto:support@AIdisturbance.online", icon: MdEmail },
    {
      name: "bluesky",
      href: "https://aidisturbance.bsky.social/",
      icon: FaBluesky,
    },
    {
      name: "X",
      href: "https://twitter.com/ai_reply_work",
      icon: BsTwitterX,
    },
    // { name: "github", href: "https://github.com/enterwiz/", icon: BsGithub },
  ],
  footerProducts: [],
};

export const siteConfig: SiteConfig = {
  ...baseSiteConfig,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseSiteConfig.url,
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    siteName: baseSiteConfig.name,
    images: [`${baseSiteConfig.url}/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    images: [`${baseSiteConfig.url}/og.png`],
    creator: baseSiteConfig.creator,
  },
};

