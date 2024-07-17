"use client"

import { cn } from "@/lib/utils"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import { AlignJustify, Star, XIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "../ui/button"

const menuItem: any = []

const handleMenuItemClick = (href: string) => {
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
  // const [stars, setStars] = useState(0)

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

  // useEffect(() => {
  //   const getGitHubRepoStars = async () => {
  //     const url = `https://api.github.com/repos/mckaywrigley/buildware-ai`
  //     try {
  //       const response = await fetch(url, {
  //         headers: {
  //           Accept: "application/vnd.github.v3+json"
  //         }
  //       })
  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status}`)
  //       }
  //       const data = await response.json()
  //       setStars(data.stargazers_count)
  //     } catch (error) {
  //       console.error("Failed to fetch GitHub stars:", error)
  //     }
  //   }
  //   getGitHubRepoStars()
  // }, [])

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
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <Star className="size-4" />
                  <div>Star us on GitHub</div>
                </Button>
              </Link>

              {process.env.NEXT_PUBLIC_APP_MODE === "simple" ? (
                <>
                  <Link href="/onboarding">
                    <Button>My Workspace &rarr;</Button>
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
