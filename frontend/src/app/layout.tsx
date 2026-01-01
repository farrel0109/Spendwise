import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise - Expense Tracker & Financial Insight",
  description: "Track your expenses, manage your finances, and gain insights with SpendWise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <LanguageProvider>
            {children}
            <Toaster position="bottom-right" toastOptions={{
              style: {
                background: '#18222d',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }
            }} />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

