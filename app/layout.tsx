import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { PWAInstaller } from "@/components/pwa-installer"
import { ThemeProvider } from "@/components/theme-provider"
import { SqlServerSetupNotification } from "@/components/sql-server-setup-notification"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BookSwap - Student Book Exchange Platform",
  description: "Peer-to-peer book exchange platform where students share and sell books among themselves",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookSwap",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BookSwap" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SqlServerSetupNotification />
          <PWAInstaller />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
