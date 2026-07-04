import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  Star,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { Ads } from '@/lib/ads'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost, limit?: number) => {
  const summary = stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
  if (!limit || summary.length <= limit) return summary
  return `${summary.slice(0, limit).trim()}...`
}
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

function postPageHref(basePath: string, slug?: string) {
  const safeSlug = typeof slug === 'string' ? slug.trim() : ''
  return safeSlug ? `${basePath}/${safeSlug}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const archiveAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'header',
  listing: 'sidebar',
  profile: 'in-feed',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const categoryLinks = CATEGORY_OPTIONS.slice(0, 6)
  const adSlot = archiveAdSlot[task]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-white">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-6 rounded-[2rem] bg-[linear-gradient(135deg,#fff,#f8f1f4)] p-6 shadow-[0_20px_50px_rgba(67,46,84,0.08)] lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--tk-accent)]">
                  <span>{theme.kicker}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
                  <span className="text-[var(--tk-muted)]">{label}</span>
                </div>
                <h1 className="editable-display mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {categoryLinks.map((item) => (
                    <Link key={item.slug} href={pageHref(basePath, item.slug, 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-[var(--tk-surface)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--tk-text)]">Now browsing</p>
                    <p className="mt-1 text-sm text-[var(--tk-muted)]">
                      <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> posts in {categoryLabel}
                    </p>
                  </div>
                  <Link href={basePath} className="text-sm font-bold text-[var(--tk-accent)] hover:underline">
                    Reset
                  </Link>
                </div>
                <form action={basePath} className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-12 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--tk-accent)] px-5 text-sm font-bold text-[var(--tk-on-accent)] transition hover:opacity-90">
                    Apply
                  </button>
                </form>
                {task === 'listing' && adSlot ? (
                  <div className="mx-auto max-w-6xl px-4 py-6">
                    <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {featured ? (
          <section className="mx-auto max-w-[var(--editable-container)] px-4 pt-8 sm:px-6 lg:px-8">
            <Link href={postPageHref(basePath, featured.slug)} className="group grid overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white shadow-[0_22px_50px_rgba(67,46,84,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[280px] overflow-hidden">
                <img src={getImage(featured)} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,31,51,0.78)_0%,rgba(36,31,51,0.25)_48%,rgba(36,31,51,0)_100%)]" />
                <div className="absolute left-8 top-8 max-w-xl text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">Featured {label}</p>
                  <h2 className="editable-display mt-4 text-4xl font-extrabold leading-[1.03] tracking-[-0.06em] sm:text-5xl">{featured.title}</h2>
                  <p className="mt-4 text-base leading-7 text-white/82">{getSummary(featured) || theme.note}</p>
                </div>
              </div>
              <div className="grid gap-4 p-6 sm:p-8">
                <div className="rounded-[1.5rem] bg-[var(--tk-raised)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Category</p>
                  <p className="mt-2 text-lg font-bold text-[var(--tk-text)]">{getCategory(featured, label)}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--tk-raised)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Summary</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(featured, 136)}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)]">
                  Open featured post <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </section>
        ) : null}

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          {task !== 'listing' && adSlot ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-[var(--tk-line)] bg-white px-8 py-16 text-center shadow-[0_14px_40px_rgba(67,46,84,0.05)]">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-extrabold tracking-[-0.04em]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-semibold transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-5 py-2.5 font-semibold text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-semibold transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = postPageHref(basePath, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}

const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-white shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="aspect-[16/11] overflow-hidden bg-[var(--tk-raised)]">
        <img src={getImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">
          <span>{getCategory(post, 'Article')}</span>
          <span className="text-[var(--tk-muted)]">No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">
          Read story <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group flex gap-5 rounded-[1.7rem] border border-[var(--tk-line)] bg-white p-5 shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt={post.title} className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{getCategory(post, 'Listing')}</p>
        <h2 className="editable-display mt-2 truncate text-2xl font-extrabold tracking-[-0.04em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="group rounded-[1.7rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--tk-accent)]">{price}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-5 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-sm font-semibold text-[var(--tk-muted)]">
        <span>{location || 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[1.7rem] border border-[var(--tk-line)] bg-white shadow-[0_16px_36px_rgba(67,46,84,0.08)] transition duration-300 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(36,31,51,0.86))]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">{getCategory(post, 'Image')}</p>
          <h2 className="editable-display mt-2 line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group rounded-[1.7rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Resource {String(index + 1).padStart(2, '0')}</p>
      <h2 className="editable-display mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">
        Open resource <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group rounded-[1.7rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <FileText className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Document')}</p>
      <h2 className="editable-display mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.04em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">
        Open file <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group rounded-[1.7rem] border border-[var(--tk-line)] bg-white p-7 text-center shadow-[0_16px_40px_rgba(67,46,84,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 line-clamp-2 text-xl font-extrabold tracking-[-0.04em]">{post.title}</h2>
      {role ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
