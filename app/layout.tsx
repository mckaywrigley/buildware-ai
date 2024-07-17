import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/utility/theme-provider"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans"
})

export const metadata: Metadata = {
  title: "Buildware",
  description: "Build software with AI."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE

  const content = (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )

  if (appMode === "simple") {
    return content
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      {content}
    </ClerkProvider>
  )
}
