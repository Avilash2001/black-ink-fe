import { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ThemeProvider from "@/components/theme-provider";
import { Newsreader } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-story",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Black Ink",
  description: "A AI story adventure game",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Anti-FOUC: apply dark class synchronously before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('black-ink-session');if(s){var t=JSON.parse(s).theme;if(t==='light'){return;}}}catch(e){}document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${newsreader.variable} bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <ThemeProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
