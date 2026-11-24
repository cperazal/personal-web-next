import 'server-only'
import { getPublishedPosts, type PostSummary } from '@/lib/data/blog'
import { getProjects } from '@/lib/data/content'
import { hasCaseStudy } from '@/lib/projects'
import { absoluteUrl, type Lang } from '@/lib/i18n'

/* llms.txt: a clean, citable summary for AI engines (https://llmstxt.org).
 * The curated text lives here; projects and blog posts come from the database,
 * so new content shows up automatically. */

const INTRO = `# Carlos Peraza

> Software Engineer and Tech Lead based in San José, Costa Rica, with 9+ years of experience building APIs, integrations, and web applications with .NET, React, Next.js, and Python. Currently leads the tech team at tucalzado.com and builds AI agents and Model Context Protocol (MCP) integrations for real business processes.

Carlos Peraza (username: cperazal) holds a degree in Informatics Engineering (Ingeniería en Informática) from Universidad Centroccidental Lisandro Alvarado, Venezuela (2017). He works in Spanish (native) and English (B1). This site is available in English (https://carlosperaza.dev) and Spanish (https://carlosperaza.dev/es).

## Profile

- [Website](https://carlosperaza.dev): Portfolio with experience, projects, education, and contact form
- [Blog](https://carlosperaza.dev/blog): Articles on .NET, AI agents, MCP and engineering leadership (Spanish: https://carlosperaza.dev/es/blog)
- [LinkedIn](https://www.linkedin.com/in/cperazal): Professional profile
- [GitHub](https://github.com/cperazal): Code and repositories
- Contact: info@carlosperaza.dev

## Current role

- Tech Lead & .NET Developer at tucalzado.com (Costa Rica), March 2021 – present
- Promoted from web developer to Tech Lead; coordinates teams of up to 6 people
- Contributed to the design, development, and rollout of 50+ projects: APIs, web services, and frontends with .NET, React, and Next.js
- Implemented CI/CD in about 70% of the company's projects, cutting deployment time from 30–60 minutes to 5–10 minutes
- Builds AI agents that automate key business processes; created the company's first MCP project to connect internal systems with AI
- Reduced the cost of customer service AI agents by up to 60% by integrating AI APIs and applying techniques such as prompt caching
- Designed 2 internal skills that keep AI-assisted development aligned with company standards (naming, coding style, T-SQL)

## Previous experience

- Full Stack Developer (.NET & JavaScript), BM Soluciones, Venezuela, July 2018 – February 2021: .NET Framework APIs for 5 clients, including large e-commerce sites. On assignment at tucalzado.com (2019), integrated Banco Nacional (BN) and Banco de Costa Rica (BCR) payment collection services, enabling about 10,000 customers to pay their credit accounts
- .NET Developer (part-time), SIPARE C.A., remote (Argentina), January 2020 – January 2021: new features and optimization of about 9 modules of a condominium fee collection system
- Python Developer (part-time), Department of Government, Harvard University, remote (USA), January – July 2019: large-scale web scraping project that extracted about 300,000 records to support a PhD dissertation; received a letter of recommendation
- PHP Developer, Hito Design, remote (Spain), July – December 2018: REST API with Laravel and MongoDB for an e-commerce platform
- Python Developer, KOD LATAM Security, remote (Uruguay), June 2017 – July 2018: data collection tools for 3 web scraping projects for security analysis
- PHP Developer & IT Support (part-time), Ailanthus Sistems C.A., Venezuela, February 2017 – February 2018: PHP system that digitized 80% of the company's manual processes`

const SKILLS = `## Skills

- Languages: C#, VB.NET, JavaScript, Python, T-SQL
- Frameworks: .NET Core, .NET Framework, React, Next.js
- Databases: SQL Server, MySQL, MongoDB
- DevOps and tools: Git, GitHub, CI/CD, Azure, Vercel, Heroku, Linux
- AI for development: Claude Code, GitHub Copilot, MCP application development, skill authoring, agentic coding, AI cost control
- Integrations: banking payment collection (BN, BCR, ASBANC Peru), electronic invoicing (DIMOI Costa Rica, Comfiar Colombia)`

const OPTIONAL = `## Optional

- [Letter of recommendation, Harvard University](https://carlosperaza.dev/#rewards): Recommendation letter from the Department of Government for the web scraping project
- [Spanish version / Versión en español](https://carlosperaza.dev/es): Same profile in Spanish`

const postLine = (p: PostSummary, lang: Lang) =>
  `- [${p.title}](${absoluteUrl(lang, `/blog/${p.slug}`)}) (${p.publishedAt.slice(0, 10)}, ${lang === 'es' ? 'Spanish' : 'English'}): ${p.excerpt}`

export async function buildLlmsTxt(): Promise<string> {
  const [projects, postsEn, postsEs] = await Promise.all([
    getProjects('en-US'),
    getPublishedPosts('en'),
    getPublishedPosts('es'),
  ])

  // Case studies first (they have their own page), then the rest
  const ordered = [...projects.filter(hasCaseStudy), ...projects.filter((p) => !hasCaseStudy(p))]
  const projectLines = ordered.map((p) => {
    const link = hasCaseStudy(p) ? absoluteUrl('en', `/projects/${p.slug}`) : p.url
    const name = link ? `[${p.titulo}](${link})` : p.titulo
    const meta = [p.empresa, p.fecha?.slice(0, 4)].filter(Boolean).join(', ')
    const tech = p.tecnologias?.length ? ` Technologies: ${p.tecnologias.join(', ')}.` : ''
    return `- ${name}${meta ? ` (${meta})` : ''}: ${p.descripcion}${tech}`
  })

  const blog = [...postsEn.map((p) => postLine(p, 'en')), ...postsEs.map((p) => postLine(p, 'es'))]

  return (
    [
      INTRO,
      `## Selected projects\n\n${projectLines.join('\n')}`,
      SKILLS,
      ...(blog.length ? [`## Blog articles\n\n${blog.join('\n')}`] : []),
      OPTIONAL,
    ].join('\n\n') + '\n'
  )
}
