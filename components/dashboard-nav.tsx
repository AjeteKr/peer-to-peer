"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, User, MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    // Clear any local storage tokens
    localStorage.removeItem('auth_token')
    router.push("/auth/login")
    router.refresh()
  }

  const navItems = [
    {
      title: "My Books",
      href: "/dashboard",
      icon: BookOpen,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
  ]

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
      <Button variant="ghost" className="justify-start gap-3 px-3" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  )
}
