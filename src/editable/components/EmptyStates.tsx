import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[2rem] border border-[var(--editable-border)] bg-white p-8 text-center shadow-[0_16px_36px_rgba(67,46,84,0.06)]', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-lavender)] text-[var(--slot4-accent)]">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[var(--slot4-page-text)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--slot4-muted-text)]">{description}</p>
      <Link href={actionHref} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} from the master panel will appear here automatically. The page layout stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
