import { ClerkProvider } from "@clerk/nextjs";

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
