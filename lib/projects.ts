import type { ProjectItem } from './types'

/** A project has its own page only when it has a slug and real case-study content */
export function hasCaseStudy(project: ProjectItem): project is ProjectItem & { slug: string } {
  return Boolean(project.slug && project.solucion)
}
