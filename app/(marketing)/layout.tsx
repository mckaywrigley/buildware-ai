import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex-1 overflow-hidden">{children}</main>
      <SiteFooter />
    </>
  )
}
