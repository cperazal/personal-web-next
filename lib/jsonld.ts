/**
 * Serializes JSON-LD for a <script type="application/ld+json"> tag.
 * Escapes <, > and & (plus the U+2028/U+2029 line separators) so user content,
 * e.g. a comment containing "</script>", can never close the tag and inject
 * HTML. The output is still valid JSON.
 */
const LINE_SEP = String.fromCharCode(0x2028)
const PARA_SEP = String.fromCharCode(0x2029)

const hex = (ch: string) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
const UNSAFE = new RegExp(`[<>&${LINE_SEP}${PARA_SEP}]`, 'g')

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, hex)
}
