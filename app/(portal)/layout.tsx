'use client'

import { CustomerNavbar } from '@/app/components/CustomerNavbar'
import { Footer } from '@/app/components/landing/Footer'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEF9]">
      {/* Customer Portal Navbar */}
      <CustomerNavbar />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Landing Page Footer */}
      <Footer />
    </div>
  )
}
