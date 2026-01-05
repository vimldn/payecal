import Link from 'next/link'
import { Home, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-stone-300 mb-4">Page Not Found</h2>
        <p className="text-stone-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-red-500/25 transition-all"
          >
            <Home className="w-5 h-5" />
            Calculator
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Tax Guides
          </Link>
        </div>
      </div>
    </div>
  )
}
