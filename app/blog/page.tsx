import Link from 'next/link'
import { Metadata } from 'next'
import articles from '@/lib/articles.json'
import { BookOpen, ArrowRight, Calculator, Clock, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kenya Tax & PAYE Guides',
  description: 'Comprehensive guides on Kenya PAYE tax, NSSF contributions, SHIF deductions, Housing Levy, and more. Learn how to calculate your salary and reduce your tax legally.',
  openGraph: {
    title: 'Kenya Tax & PAYE Guides | PAYE Calculator Kenya',
    description: 'Comprehensive guides on Kenya PAYE tax, NSSF contributions, SHIF deductions, and more.',
  },
}

// Categorize articles
const categories = {
  'How-To Guides': [
    'how-to-calculate-your-paye-tax-in-kenya',
    'how-kenyan-employees-can-calculate-their-net-salary',
    'working-backwards-from-net-to-gross-salary-in-kenya',
  ],
  'Statutory Deductions': [
    'the-complete-guide-to-nssf-contributions-in-kenya-for-2026',
    'understanding-shif-deductions-in-kenya-and-what-replaced-nhif',
    'everything-you-need-to-know-about-kenyas-housing-levy',
  ],
  'Tax Savings': [
    '7-legal-ways-kenyan-employees-can-reduce-their-paye',
    'how-insurance-relief-works-for-kenyan-taxpayers',
    'claiming-mortgage-interest-relief-on-your-kenyan-tax-return',
    'why-kenyan-employees-should-max-out-their-pension-contributions',
    'tax-benefits-for-persons-with-disability-in-kenya',
  ],
  'Salary Breakdowns': [
    'what-a-kes-50000-salary-actually-looks-like-after-tax-in-kenya',
    'take-home-pay-on-a-kes-100000-salary-in-kenya',
    'how-much-tax-do-you-pay-on-kes-150000-in-kenya',
    'the-real-cost-of-earning-kes-200000-in-kenya',
    'paye-rates-for-high-earners-in-kenya-explained',
  ],
  'Employment Situations': [
    'how-kenyan-employers-tax-your-bonus-and-13th-month-pay',
    'freelancing-vs-employment-in-kenya-and-which-pays-less-tax',
    'how-helb-loan-repayments-are-deducted-from-kenyan-salaries',
    'what-happens-to-your-paye-when-you-change-jobs-in-kenya',
    'what-to-do-if-your-kenyan-employer-is-deducting-wrong-paye',
    'how-kenyan-couples-can-file-taxes-together-or-separately',
  ],
  'For Employers': [
    'the-true-cost-of-hiring-an-employee-in-kenya',
    'a-kenyan-employers-guide-to-nssf-and-housing-levy-obligations',
    'filing-paye-returns-on-itax-in-kenya-without-getting-penalised',
    'taxable-benefits-in-kind-that-kenyan-employers-must-declare',
  ],
  'News & Updates': [
    'what-the-kenya-finance-bill-2025-means-for-your-salary',
    'key-kra-tax-deadlines-every-kenyan-should-know-in-2026',
    'how-the-new-nssf-rates-affect-kenyan-workers',
  ],
  'Lifestyle': [
    'what-salary-do-you-need-to-live-comfortably-in-nairobi',
  ],
}

const categoryIcons: Record<string, React.ReactNode> = {
  'How-To Guides': <Calculator className="w-5 h-5" />,
  'Statutory Deductions': <BookOpen className="w-5 h-5" />,
  'Tax Savings': <TrendingUp className="w-5 h-5" />,
  'Salary Breakdowns': <Clock className="w-5 h-5" />,
}

export default function BlogPage() {
  const articleMap = new Map(articles.map(a => [a.slug, a]))

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-stone-300">30 In-Depth Guides</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 bg-clip-text text-transparent">
              Kenya Tax & PAYE
            </span>{' '}
            Guides
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about PAYE, NSSF, SHIF, Housing Levy, and how to legally reduce your tax in Kenya.
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Featured Guides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['how-to-calculate-your-paye-tax-in-kenya', 'the-complete-guide-to-nssf-contributions-in-kenya-for-2026', '7-legal-ways-kenyan-employees-can-reduce-their-paye'].map((slug) => {
              const article = articleMap.get(slug)
              if (!article) return null
              return (
                <Link 
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-amber-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 text-amber-400 text-sm mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Featured</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-stone-400 text-sm line-clamp-2 mb-4">
                    {article.metaDescription}
                  </p>
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                    Read Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Categories */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          {Object.entries(categories).map(([category, slugs]) => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-amber-500 rounded-full" />
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slugs.map((slug) => {
                  const article = articleMap.get(slug)
                  if (!article) return null
                  return (
                    <Link
                      key={slug}
                      href={`/blog/${slug}`}
                      className="group bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-stone-500 text-sm line-clamp-2">
                        {article.metaDescription}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-600/20 to-amber-600/20 backdrop-blur-xl rounded-3xl border border-red-500/20 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Calculate Your Salary?</h2>
            <p className="text-stone-300 mb-6">
              Use our free PAYE calculator to see your exact take-home pay with all 2026 deductions.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-red-500/25 transition-all"
            >
              <Calculator className="w-5 h-5" />
              Open Calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
