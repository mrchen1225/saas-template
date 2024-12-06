"use client";
import HeaderLinks from "@/components/header/HeaderLinks";
import { LangSwitcher } from "@/components/header/LangSwitcher";
import { siteConfig } from "@/config/site";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { ThemedButton } from "../ThemedButton";
import { defaultLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Features",
    href: "/#Features",
    title: "Features",
  },
  {
    label: "FAQ",
    href: "/#FAQ",
    title: "FAQ",
  },
  {
    label: "BLOG",
    href: "/blog",
    title: "BLOG",
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="py-5 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav className="relative z-50 flex justify-between">
        <div className="flex items-center md:gap-x-12">
          <Link
            href="/"
            aria-label="AI Disturbance Overlay"
            title="AI Disturbance Overlay"
            className="flex items-center space-x-1 font-bold"
          >
            <Image
              alt={siteConfig.name}
              src="/logo.svg"
              className="w-8 h-8"
              width={32}
              height={32}
            />
            <span className="text-gray-950 dark:text-gray-300 hidden md:block">
            AI Disturbance Overlay
            </span>
          </Link>
        </div>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-label={link.label}
                title={link.label}
                className="tracking-wide transition-colors duration-200 font-norma"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-x-6">
          <LangSwitcher />
          <HeaderLinks />
          <ThemedButton />
          <Link
            href={`/workbench`}
            className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-800 dark:border-gray-200 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
          >
            WorkBench
          </Link>
          {/* <CreditsNum /> */}
          {/* <SignedOut>
            <SignInButton mode="modal">
              <button className="border border-gray-300 rounded px-4 py-2 hover:border-gray-500">
                Sign In
              </button>
            </SignInButton>
          </SignedOut> */}
          {/* <SignedIn>
            <UserButton />
          </SignedIn> */}
        </div>

        <div className="md:hidden">
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          {isMenuOpen && (
            <div className="absolute top-0 left-0 w-full z-50">
              <div className="p-5 bg-background border rounded shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link
                      href="/"
                      aria-label="AI Disturbance Overlay"
                      title="AI Disturbance Overlay"
                      className="inline-flex items-center"
                    >
                      <Image
                        alt={siteConfig.name}
                        src="/logo.svg"
                        className="w-8 h-8"
                        width={32}
                        height={32}
                      />
                      <span className="ml-2 text-xl font-bold tracking-wide text-gray-950 dark:text-gray-300">
                        AI Disturbance Overlay
                      </span>
                    </Link>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      title="Close Menu"
                      className="tracking-wide transition-colors duration-200 font-norma"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CgClose />
                    </button>
                  </div>
                </div>
                <nav>
                  <ul className="space-y-4">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          aria-label={link.label}
                          title={link.label}
                          className="font-medium tracking-wide  transition-colors duration-200 hover:text-deep-purple-accent-400"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="pt-2">
                  <div className="py-2 font-bold">Links</div>
                  <div className="flex items-center gap-x-5 justify-between">
                    <HeaderLinks />
                    <div className="flex items-center justify-end gap-x-5">
                      <ThemedButton />
                      <LangSwitcher />
                      <Link
                        href="/workbench"
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-600 transition-colors duration-200"
                      >
                        WorkBench
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

