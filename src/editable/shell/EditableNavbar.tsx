'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LogIn, Menu, PlusCircle, Search, ShoppingBag, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () =>
      SITE_CONFIG.tasks
        .filter((task) => task.enabled)
        .map((task) => ({ label: task.label, href: task.route }))
        .filter((item) => !['/', '/classified', '/profile'].includes(item.href)),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-white/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto max-w-[var(--editable-container)] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_rgba(67,46,84,0.16)] ring-1 ring-[var(--editable-border)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
            </span>
            <div className="hidden md:block">
              <span className="editable-display block text-[2rem] font-extrabold leading-none tracking-[-0.06em] text-[var(--slot4-page-text)]">
                {SITE_CONFIG.name}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
                {globalContent.nav?.tagline || SITE_CONFIG.tagline}
              </span>
            </div>
          </Link>

          <form action="/search" className="hidden min-w-0 flex-1 items-center lg:flex">
            <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border-2 border-[var(--slot4-page-text)] bg-white">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-5">
                <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search for anything"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </div>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-full border border-[var(--editable-border)] bg-white p-2.5 shadow-sm"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/contact" className="rounded-full px-3 py-2 text-[13px] font-semibold text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
              Help
            </Link>
            {session ? (
              <>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--slot4-accent)] bg-[var(--editable-cta-bg)] px-5 py-2.5 text-[13px] font-bold text-[var(--editable-cta-text)] transition hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4" /> Create
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[13px] font-semibold text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-0.5">
                  <UserPlus className="h-4 w-4" /> Sign up
                </Link>
              </>
            )}
            <Bell className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <ShoppingBag className="h-4 w-4 text-[var(--slot4-muted-text)]" />
          </div>
        </div>

        <div className="mt-4 hidden items-center gap-6 overflow-x-auto whitespace-nowrap border-t border-[var(--editable-border)] pt-4 text-[15px] text-[var(--slot4-page-text)] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative pb-1 transition ${
                isActive(pathname, item.href) ? 'font-semibold text-[var(--slot4-accent-fill)]' : 'hover:text-[var(--slot4-accent)]'
              }`}
            >
              {item.label}
              {isActive(pathname, item.href) ? <span className="absolute inset-x-0 -bottom-4 h-0.5 rounded-full bg-[var(--slot4-accent)]" /> : null}
            </Link>
          ))}
        </div>

        {open ? (
          <div className="mt-4 rounded-[1.75rem] border border-[var(--editable-border)] bg-white p-4 shadow-[0_20px_40px_rgba(67,46,84,0.12)] lg:hidden">
            <form action="/search" className="mb-4 flex items-center gap-3 rounded-full border border-[var(--editable-border)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
              <input name="q" type="search" placeholder="Search for anything" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </form>
            <div className="grid gap-2">
              {[...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(pathname, item.href) ? 'bg-[var(--slot4-lavender)] text-[var(--slot4-accent-fill)]' : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-gray)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {session ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--slot4-page-text)] hover:bg-[var(--slot4-gray)]"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  )
}
