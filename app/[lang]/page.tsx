import { LOCALE_BY_LANG, isLang } from '@/lib/i18n'
import { getPublishedPosts } from '@/lib/data/blog'
import LatestPosts from '@/components/sections/LatestPosts'
import {
  getPersonalInfo,
  getSkills,
  getExperience,
  getEducation,
  getProjects,
  getCertificates,
} from '@/lib/data/content'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Skills from '@/components/sections/Skills'
import Projects from '@/components/sections/Projects'
import Education from '@/components/sections/Education'
import Rewards from '@/components/sections/Rewards'
import Contact from '@/components/sections/Contact'

// Static at build time. The admin revalidates instantly on every save; the hourly
// revalidation is only a safety net (fewer database wake-ups on Neon).
export const revalidate = 3600

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  // The language comes from the URL: "/" = English, "/es" = Spanish
  const { lang } = await params
  const urlLang = isLang(lang) ? lang : 'en'
  const locale = LOCALE_BY_LANG[urlLang]

  // Fetch all data in parallel
  const [personalInfo, skills, experience, education, projects, certificates, posts] =
    await Promise.all([
      getPersonalInfo(locale),
      getSkills(),
      getExperience(locale),
      getEducation(locale),
      getProjects(locale),
      getCertificates(locale),
      getPublishedPosts(urlLang),
    ])

  return (
    <>
      <Hero initialPersonalInfo={personalInfo} initialSkills={skills} />
      <About initialData={personalInfo} />
      <Experience initialData={experience} />
      {/* <Skills initialData={skills} /> */}
      <Projects initialData={projects} />
      <Education initialData={education} />
      <Rewards initialData={certificates} />
      <LatestPosts posts={posts} lang={urlLang} />
      <Contact initialData={personalInfo} />

      {/* Footer */}
      <footer
        className="py-8 text-center text-xs font-mono"
        style={{
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {lang === 'es' ? 'Hecho con' : 'Built with'}{' '}
          <span style={{ color: 'var(--accent)' }}>Next.js 15 + Tailwind v4 + Framer Motion</span>
          {' '}— {lang === 'es' ? 'Contenido gestionado con' : 'Content powered by'}{' '}
          <span style={{ color: 'var(--accent)' }}>Neon + Vercel</span>
        </div>
      </footer>
    </>
  )
}
