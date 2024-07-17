"use client"

import { cn } from "@/lib/utils"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import { AlignJustify, XIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "../ui/button"

const menuItem: any = []

const handleMenuItemClick = (href: string) => {
  console.log(href)
  const element = document.querySelector(href)
  if (element) {
    element.scrollIntoView({ behavior: "smooth" })
  }
}

export function SiteHeader() {
  const mobilenavbarVariant = {
    initial: {
      opacity: 0,
      scale: 1
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  }

  const mobileLinkVar = {
    initial: {
      y: "-20px",
      opacity: 0
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.06
      }
    }
  }

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    const html = document.querySelector("html")
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen)
  }, [hamburgerMenuIsOpen])

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false)
    window.addEventListener("orientationchange", closeHamburgerNavigation)
    window.addEventListener("resize", closeHamburgerNavigation)

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation)
      window.removeEventListener("resize", closeHamburgerNavigation)
    }
  }, [setHamburgerMenuIsOpen])

  useEffect(() => {
    const getGitHubRepoStars = async () => {
      const url = `https://api.github.com/repos/mckaywrigley/buildware-ai`
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.github.v3+json"
          }
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setStars(data.stargazers_count)
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error)
      }
    }
    getGitHubRepoStars()
  }, [])

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link className="text-md flex items-center" href="/">
            Buildware
          </Link>

          <nav className="absolute right-1/2 hidden translate-x-1/2 justify-center space-x-8 md:flex">
            {menuItem.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm hover:opacity-50"
                onClick={e => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault()
                    handleMenuItemClick(item.href)
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex h-full items-center md:ml-0">
            <div className="ml-auto flex h-full items-center md:ml-0">
              <Link
                href="https://github.com/mckaywrigley/buildware-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mr-2 size-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span className="mr-1">{stars}</span>
                  <svg
                    className="size-4 text-white"
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </Button>
              </Link>

              {process.env.NEXT_PUBLIC_APP_MODE === "simple" ? (
                <>
                  <Link href="/onboarding">
                    <Button>My Workspaces</Button>
                  </Link>
                </>
              ) : (
                <>
                  <SignedOut>
                    <div
                      className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "mr-6 text-sm"
                      )}
                    >
                      <SignInButton>Login</SignInButton>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </>
              )}
            </div>
          </div>
          <button
            className="ml-6 md:hidden"
            onClick={() => setHamburgerMenuIsOpen(open => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={hamburgerMenuIsOpen ? "animate" : "exit"}
          className={cn(
            `bg-background/70 fixed left-0 top-0 z-50 h-screen w-full overflow-auto backdrop-blur-md `,
            {
              "pointer-events-none": !hamburgerMenuIsOpen
            }
          )}
        >
          <div className="container flex h-14 items-center justify-between">
            <Link className="text-md flex items-center" href="/">
              Buildware
            </Link>

            <button
              className="ml-6 md:hidden"
              onClick={() => setHamburgerMenuIsOpen(open => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
          <motion.ul
            className={`flex flex-col uppercase ease-in md:flex-row md:items-center md:normal-case`}
            variants={containerVariants}
            initial="initial"
            animate={hamburgerMenuIsOpen ? "open" : "exit"}
          >
            {menuItem.map((item: any) => (
              <motion.li
                variants={mobileLinkVar}
                key={item.href}
                className="border-grey-dark border-b py-0.5 pl-6 md:border-none"
              >
                <Link
                  className={`hover:text-grey flex h-[var(--navigation-height)] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors ${
                    hamburgerMenuIsOpen ? "[&_a]:translate-y-0" : ""
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.nav>
      </AnimatePresence>
    </>
  )
}
