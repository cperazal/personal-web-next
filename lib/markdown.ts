import 'server-only'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

export interface RenderedMarkdown {
  html: string
  toc: TocItem[]
  wordCount: number
}

/** Collects h2/h3 (after rehype-slug added ids) for the table of contents */
function collectToc(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && node.properties?.id) {
        toc.push({
          id: String(node.properties.id),
          text: toString(node),
          level: node.tagName === 'h2' ? 2 : 3,
        })
      }
    })
  }
}

/** External links open in a new tab with safe rel attributes */
function externalLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const href = node.tagName === 'a' ? String(node.properties?.href ?? '') : ''
      if (/^https?:\/\//.test(href) && !href.includes('carlosperaza.dev')) {
        node.properties = { ...node.properties, target: '_blank', rel: ['noopener', 'noreferrer'] }
      }
    })
  }
}

// Raw HTML in Markdown is never rendered; only standard Markdown elements.
// Code-block language classes are kept so syntax highlighting works.
const schema: SanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '', // keep heading ids as-is (rehype-slug runs after)
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./]],
  },
}

/**
 * Renders the admin's Markdown to safe HTML on the server (zero JS for readers):
 * GFM (tables, task lists), sanitized, heading anchors, highlighted code.
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const toc: TocItem[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(collectToc(toc)) // before the "#" anchors are appended to headings
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
      content: { type: 'text', value: '#' },
    })
    .use(externalLinks)
    .use(rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: true })
    .use(rehypeStringify)
    .process(markdown)

  return { html: String(file), toc, wordCount: countWords(markdown) }
}

export function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // code blocks don't count as reading
    .replace(/[#>*_`~\-[\]()!|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/** ~200 words per minute, at least 1 minute */
export const readingTime = (markdown: string) => Math.max(1, Math.round(countWords(markdown) / 200))
