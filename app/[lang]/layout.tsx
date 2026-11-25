import { jsonLd } from '@/lib/jsonld'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Geist, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { LocaleProvider } from '@/context/locale-context'
import Navbar from '@/components/ui/Navbar'
import MotionProvider from '@/components/ui/MotionProvider'
import {
  LOCALE_BY_LANG,
  HOME_URL,
  HREFLANG,
  LANGS,
  SEO,
  SITE_URL,
  isLang,
  type Lang,
} from '@/lib/i18n'
import '../globals.css'

/* ─── Site constants ─────────────────────────────────────────────────────── */
const SITE_NAME = 'carlosperaza.dev'
const FULL_NAME = 'Carlos Peraza'

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

/* ─── Static params: only /  (en) and /es ───────────────────────────────── */
export const dynamicParams = false

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: rawLang } = await params
  const lang: Lang = isLang(rawLang) ? rawLang : 'en'
  const seo = SEO[lang]
  const otherLang: Lang = lang === 'en' ? 'es' : 'en'

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: seo.description,

    keywords: [
      'Carlos Peraza',
      'cperazal',
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
      'REST API',
      'Costa Rica',
      ...(lang === 'es'
        ? ['Ingeniero de software', 'Desarrollador .NET', 'Agentes de IA', 'Integraciones bancarias']
        : []),
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

    /* Canonical + hreflang: each language points to its own URL */
    alternates: {
      canonical: HOME_URL[lang],
      languages: HREFLANG,
    },

    /* Open Graph */
    openGraph: {
      type: 'profile',
      firstName: 'Carlos',
      lastName: 'Peraza',
      username: 'cperazal',
      locale: seo.ogLocale,
      alternateLocale: [SEO[otherLang].ogLocale],
      url: HOME_URL[lang],
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${FULL_NAME} — ${seo.jobTitle}`,
          type: 'image/jpeg',
        },
      ],
    },

    /* Twitter / X */
    twitter: {
      card: 'summary_large_image',
      site: '@cperazal',
      creator: '@cperazal',
      title: seo.title,
      description: seo.description,
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
}

/* ─── JSON-LD structured data ────────────────────────────────────────────── */
function buildJsonLd(lang: Lang) {
  const seo = SEO[lang]
  const inLanguage = lang === 'es' ? 'es' : 'en'

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: FULL_NAME,
        givenName: 'Carlos',
        familyName: 'Peraza',
        alternateName: 'cperazal',
        url: SITE_URL,
        email: 'mailto:info@carlosperaza.dev',
        jobTitle: seo.jobTitle,
        description: seo.description,
        image: `${SITE_URL}/og-image.jpg`,
        sameAs: [
          'https://www.linkedin.com/in/cperazal',
          'https://github.com/cperazal',
          'https://x.com/cperazal',
          'https://www.facebook.com/cperazal',
        ],
        worksFor: {
          '@type': 'Organization',
          name: 'tucalzado.com',
          url: 'https://tucalzado.com',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'San José',
            addressCountry: 'CR',
          },
        },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Tech Lead & .NET Developer',
          occupationLocation: { '@type': 'City', name: 'San José, Costa Rica' },
          skills: '.NET, C#, React, Next.js, Python, SQL Server, CI/CD, AI agents, MCP',
        },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Universidad Centroccidental Lisandro Alvarado',
          alternateName: 'UCLA',
          url: 'https://www.ucla.edu.ve',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Barquisimeto',
            addressCountry: 'VE',
          },
        },
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: 'Bachelor of Science in Informatics Engineering (Ingeniería en Informática)',
          recognizedBy: {
            '@type': 'CollegeOrUniversity',
            name: 'Universidad Centroccidental Lisandro Alvarado',
          },
          dateCreated: '2017-12',
        },
        knowsLanguage: [
          { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
          { '@type': 'Language', name: 'English', alternateName: 'en' },
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
          addressLocality: 'San José',
          addressCountry: 'CR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'professional',
          url: `${HOME_URL[lang]}#contact`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SEO.en.description,
        author: { '@id': `${SITE_URL}/#person` },
        inLanguage: ['en', 'es'],
      },
      {
        '@type': 'ProfilePage',
        '@id': `${HOME_URL[lang]}#webpage`,
        url: HOME_URL[lang],
        name: seo.title,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        mainEntity: { '@id': `${SITE_URL}/#person` },
        description: seo.description,
        inLanguage,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: seo.homeLabel,
              item: HOME_URL[lang],
            },
          ],
        },
      },
    ],
  }
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(buildJsonLd(lang)) }}
        />
        {/* Without JavaScript, scroll animations never run: show that content anyway */}
        <noscript>
          <style>{'[style*="opacity:0"]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body>
        {/* Dark by default for everyone (the OS preference is ignored on purpose);
            visitors can switch to light and the choice is remembered. */}
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <LocaleProvider locale={LOCALE_BY_LANG[lang]}>
            <MotionProvider>
              <Navbar />
              <main>{children}</main>
            </MotionProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
