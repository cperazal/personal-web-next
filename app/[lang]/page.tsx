import { CONTENTFUL_LOCALE, isLang } from '@/lib/i18n'
import {
  getPersonalInfo,
  getSkills,
  getExperience,
  getEducation,
  getProjects,
  getCertificates,
} from '@/lib/contentful'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Skills from '@/components/sections/Skills'
import Projects from '@/components/sections/Projects'
import Education from '@/components/sections/Education'
import Rewards from '@/components/sections/Rewards'
import Contact from '@/components/sections/Contact'

// Static at build time, regenerated in the background at most once a minute (ISR)
export const revalidate = 60

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  // The language comes from the URL: "/" = English, "/es" = Spanish
  const { lang } = await params
  const locale = CONTENTFUL_LOCALE[isLang(lang) ? lang : 'en']

  // Fetch all data in parallel
  const [personalInfo, skills, experience, education, projects, certificates] =
    await Promise.all([
      getPersonalInfo(locale),
      getSkills(),
      getExperience(locale),
      getEducation(locale),
      getProjects(locale),
      getCertificates(locale),
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
          <span style={{ color: 'var(--accent)' }}>Contentful CMS</span>
        </div>
      </footer>
    </>
  )
}
