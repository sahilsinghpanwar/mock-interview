import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/hooks/useAuth";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mock + AI",
  description: "AI-powered interview preparation platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}