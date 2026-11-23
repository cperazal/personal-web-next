import { NextResponse, type NextRequest } from 'next/server'

// English is served at "/" (no prefix) and Spanish at "/es".
// Both are rendered by app/[lang]; this rewrites unprefixed paths to "/en"
// internally and redirects any explicit "/en" URL back to the clean version.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

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
}

export const config = {
  // Skip API routes, Next internals, metadata routes and any file with an extension
  matcher: ['/((?!api|_next|robots.txt|sitemap.xml|.*\\..*).*)'],
}
