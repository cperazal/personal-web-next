import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireAdmin, UnauthorizedError } from '@/lib/auth/require-admin'

// Issues short-lived tokens so the admin can upload files straight from the
// browser to Vercel Blob. Only the admin session can get a token.
const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requireAdmin()
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          addRandomSuffix: true,
        }
      },
      // Required by the API; nothing to do after upload (the form saves the URL)
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (e) {
    const status = e instanceof UnauthorizedError ? 401 : 400
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status })
  }
}
