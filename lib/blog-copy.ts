import type { Lang } from './i18n'

/** UI strings for the blog, per language */
export const BLOG_COPY = {
  en: {
    blog: 'Blog',
    home: 'Home',
    title: 'Blog — Carlos Peraza',
    heading: 'Notes on software, AI agents and engineering leadership',
    description:
      'Articles by Carlos Peraza on .NET, AI agents, MCP, CI/CD and leading software teams, based on real projects.',
    empty: 'The first articles are on their way.',
    readMore: 'Read article',
    minRead: (n: number) => `${n} min read`,
    published: 'Published',
    updated: 'Updated',
    toc: 'On this page',
    share: 'Share this article',
    copy: 'Copy link',
    copied: 'Link copied',
    related: 'Keep reading',
    allPosts: 'All articles',
    about: 'About the author',
    latest: 'Latest articles',
    views: (n: number) => `${n.toLocaleString('en-US')} ${n === 1 ? 'view' : 'views'}`,
    locale: 'en-US',
  },
  es: {
    blog: 'Blog',
    home: 'Inicio',
    title: 'Blog — Carlos Peraza',
    heading: 'Notas sobre software, agentes de IA y liderazgo técnico',
    description:
      'Artículos de Carlos Peraza sobre .NET, agentes de IA, MCP, CI/CD y liderazgo de equipos de software, basados en proyectos reales.',
    empty: 'Los primeros artículos vienen en camino.',
    readMore: 'Leer artículo',
    minRead: (n: number) => `${n} min de lectura`,
    published: 'Publicado',
    updated: 'Actualizado',
    toc: 'En esta página',
    share: 'Comparte este artículo',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    related: 'Sigue leyendo',
    allPosts: 'Todos los artículos',
    about: 'Sobre el autor',
    latest: 'Últimos artículos',
    views: (n: number) => `${n.toLocaleString('es-419')} ${n === 1 ? 'vista' : 'vistas'}`,
    locale: 'es-419',
  },
} satisfies Record<Lang, Record<string, unknown>>

export const formatDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(BLOG_COPY[lang].locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Costa_Rica',
  })
