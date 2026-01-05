import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Kenya PAYE Calculator 2026 | Calculate Net Salary, NSSF, SHIF & Tax',
    template: '%s | Kenya PAYE Calculator'
  },
  description: 'Free Kenya PAYE calculator for 2026. Calculate your net salary, PAYE tax, NSSF, SHIF, and Housing Levy instantly. Updated with latest KRA tax bands and rates.',
  keywords: ['PAYE calculator Kenya', 'Kenya tax calculator', 'net salary calculator Kenya', 'NSSF calculator', 'SHIF calculator', 'KRA tax bands 2026'],
  authors: [{ name: 'PAYE Calculator Kenya' }],
  creator: 'PAYE Calculator Kenya',
  publisher: 'PAYE Calculator Kenya',
  metadataBase: new URL('https://payecalculator.co.ke'),
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://payecalculator.co.ke',
    siteName: 'Kenya PAYE Calculator',
    title: 'Kenya PAYE Calculator 2026 | Calculate Net Salary & Tax',
    description: 'Free Kenya PAYE calculator for 2026. Calculate your net salary, PAYE tax, NSSF, SHIF, and Housing Levy instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kenya PAYE Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kenya PAYE Calculator 2026',
    description: 'Calculate your net salary, PAYE tax, NSSF, SHIF, and Housing Levy instantly.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BVFXE6F28R"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BVFXE6F28R');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-stone-950/80 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KE</span>
                </div>
                <span className="font-bold text-lg hidden sm:inline">PAYE Calculator</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">
                  Calculator
                </Link>
                <Link href="/blog" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-4 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KE</span>
                  </div>
                  <span className="font-bold text-lg">PAYE Calculator Kenya</span>
                </div>
                <p className="text-stone-400 text-sm max-w-md">
                  The most comprehensive PAYE calculator for Kenya. Calculate your net salary, tax, NSSF, SHIF, and Housing Levy with the latest 2026 rates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-stone-400 hover:text-white transition-colors">Calculator</Link></li>
                  <li><Link href="/blog" className="text-stone-400 hover:text-white transition-colors">Tax Guides</Link></li>
                  <li><Link href="/blog/how-to-calculate-your-paye-tax-in-kenya" className="text-stone-400 hover:text-white transition-colors">How to Calculate PAYE</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.kra.go.ke" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">KRA Website</a></li>
                  <li><a href="https://itax.kra.go.ke" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">iTax Portal</a></li>
                  <li><a href="https://www.nssf.or.ke" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">NSSF Kenya</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-stone-500 text-sm">
                © {new Date().getFullYear()} payecalculator.co.ke • Updated with 2026 Tax Rates
              </p>
              <p className="text-stone-600 text-xs mt-2">
                This calculator provides estimates only. Consult a qualified tax professional for official advice.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
