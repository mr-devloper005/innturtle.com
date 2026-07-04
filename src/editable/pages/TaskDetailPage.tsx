import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { Ads } from '@/lib/ads'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

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

function detailHref(task: TaskKey, slug?: string) {
  const basePath = getTaskConfig(task)?.route || `/${task}`
  const safeSlug = typeof slug === 'string' ? slug.trim() : ''
  return safeSlug ? `${basePath}/${safeSlug}` : basePath
}

const detailAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'article-bottom',
  listing: 'sidebar',
  profile: 'footer',
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function Stars({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function HeroHeader({
  task,
  post,
  badge,
  side,
}: {
  task: TaskKey
  post: SitePost
  badge: string
  side?: ReactNode
}) {
  const images = getImages(post)
  return (
    <header className="border-b border-[var(--tk-line)] bg-white">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task={task} />
        <div className="mt-6 grid gap-6 rounded-[2rem] bg-[linear-gradient(135deg,#fff,#f8f1f4)] p-6 shadow-[0_22px_50px_rgba(67,46,84,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{badge}</p>
            <h1 className="editable-display mt-4 text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            {leadText(post) ? <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <Stars post={post} />
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">
                {categoryOf(post, badge)}
              </span>
              {getField(post, ['location', 'address', 'city']) ? (
                <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-xs font-semibold text-[var(--tk-muted)]">
                  {getField(post, ['location', 'address', 'city'])}
                </span>
              ) : null}
            </div>
          </div>
          <div>
            {side || (
              <div className="overflow-hidden rounded-[1.7rem] bg-[var(--tk-raised)]">
                <img src={images[0] || '/placeholder.svg?height=900&width=1200'} alt={post.title} className="aspect-[16/11] w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function MetaCards({ post, items }: { post: SitePost; items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-4 shadow-[0_12px_30px_rgba(67,46,84,0.05)]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">
            <Icon className="h-4 w-4 text-[var(--tk-accent)]" />
            {label}
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
      <div className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-4 shadow-[0_12px_30px_rgba(67,46,84,0.05)]">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">
          <Tag className="h-4 w-4 text-[var(--tk-accent)]" />
          Category
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--tk-text)]">{categoryOf(post, 'General')}</p>
      </div>
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content rounded-[1.75rem] border border-[var(--tk-line)] bg-white p-6 text-[var(--tk-text)] shadow-[0_12px_30px_rgba(67,46,84,0.05)] sm:p-8 ${compact ? 'text-[15px] leading-7' : 'text-[1.02rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageGrid({ images }: { images: string[] }) {
  if (!images.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-white shadow-[0_12px_30px_rgba(67,46,84,0.05)]">
          <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
        </div>
      ))}
    </div>
  )
}

function ContactPanel({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="rounded-[1.75rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_36px_rgba(67,46,84,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-bold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-bold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function RelatedSection({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="editable-display text-3xl font-extrabold tracking-[-0.05em]">More to explore</h2>
        <Link href={getTaskConfig(task)?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => (
          <Link key={item.id || item.slug} href={detailHref(task, item.slug)} className="group overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-white shadow-[0_12px_30px_rgba(67,46,84,0.05)] transition duration-300 hover:-translate-y-1">
            <div className="aspect-[16/11] overflow-hidden bg-[var(--tk-raised)]">
              <img src={getImages(item)[0] || '/placeholder.svg?height=900&width=1200'} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{categoryOf(item, 'Related')}</p>
              <h3 className="editable-display mt-2 line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.04em]">{item.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(item)) || 'Open this post for more details.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PageAd({ slot }: { slot: 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer' }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Ads slot={slot} showLabel eager className="mx-auto w-full" />
    </div>
  )
}

function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <HeroHeader task="article" post={post} badge="Featured article" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <BodyContent post={post} />
            {images.slice(1, 4).length ? <ImageGrid images={images.slice(1, 4)} /> : null}
            <EditableArticleComments slug={post.slug} comments={comments} />
            {detailAdSlot.article ? <PageAd slot={detailAdSlot.article} /> : null}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <MetaCards
              post={post}
              items={[
                ['Section', SITE_CONFIG.name, Tag],
                ['Category', categoryOf(post, 'Article'), Tag],
              ]}
            />
          </aside>
        </div>
      </section>
      <RelatedSection task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <HeroHeader task="listing" post={post} badge="Business listing" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <MetaCards post={post} items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail]]} />
            <BodyContent post={post} />
            {images.length ? <ImageGrid images={images.slice(0, 6)} /> : null}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ContactPanel website={website} phone={phone} email={email} />
            {detailAdSlot.listing ? <PageAd slot={detailAdSlot.listing} /> : null}
          </aside>
        </div>
      </section>
      <RelatedSection task="listing" related={related} />
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const website = getField(post, ['website', 'url'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  return (
    <>
      <HeroHeader task="classified" post={post} badge={getField(post, ['price', 'amount', 'budget']) || 'Classified offer'} />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ContactPanel website={website} phone={phone} email={email} />
          </aside>
          <div className="space-y-6">
            {images.length ? <ImageGrid images={images.slice(0, 6)} /> : null}
            <BodyContent post={post} />
          </div>
        </div>
      </section>
      <RelatedSection task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  return (
    <>
      <HeroHeader task="image" post={post} badge="Image story" side={<ImageGrid images={images.slice(0, 2)} />} />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <ImageGrid images={images.length ? images : ['/placeholder.svg?height=900&width=1200']} />
          <BodyContent post={post} compact />
        </div>
      </section>
      <RelatedSection task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <HeroHeader
        task="sbm"
        post={post}
        badge="Saved resource"
        side={
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-[1.7rem] bg-[var(--tk-raised)]">
            <Bookmark className="h-16 w-16 text-[var(--tk-accent)]" />
          </div>
        }
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <ContactPanel website={website} />
          <BodyContent post={post} />
        </div>
      </section>
      <RelatedSection task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <>
      <HeroHeader
        task="pdf"
        post={post}
        badge="Document"
        side={
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-[1.7rem] bg-[var(--tk-raised)]">
            <FileText className="h-16 w-16 text-[var(--tk-accent)]" />
          </div>
        }
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-white shadow-[0_12px_30px_rgba(67,46,84,0.05)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="text-sm font-bold">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-bold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ContactPanel website={fileUrl} />
          </aside>
        </div>
      </section>
      <RelatedSection task="pdf" related={related} />
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <>
      <HeroHeader
        task="profile"
        post={post}
        badge={role || 'Profile'}
        side={
          <div className="flex h-full min-h-[260px] items-center justify-center overflow-hidden rounded-[1.7rem] bg-[var(--tk-raised)]">
            {images[0] ? <img src={images[0]} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 text-[var(--tk-accent)]" />}
          </div>
        }
      />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ContactPanel website={website} email={email} />
            {detailAdSlot.profile ? <PageAd slot={detailAdSlot.profile} /> : null}
          </aside>
          <div className="space-y-6">
            <BodyContent post={post} />
            {images.slice(1, 7).length ? <ImageGrid images={images.slice(1, 7)} /> : null}
          </div>
        </div>
      </section>
      <RelatedSection task="profile" related={related} />
    </>
  )
}
