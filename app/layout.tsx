import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Black Ink",
  description: "A AI story adventure game",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
