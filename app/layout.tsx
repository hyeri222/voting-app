import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { isOperator } from "@/lib/auth";
import { logOutAction } from "./actions";
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
  title: "투표",
  description: "질문에 선택지 하나를 골라 투표하고 결과를 보세요.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const operatorLoggedIn = await isOperator();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              투표
            </Link>
            {operatorLoggedIn ? (
              <div className="flex items-center gap-4 text-sm">
                <Link href="/operator" className="hover:underline">
                  운영
                </Link>
                <form action={logOutAction}>
                  <button className="text-zinc-500 hover:underline">로그아웃</button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm text-zinc-500 hover:underline">
                운영자 로그인
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
