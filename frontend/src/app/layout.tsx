import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LM Store | Premium Tech",
  description: "High-end tech products for professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-[#F8FAFC] antialiased min-h-screen flex flex-col`}>
        {/* Background Decorative Blobs - Fixed for Mobile */}
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] md:w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] md:w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />
        </div>

        {/* The Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
          {children}
        </main>

        {/* Simple Footer */}
        <footer className="w-full py-10 text-center border-t border-slate-200 bg-white/50">
          <p className="text-sm text-slate-400 font-bold tracking-tight">
            © 2025 LM STORE • DESIGNED BY ASADULLAH
          </p>
        </footer>
      </body>
    </html>
  );
}