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
        
        /**
         * RootLayout component wraps all pages and provides global styles and context.
         * It conditionally includes ClerkProvider based on the app mode for authentication.
         */
        export default function RootLayout({
          children
        }: Readonly<{
          children: React.ReactNode
        }>) {
          const appMode = process.env.NEXT_PUBLIC_APP_MODE
        
          // Define the main content structure with global styles and Toaster for notifications.
          const content = (
            <html lang="en" suppressHydrationWarning>
              <body
                className={cn(
                  "bg-background min-h-screen font-sans antialiased",
                  fontSans.variable
                )}
              >
                {/* ThemeProvider manages the application's theme (dark/light) */}
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  disableTransitionOnChange
                >
                  {children}
                  {/* Toaster component displays toast notifications */}
                  <Toaster />
                </ThemeProvider>
              </body>
            </html>
          )
        
          // If the app mode is "simple", render content without ClerkProvider.
          if (appMode === "simple") {
            return content
          }
        
          // In "advanced" mode, wrap content with ClerkProvider for user authentication.
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