// Shared by the admin sidebar (client) and the dashboard (server).
export const ADMIN_SECTIONS = [
  { href: '/admin', label: 'Inicio' },
  { href: '/admin/profile', label: 'Perfil' },
  { href: '/admin/experience', label: 'Experiencia' },
  { href: '/admin/education', label: 'Educación' },
  { href: '/admin/projects', label: 'Proyectos' },
  { href: '/admin/certificates', label: 'Certificados' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/posts', label: 'Blog' },
  { href: '/admin/comments', label: 'Comentarios' },
] as const
