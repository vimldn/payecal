import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import articles from '@/lib/articles.json'
import { ArrowLeft, Calculator, Clock, Share2 } from 'lucide-react'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles.find((a) => a.slug === params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription,
      type: 'article',
      url: `https://payecalculator.co.ke/blog/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription,
    },
  }
}

export default function BlogArticle({ params }: Props) {
  const article = articles.find((a) => a.slug === params.slug)

  if (!article) {
    notFound()
  }

  // Get related articles (simple: just get 3 random ones that aren't this one)
  const relatedArticles = articles
    .filter((a) => a.slug !== params.slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  // Clean up the content - fix escaped quotes in img tags
  const cleanContent = article.content
    .replace(/\"\"/g, '"')
    .replace(/width\s*=\s*"[^"]*"/g, '')
    .replace(/<img([^>]*)>/g, '<img$1 class="rounded-xl my-6 max-w-full" loading="lazy">')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <article className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all guides
            </Link>
          </div>

          {/* Title */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-stone-400">
              {article.metaDescription}
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                10 min read
              </span>
              <span>Updated January 2026</span>
            </div>
          </header>

          {/* Calculator CTA */}
          <div className="bg-gradient-to-r from-red-600/20 to-amber-600/20 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6 mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white mb-1">Calculate Your Salary Now</h3>
                <p className="text-stone-400 text-sm">See your exact take-home pay with the 2026 tax rates</p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-amber-500 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-red-500/25 transition-all whitespace-nowrap"
              >
                <Calculator className="w-4 h-4" />
                Open Calculator
              </Link>
            </div>
          </div>

          {/* Content */}
          <div 
            className="blog-content prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-sm">Found this helpful?</span>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-stone-300 hover:bg-white/10 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="px-4 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p className="text-stone-500 text-sm line-clamp-2">
                  {related.metaDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to See Your Net Salary?</h2>
            <p className="text-stone-300 mb-6">
              Use our free calculator with the latest 2026 Kenya tax rates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <Calculator className="w-5 h-5" />
              Calculate Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
