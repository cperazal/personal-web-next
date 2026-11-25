import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

/** The only Google account allowed into /admin */
export function isAdminEmail(email?: string | null): boolean {
  const allowed = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  return Boolean(allowed) && email?.trim().toLowerCase() === allowed
}

// Edge-safe config (used by middleware): no database, JWT sessions only.
export const authConfig = {
  providers: [Google],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8 hours
  pages: { signIn: '/admin/login', error: '/admin/login' },
  callbacks: {
    // Reject every Google account except ADMIN_EMAIL (and require a verified email)
    signIn({ profile }) {
      return Boolean(profile?.email_verified) && isAdminEmail(profile?.email)
    },
  },
} satisfies NextAuthConfig
