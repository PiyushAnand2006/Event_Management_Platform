import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { OnlineOfflineDetector } from "@/components/common/online-offline-detector";

export const metadata: Metadata = {
  title: "Occasio — Event & Ceremony Management Platform",
  description:
    "The modern platform for creating, managing, and elevating every event and ceremony. From intimate gatherings to grand conferences.",
  keywords: [
    "Occasio",
    "event management",
    "ceremony planning",
    "event platform",
    "venue builder",
    "smart check-in",
  ],
  authors: [{ name: "Occasio Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Occasio — Event & Ceremony Management Platform",
    description:
      "Create, manage, and elevate every event and ceremony with powerful tools designed for modern organizers.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <SessionProviderWrapper>
            <QueryProvider>
              <SocketProvider>
                {children}
                <OnlineOfflineDetector />
              </SocketProvider>
            </QueryProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
