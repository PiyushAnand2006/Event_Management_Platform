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

/**
 * Runs during HTML parse, before Next.js hydrates.
 *
 * Password managers and other extensions stamp tracking attributes such as
 * `fdprocessedid` (LastPass) onto inputs and buttons before React hydrates, which
 * makes React report a hydration mismatch for attributes the app never rendered.
 * React cannot patch those up, so we drop them ourselves.
 *
 * The observer is intentionally time-boxed: it only needs to bridge the gap
 * between parse and hydration, and then gets out of the way so it never fights
 * the extension's own bookkeeping indefinitely.
 */
const EXTENSION_STAMP_ATTRIBUTES = ['fdprocessedid']
const HYDRATION_WINDOW_MS = 15000

const stripExtensionStampsScript = `
(function () {
  var ATTRS = ${JSON.stringify(EXTENSION_STAMP_ATTRIBUTES)};
  var selector = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
  var stopAt = Date.now() + ${HYDRATION_WINDOW_MS};
  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record.type === 'attributes') {
        record.target.removeAttribute(record.attributeName);
        continue;
      }
      for (var j = 0; j < record.addedNodes.length; j++) {
        var node = record.addedNodes[j];
        if (node.nodeType !== 1) continue;
        stripNode(node);
        var nested = node.querySelectorAll(selector);
        for (var k = 0; k < nested.length; k++) stripNode(nested[k]);
      }
    }
    if (Date.now() > stopAt) observer.disconnect();
  });
  function stripNode(node) {
    for (var i = 0; i < ATTRS.length; i++) node.removeAttribute(ATTRS[i]);
  }
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ATTRS,
    childList: true,
    subtree: true,
  });
  var existing = document.querySelectorAll(selector);
  for (var n = 0; n < existing.length; n++) stripNode(existing[n]);
  window.setTimeout(function () { observer.disconnect(); }, ${HYDRATION_WINDOW_MS});
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: stripExtensionStampsScript }} />
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
