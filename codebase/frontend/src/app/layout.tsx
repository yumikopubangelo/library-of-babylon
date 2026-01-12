import type { Metadata } from "next";
import { Cinzel, Lato } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library of Babylon",
  description: "Preserving the ephemeral beauty of digital culture.",
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${lato.variable} antialiased bg-babylon-lapis-950 text-babylon-sand-100 flex flex-col min-h-screen`}
      >
        <Header />
        <div className="flex-grow">
            {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
