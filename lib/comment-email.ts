import { escapeHtml } from '@/lib/mailer'

interface CommentEmailData {
  postTitle: string
  postUrl: string
  adminUrl: string
  name: string
  body: string
  lang: string
}

/** Notification sent to Carlos when someone leaves a comment (pending moderation) */
export function buildCommentHtml(d: CommentEmailData): string {
  const body = escapeHtml(d.body).replace(/\n/g, '<br>')
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#161b27;border:1px solid #2a3142;border-radius:12px;">
        <tr><td style="padding:28px 32px;color:#e5e7eb;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b8b9a;">Nuevo comentario · pendiente de moderación</p>
          <h1 style="margin:0 0 20px;font-size:20px;color:#f1f1f1;">${escapeHtml(d.postTitle)}</h1>
          <p style="margin:0 0 6px;font-size:14px;color:#8b8b9a;">De <strong style="color:#f1f1f1;">${escapeHtml(d.name)}</strong> · ${d.lang.toUpperCase()}</p>
          <div style="margin:0 0 24px;padding:16px;border-left:3px solid #E3E3E3;background:#0f1117;font-size:15px;line-height:1.6;color:#d6d6de;">${body}</div>
          <a href="${d.adminUrl}" style="display:inline-block;padding:10px 20px;background:#E3E3E3;color:#0c132b;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Moderar comentarios</a>
          <a href="${d.postUrl}" style="display:inline-block;margin-left:12px;font-size:14px;color:#8b8b9a;">Ver el artículo</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function buildCommentText(d: CommentEmailData): string {
  return `Nuevo comentario (pendiente de moderación) en "${d.postTitle}"\n\nDe: ${d.name} (${d.lang})\n\n${d.body}\n\nModerar: ${d.adminUrl}\nArtículo: ${d.postUrl}\n`
}
