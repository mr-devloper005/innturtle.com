'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-auto border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] bg-[var(--slot4-gray)] p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Shopping made easier</p>
            <h2 className="editable-display mt-3 text-3xl font-extrabold tracking-[-0.05em] text-[var(--slot4-page-text)] sm:text-4xl">
              A cleaner way to browse vendors, visuals, and everyday finds.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--slot4-muted-text)]">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/search" className="inline-flex items-center justify-center rounded-full bg-[var(--slot4-page-text)] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
              Start now
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-[var(--editable-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
              Contact us
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_rgba(67,46,84,0.16)] ring-1 ring-[var(--editable-border)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
              </span>
              <span>
                <span className="editable-display block text-2xl font-extrabold tracking-[-0.05em]">{SITE_CONFIG.name}</span>
                <span className="block text-xs uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">{globalContent.footer?.tagline}</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--slot4-muted-text)]">
              Curated for local vendor discovery, image-led browsing, and polished business listings.
            </p>
          </div>
          <FooterColumn
            title="Resources"
            links={[
              { label: 'Search', href: '/search' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Create', href: '/create' },
            ]}
          />
          <FooterColumn
            title="Account"
            links={
              session
                ? [
                    { label: 'Workspace', href: '/create' },
                    { label: 'Create post', href: '/create' },
                  ]
                : [
                    { label: 'Login', href: '/login' },
                    { label: 'Sign up', href: '/signup' },
                  ]
            }
            extra={session ? <button type="button" onClick={logout} className="text-left text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Logout</button> : null}
          />
          <div>
            <h3 className="text-sm font-bold text-[var(--slot4-page-text)]">Region</h3>
            <div className="mt-4 rounded-2xl border border-[var(--editable-border)] bg-white p-4">
              <p className="text-sm font-semibold">United States</p>
              <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">
                Public-facing browsing with responsive layouts for desktop and mobile.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--editable-border)] pt-5 text-xs text-[var(--slot4-muted-text)]">
          <p>
            Copyright {year} {SITE_CONFIG.name}. {globalContent.footer?.bottomNote}
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
  extra,
}: {
  title: string
  links: Array<{ label: string; href: string }>
  extra?: ReactNode
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[var(--slot4-page-text)]">{title}</h3>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
            {link.label}
          </Link>
        ))}
        {extra}
      </div>
    </div>
  )
}
