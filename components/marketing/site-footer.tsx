import { TwitterLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"

const footerSocials = [
  {
    href: "https://twitter.com/buildwareai",
    name: "Twitter",
    icon: <TwitterLogoIcon className="size-4" />
  }
]

export function SiteFooter() {
  return (
    <footer className="mt-80">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="flex flex-col gap-2 rounded-md border-neutral-700/20 px-8 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="flex space-x-5 sm:mt-0 sm:justify-center">
            {footerSocials.map(social => (
              <Link
                key={social.name}
                href={social.href}
                className="fill-gray-500 text-gray-500 hover:fill-gray-900 hover:text-gray-900 dark:hover:fill-gray-600 dark:hover:text-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>

          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer">
              Takeoff AI
            </Link>
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
