import 'server-only'
import { createHash } from 'crypto'

/** Client IP from Vercel/Cloudflare headers */
export function clientIp(req: Request): string {
  const h = req.headers
  return (
    h.get('cf-connecting-ip') ??
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  )
}

/** Salted, irreversible hash: lets us rate-limit without storing IPs */
export function hashIp(ip: string): string {
  return createHash('sha256').update(`${process.env.IP_HASH_SALT ?? ''}:${ip}`).digest('hex')
}

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora|whatsapp|telegram|discord|linkedin|headless|lighthouse|curl|wget|python|axios|node-fetch/i
export const isBot = (req: Request) => BOT_UA.test(req.headers.get('user-agent') ?? '')

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
