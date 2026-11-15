import type { Metadata } from 'next'
import { Geist, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { LocaleProvider } from '@/context/locale-context'
import Navbar from '@/components/ui/Navbar'
import './globals.css'

/* ─── Site constants ─────────────────────────────────────────────────────── */
const SITE_URL = 'https://carlosperaza.dev'
const SITE_NAME = 'carlosperaza.dev'
const FULL_NAME = 'Carlos Peraza'
const TITLE = 'Carlos Peraza — Software Engineer | Tech Lead'
const DESCRIPTION =
  'Software Engineer and Tech Lead with 9+ years of experience building APIs, integrations, and web applications with .NET, React, and Python. Currently focused on AI agents and MCP.'

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,

  keywords: [
    'Carlos Peraza',
    'Software Engineer',
    'Tech Lead',
    '.NET Developer',
    'Full Stack Developer',
    'Backend Developer',
    'Next.js Developer',
    'React Developer',
    'Python Developer',
    'AI Agents',
    'MCP',
    'Web Scraping',
    'REST API',
    'Costa Rica',
    'Venezuela',
    'carlosperaza.dev',
  ],

  authors: [{ name: FULL_NAME, url: SITE_URL }],
  creator: FULL_NAME,
  publisher: FULL_NAME,
  category: 'technology',

  /* Robots */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': 160,
      'max-video-preview': -1,
    },
  },

  /* Canonical + alternates */
  alternates: {
    canonical: SITE_URL,
    languages: {
      'x-default': SITE_URL,
      'en-US': SITE_URL,
      'es-419': SITE_URL,
    },
  },

  /* Open Graph */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_419'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${FULL_NAME} — Software Engineer | Tech Lead Portfolio`,
        type: 'image/jpeg',
      },
    ],
  },

  /* Twitter / X */
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },

  /* Icons */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },

  /* Other */
  other: {
    'theme-color': '#0c132b',
  },
}

/* ─── JSON-LD structured data ────────────────────────────────────────────── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: FULL_NAME,
      url: SITE_URL,
      jobTitle: 'Software Engineer | Tech Lead',
      description: DESCRIPTION,
      image: `${SITE_URL}/og-image.jpg`,
      sameAs: [
        'https://github.com/cperazal',
        'https://www.linkedin.com/in/cperazal',
      ],
      knowsAbout: [
        '.NET',
        'C#',
        'React',
        'Next.js',
        'Python',
        'SQL Server',
        'REST APIs',
        'CI/CD',
        'AI Agents',
        'Model Context Protocol (MCP)',
        'Web Scraping',
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'professional',
        url: `${SITE_URL}/#contact`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      author: { '@id': `${SITE_URL}/#person` },
      inLanguage: ['en-US', 'es-419'],
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: TITLE,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#person` },
      description: DESCRIPTION,
      inLanguage: 'en-US',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
        ],
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <LocaleProvider>
            <Navbar />
            <main>{children}</main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
