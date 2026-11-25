import 'server-only'
import { auth } from '@/auth'
import { isAdminEmail } from '@/auth.config'

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
  }
}

/**
 * Defense in depth: every admin server action and /api/admin route calls this,
 * even though middleware already protects /admin.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    throw new UnauthorizedError()
  }
  return session
}
