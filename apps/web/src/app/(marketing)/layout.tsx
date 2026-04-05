import { Inter } from "next/font/google";

import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

const inter = Inter({
  variable: "--font-marketing",
  subsets: ["latin"],
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-h-screen flex-col ${inter.variable} font-[family-name:var(--font-marketing)]`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
