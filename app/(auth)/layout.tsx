import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--primary)] to-[#9a6b8a] p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[var(--primary)] font-bold text-2xl">
            A
          </div>
          <span className="text-white font-bold text-2xl">ApparelDesk</span>
        </Link>

        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to ApparelDesk</h1>
          <p className="text-lg opacity-80">
            Your one-stop destination for quality clothing. Shop the latest trends 
            in mens, womens, and childrens fashion.
          </p>
        </div>

        <p className="text-white text-sm opacity-60">
          © 2025 ApparelDesk. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
