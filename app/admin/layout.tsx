import type { Metadata } from 'next'
import { Geist, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import '../globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'], display: 'swap' })

// Private area: never indexed, never linked from the public site.
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${jetbrainsMono.variable}`}>
      <body className="admin-root">
        {/* Same light/dark setting as the public site (shared preference, dark by default) */}
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
