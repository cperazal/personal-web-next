import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig, isAdminEmail } from './auth.config'

const { auth } = NextAuth(authConfig)

// 1) /admin: private area, only the admin Google account (no language routing).
// 2) Public site: English is served at "/" (no prefix) and Spanish at "/es".
//    Both are rendered by app/[lang]; unprefixed paths are rewritten to "/en"
//    internally and any explicit "/en" URL redirects to the clean version.
export default auth((request) => {
  const { pathname, search } = request.nextUrl

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const isLoggedIn = isAdminEmail(request.auth?.user?.email)
    const isLoginPage = pathname === '/admin/login'
    if (!isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl))
    }
    if (isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.nextUrl))
    }
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return NextResponse.next()
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
})

export const config = {
  // Skip API routes, Next internals, metadata routes and any file with an extension
  matcher: ['/((?!api|_next|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)'],
}
