"use client"

import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import ShineBorder from "../magicui/shine-border"

export default function MainSection() {
  return (
    <section>
      <h1 className="text-primary text-balance bg-gradient-to-br bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
        Ship faster
        <br className="hidden md:block" /> with Buildware
      </h1>

      <p className="text-primary/80 mb-12 text-lg tracking-tight md:text-xl">
        Build a code instruction system, <br className="hidden md:block" />
        give it an issue, <br className="hidden md:block" />
        and get an AI-generated PR!
      </p>

      <Link href="/onboarding">
        <Button>
          <span>Get started </span>
          <ArrowRightIcon className="ml-1 size-4" />
        </Button>
      </Link>

      <ShineBorder
        className="bg-background relative mt-20 flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border p-0 md:shadow-xl"
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
      >
        <img src="/dashboard-dark.png" className="hidden dark:block" />
        <img src="/dashboard-light.png" className="dark:hidden" />
      </ShineBorder>
    </section>
  )
}
