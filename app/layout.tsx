import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import UserProvider from "@/context/userContext";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://www.withwarmwishes.com";

export const metadata: Metadata = {
  title: "Animated Birthday Cake Card Maker | With Warm Wishes",
  description:
    "Celebrate birthdays virtually with an animated birthday cake. Enter your name and age to get a personalized birthday greeting — share it with friends and family!",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
      ja: "/ja",
      ko: "/ko",
      vi: "/vi",
      zh: "/zh",
      id: "/id",
      th: "/th",
    },
  },
  openGraph: {
    title: "Animated Birthday Cake Card Maker | With Warm Wishes",
    description:
      "Celebrate birthdays virtually with an animated birthday cake. Enter your name and age to get a personalized birthday greeting — share it with friends and family!",
    url: BASE_URL,
    siteName: "With Warm Wishes",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Animated Birthday Cake Card Maker | With Warm Wishes",
    description:
      "Celebrate birthdays virtually with an animated birthday cake. Enter your name and age to get a personalized birthday greeting!",
  },
  verification: {
    google: "iWpUj3k0HmGVT6Vy6w98LZcck7swpHECZHGyK83WKbY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}
      bg-neutral-800`}
        suppressHydrationWarning
      >
        <Suspense>
          <UserProvider>
            <ToastContainer />
            {children}
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
