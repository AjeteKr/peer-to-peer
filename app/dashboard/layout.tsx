import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            BookSwap
          </Link>
          <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
            Browse Marketplace
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold mb-4">Dashboard</h2>
              <DashboardNav />
            </div>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
