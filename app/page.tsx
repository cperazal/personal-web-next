import { cookies } from 'next/headers'
import type { Locale } from '@/lib/types'
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

export const revalidate = 60

export default async function Page() {
  // Read locale from cookie server-side for consistent initial render
  const cookieStore = await cookies()
  const locale = ((cookieStore.get('locale')?.value) as Locale | undefined) ?? 'en-US'

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
          Built with{' '}
          <span style={{ color: 'var(--accent)' }}>Next.js 15 + Tailwind v4 + Framer Motion</span>
          {' '}— Content powered by{' '}
          <span style={{ color: 'var(--accent)' }}>Contentful CMS</span>
        </div>
      </footer>
    </>
  )
}
