import Link from 'next/link'
import {
  ArrowRight,
  Bookmark,
  Building2,
  ChevronRight,
  FileText,
  Globe2,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  Search,
  Star,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const unique: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(post)
  }
  return unique
}

function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getSummary(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const summary = cleanText(raw)
  return summary.length > limit ? `${summary.slice(0, limit).trim()}...` : summary
}

function getCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

function getLocation(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (
    (typeof content.location === 'string' && content.location) ||
    (typeof content.address === 'string' && content.address) ||
    (typeof content.city === 'string' && content.city) ||
    ''
  )
}

function getImages(posts: SitePost[], limit: number) {
  return posts
    .map((post) => getEditablePostImage(post))
    .filter((image, index, all) => Boolean(image) && all.indexOf(image) === index)
    .slice(0, limit)
}

function splitPosts(posts: SitePost[]) {
  return {
    hero: posts[0],
    rail: posts.slice(1, 7),
    tiles: posts.slice(7, 14),
    deals: posts.slice(14, 20),
    editorial: posts.slice(20, 24),
  }
}

function resolveTimeSections(primaryRoute: string, posts: SitePost[], timeSections: HomeTimeSection[]) {
  if (timeSections.length) return timeSections
  return [
    { key: 'spotlight', href: primaryRoute, posts: posts.slice(0, 8) },
    { key: 'browse', href: primaryRoute, posts: posts.slice(8, 16) },
    { key: 'index', href: primaryRoute, posts: posts.slice(16, 24) },
  ] as HomeTimeSection[]
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle: string
  href: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="editable-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-[15px] text-[var(--slot4-muted-text)]">{subtitle}</p>
      </div>
      <Link href={href} className="hidden text-sm font-bold text-[var(--slot4-page-text)] underline-offset-4 hover:underline sm:block">
        See all
      </Link>
    </div>
  )
}

function HorizontalStoryCard({
  post,
  href,
}: {
  post: SitePost
  href: string
}) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-[1.75rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_40px_rgba(67,46,84,0.08)] transition duration-300 hover:-translate-y-1 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="relative min-h-[280px] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,31,51,0.74)_0%,rgba(36,31,51,0.32)_46%,rgba(36,31,51,0)_100%)]" />
        <div className="absolute left-8 top-8 max-w-md text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">{pagesContent.home.hero.badge}</p>
          <h1 className="editable-display mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-white/85">{getSummary(post, 160) || pagesContent.home.hero.description}</p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--slot4-page-text)]">
            Explore now
          </span>
        </div>
        <div className="absolute bottom-4 right-6 flex items-center gap-2 text-xs font-semibold text-white/80">
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className={`h-2.5 w-2.5 rounded-full border border-white/80 ${item === 1 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 p-6 sm:p-8">
        <form action="/search" className="flex flex-col gap-3">
          <label className="flex items-center gap-3 rounded-full border-2 border-[var(--slot4-page-text)] bg-white px-5 py-3">
            <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder={pagesContent.home.hero.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <select name="category" className="h-12 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 text-sm text-[var(--slot4-page-text)] outline-none">
              <option value="">All categories</option>
              {SITE_CONFIG.tasks.filter((task) => task.enabled).map((task) => (
                <option key={task.key} value={task.route}>{task.label}</option>
              ))}
            </select>
            <button className="inline-flex h-12 items-center justify-center rounded-full bg-[#3665f3] px-6 text-sm font-bold text-white transition hover:brightness-95">
              Search
            </button>
          </div>
        </form>
      </div>
    </Link>
  )
}

function LiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block w-[248px] shrink-0">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--slot4-panel-bg)]">
        <div className="absolute left-3 top-3 z-10 rounded-full bg-[#4ade62] px-3 py-1 text-[12px] font-black text-[var(--slot4-page-text)]">
          LIVE . {45 + index * 7}
        </div>
        <div className="relative aspect-[4/6] overflow-hidden">
          <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-[15px] font-semibold leading-6 text-[var(--slot4-page-text)]">
        {post.title}
      </p>
      <p className="mt-1 line-clamp-1 text-sm text-[var(--slot4-muted-text)]">{getSummary(post, 62)}</p>
    </Link>
  )
}

function CategoryTile({ label, image, href }: { label: string; image?: string; href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-[1.5rem] bg-[var(--slot4-gray)] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(67,46,84,0.08)]">
        <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-white">
          {image ? (
            <img src={image} alt={label} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--slot4-muted-text)]">
              <Building2 className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-[var(--slot4-page-text)]">{label}</p>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.6rem] border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(67,46,84,0.1)]">
      <div className="aspect-[16/11] overflow-hidden bg-[var(--slot4-panel-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <span className="inline-flex rounded-full bg-[var(--slot4-lavender)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
          {getCategory(post)}
        </span>
        <h3 className="mt-3 line-clamp-2 text-lg font-extrabold leading-7 tracking-[-0.03em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getSummary(post, 96)}</p>
      </div>
    </Link>
  )
}

function CompactDealCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--slot4-gray)] p-3">
        <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--slot4-page-text)] shadow-sm">
          <Star className="h-4 w-4" />
        </div>
        <div className="aspect-[1/1] overflow-hidden rounded-[1.2rem] bg-white">
          <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-[15px] leading-6 text-[var(--slot4-page-text)]">{post.title}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--slot4-page-text)]">
        {getCategory(post)}
      </p>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.5rem] border border-[var(--editable-border)] bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(67,46,84,0.08)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-page-text)] text-sm font-black text-white">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{getCategory(post)}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-7 tracking-[-0.03em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getSummary(post, 88)}</p>
      </div>
    </Link>
  )
}

function FeaturedRailCard({ post, href, dark = false }: { post: SitePost; href: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group grid overflow-hidden rounded-[1.9rem] border ${
        dark ? 'border-white/10 bg-[var(--slot4-page-text)] text-white' : 'border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)]'
      } shadow-[0_24px_42px_rgba(67,46,84,0.12)] lg:grid-cols-[1fr_0.55fr]`}
    >
      <div className="p-8 sm:p-10">
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? 'text-white/70' : 'text-[var(--slot4-accent)]'}`}>
          Featured collection
        </p>
        <h3 className="editable-display mt-4 max-w-xl text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-5xl">
          {post.title}
        </h3>
        <p className={`mt-4 max-w-lg text-base leading-7 ${dark ? 'text-white/76' : 'text-[var(--slot4-muted-text)]'}`}>
          {getSummary(post, 160)}
        </p>
        <span className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${
          dark ? 'bg-white text-[var(--slot4-page-text)]' : 'bg-[var(--slot4-lavender)] text-[var(--slot4-page-text)]'
        }`}>
          Shop now
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
        {[getEditablePostImage(post), getEditablePostImage(post), getEditablePostImage(post), getEditablePostImage(post)].map((image, index) => (
          <div key={`${image}-${index}`} className={`overflow-hidden rounded-[1.4rem] ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
            <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          </div>
        ))}
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const { hero } = splitPosts(pool)
  const heroPost = hero || pool[0]
  if (!heroPost) return null

  return (
    <section className="pb-8 pt-8 sm:pb-10">
      <div className={container}>
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--slot4-muted-text)]">
          <span className="font-semibold text-[var(--slot4-page-text)]">Curated marketplace</span>
          <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-[var(--slot4-accent)]" /> Daily discoveries</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> Local business focus</span>
          <Link href={primaryRoute} className="inline-flex items-center gap-1 font-semibold text-[var(--slot4-accent)] hover:underline">
            Browse {primaryTask} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <HorizontalStoryCard post={heroPost} href={postHref(primaryTask, heroPost, primaryRoute)} />
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const { rail, tiles } = splitPosts(pool)
  return (
    <section className="py-10 sm:py-12">
      <div className={container}>
        <SectionHeader
          title={`${SITE_CONFIG.name} live`}
          subtitle="Tune into image-led posts and curated updates across the latest sections."
          href={primaryRoute}
        />
        <div className="editable-market-scroll mt-8 flex gap-4 overflow-x-auto pb-2">
          {rail.map((post, index) => (
            <LiveCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
          ))}
        </div>

        <div className="mt-12">
          <SectionHeader
            title="Get set for fresh discovery"
            subtitle="Quick category jumps inspired by the latest posts in the feed."
            href={primaryRoute}
          />
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
            {tiles.map((post, index) => (
              <CategoryTile
                key={post.id || post.slug}
                label={getCategory(post) || `Category ${index + 1}`}
                image={getEditablePostImage(post)}
                href={postHref(primaryTask, post, primaryRoute)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const { editorial } = splitPosts(pool)
  const featured = editorial[0] || pool[0]
  const secondary = editorial[1] || pool[1] || featured
  if (!featured) return null

  return (
    <section className="py-10 sm:py-12">
      <div className={`${container} space-y-8`}>
        <FeaturedRailCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} />
        {secondary ? <FeaturedRailCard post={secondary} href={postHref(primaryTask, secondary, primaryRoute)} dark /> : null}
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const sections = resolveTimeSections(primaryRoute, pool, timeSections)
  const first = sections[0]?.posts.slice(0, 4) || []
  const second = sections[1]?.posts.slice(0, 6) || []
  const third = sections[2]?.posts.slice(0, 4) || []
  const fallbackTiles = splitPosts(pool).deals

  return (
    <>
      <section className="py-10 sm:py-12">
        <div className={container}>
          <SectionHeader
            title="Today's deals"
            subtitle="Scroll through compact offers and image-first picks from the current feed."
            href={primaryRoute}
          />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(second.length ? second : fallbackTiles).map((post) => (
              <CompactDealCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className={`${container} grid gap-8 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <SectionHeader
              title="Featured for your next browse"
              subtitle="Large image-first cards for posts that deserve more visual space."
              href={primaryRoute}
            />
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {first.map((post) => (
                <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              title="Editorial picks"
              subtitle="A faster list view for stories, notes, and curated references."
              href={primaryRoute}
            />
            <div className="mt-7 grid gap-4">
              {third.map((post, index) => (
                <EditorialListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export function EditableHomeCta() {
  const tasks = SITE_CONFIG.tasks.filter((task) => task.enabled).slice(0, 4)
  return (
    <section className="pb-16 pt-10 sm:pb-20">
      <div className={container}>
        <div className="grid gap-8 rounded-[2rem] bg-[linear-gradient(135deg,#432e54,#4b4376,#ae445a)] p-8 text-white shadow-[0_28px_60px_rgba(67,46,84,0.2)] sm:p-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">{pagesContent.home.cta.badge}</p>
            <h2 className="editable-display mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-5xl">
              {pagesContent.home.cta.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/82">{pagesContent.home.cta.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={pagesContent.home.cta.primaryCta.href} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:-translate-y-0.5">
                {pagesContent.home.cta.primaryCta.label}
              </Link>
              <Link href={pagesContent.home.cta.secondaryCta.href} className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                {pagesContent.home.cta.secondaryCta.label}
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map((task, index) => {
              const Icon = taskIcon[task.key] || Globe2
              return (
                <Link key={task.key} href={task.route} className={`rounded-[1.5rem] bg-white/12 p-5 backdrop-blur-sm transition hover:bg-white/18 ${index === 0 ? 'sm:col-span-2' : ''}`}>
                  <Icon className="h-6 w-6 text-white" />
                  <p className="mt-6 text-lg font-bold">{task.label}</p>
                  <p className="mt-2 text-sm text-white/72">
                    {task.label === 'Listing' ? 'Compare vendor details faster.' : 'Explore more curated posts in this section.'}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Open section <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
