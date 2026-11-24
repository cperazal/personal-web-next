import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/* ─── Shared columns ──────────────────────────────────────────────────────────
 * Bilingual fields are stored as *_en / *_es pairs (the site has exactly two
 * languages). Every content table can be toggled active/inactive and ordered.
 * `legacy_id` keeps the Contentful entry id so the migration can be re-run
 * without creating duplicates.
 */
const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

const content = () => ({
  id: uuid('id').primaryKey().defaultRandom(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  legacyId: text('legacy_id').unique(),
  ...timestamps(),
})

/* ─── Profile (single row) ───────────────────────────────────────────────── */
export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  legacyId: text('legacy_id').unique(),
  name: text('name').notNull(),
  headlineEn: text('headline_en').notNull().default(''),
  headlineEs: text('headline_es').notNull().default(''),
  bioEn: text('bio_en').notNull().default(''),
  bioEs: text('bio_es').notNull().default(''),
  location: text('location').notNull().default(''),
  email: text('email').notNull().default(''),
  phone: text('phone'),
  username: text('username'),
  website: text('website'),
  github: text('github'),
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  facebook: text('facebook'),
  skillsEn: text('skills_en').array().notNull().default([]),
  skillsEs: text('skills_es').array().notNull().default([]),
  photoUrl: text('photo_url'),
  photoAlt: text('photo_alt'),
  cvEnUrl: text('cv_en_url'),
  cvEsUrl: text('cv_es_url'),
  ...timestamps(),
})

/* ─── Work experience ────────────────────────────────────────────────────── */
export const experiences = pgTable('experiences', {
  ...content(),
  titleEn: text('title_en').notNull(),
  titleEs: text('title_es').notNull().default(''),
  company: text('company').notNull().default(''),
  companyUrl: text('company_url'),
  country: text('country').notNull().default(''),
  modeEn: text('mode_en').notNull().default(''),
  modeEs: text('mode_es').notNull().default(''),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  descriptionEn: text('description_en').notNull().default(''),
  descriptionEs: text('description_es').notNull().default(''),
  technologies: text('technologies').array().notNull().default([]),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt'),
})

/* ─── Education ──────────────────────────────────────────────────────────── */
export const education = pgTable('education', {
  ...content(),
  institutionEn: text('institution_en').notNull(),
  institutionEs: text('institution_es').notNull().default(''),
  degreeEn: text('degree_en').notNull().default(''),
  degreeEs: text('degree_es').notNull().default(''),
  startDate: date('start_date'),
  endDate: date('end_date'),
  url: text('url'),
  country: text('country').notNull().default(''),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt'),
})

/* ─── Projects / case studies ────────────────────────────────────────────── */
export const projects = pgTable('projects', {
  ...content(),
  titleEn: text('title_en').notNull(),
  titleEs: text('title_es').notNull().default(''),
  slug: text('slug').unique(),
  url: text('url'),
  descriptionEn: text('description_en').notNull().default(''),
  descriptionEs: text('description_es').notNull().default(''),
  technologies: text('technologies').array().notNull().default([]),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt'),
  roleEn: text('role_en'),
  roleEs: text('role_es'),
  client: text('client'),
  date: date('date'),
  problemEn: text('problem_en'),
  problemEs: text('problem_es'),
  solutionEn: text('solution_en'),
  solutionEs: text('solution_es'),
  resultEn: text('result_en'),
  resultEs: text('result_es'),
})

/* ─── Certificates / rewards ─────────────────────────────────────────────── */
export const certificates = pgTable('certificates', {
  ...content(),
  titleEn: text('title_en').notNull(),
  titleEs: text('title_es').notNull().default(''),
  issuerEn: text('issuer_en').notNull().default(''),
  issuerEs: text('issuer_es').notNull().default(''),
  descriptionEn: text('description_en').notNull().default(''),
  descriptionEs: text('description_es').notNull().default(''),
  url: text('url'),
  fileEnUrl: text('file_en_url'),
  fileEsUrl: text('file_es_url'),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt'),
  thumbnailUrl: text('thumbnail_url'),
})

/* ─── Skills (software icons) ────────────────────────────────────────────── */
export const skills = pgTable('skills', {
  ...content(),
  name: text('name').notNull(),
  iconUrl: text('icon_url').notNull().default(''),
  level: integer('level').notNull().default(0),
})

/* ─── Blog ───────────────────────────────────────────────────────────────── */
export const postStatus = pgEnum('post_status', ['draft', 'published'])

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: postStatus('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    coverUrl: text('cover_url'),
    coverAltEn: text('cover_alt_en'),
    coverAltEs: text('cover_alt_es'),
    tags: text('tags').array().notNull().default([]),
    // English
    titleEn: text('title_en'),
    slugEn: text('slug_en'),
    excerptEn: text('excerpt_en'),
    contentEn: text('content_en'),
    readingTimeEn: integer('reading_time_en'),
    // Spanish
    titleEs: text('title_es'),
    slugEs: text('slug_es'),
    excerptEs: text('excerpt_es'),
    contentEs: text('content_es'),
    readingTimeEs: integer('reading_time_es'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('posts_slug_en_idx').on(t.slugEn),
    uniqueIndex('posts_slug_es_idx').on(t.slugEs),
    index('posts_status_published_idx').on(t.status, t.publishedAt),
  ]
)

/** Old slugs that 308-redirect to the current post (so links never break) */
export const postSlugRedirects = pgTable(
  'post_slug_redirects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    lang: text('lang').notNull(), // 'en' | 'es'
    slug: text('slug').notNull(),
    createdAt: timestamps().createdAt,
  },
  (t) => [uniqueIndex('post_slug_redirects_lang_slug_idx').on(t.lang, t.slug)]
)

/** View counter per post (both languages combined) */
export const postViews = pgTable('post_views', {
  postId: uuid('post_id')
    .primaryKey()
    .references(() => posts.id, { onDelete: 'cascade' }),
  count: integer('count').notNull().default(0),
})

/* ─── Comments (moderated) ───────────────────────────────────────────────── */
export const commentStatus = pgEnum('comment_status', ['pending', 'approved', 'rejected', 'spam'])

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    lang: text('lang').notNull(), // language of the page where it was written
    name: text('name').notNull(),
    body: text('body').notNull(),
    status: commentStatus('status').notNull().default('pending'),
    ipHash: text('ip_hash').notNull(), // salted hash, never the raw IP
    userAgent: text('user_agent'),
    createdAt: timestamps().createdAt,
    approvedAt: timestamp('approved_at', { withTimezone: true }),
  },
  (t) => [
    index('comments_post_status_idx').on(t.postId, t.status),
    index('comments_ip_created_idx').on(t.ipHash, t.createdAt),
  ]
)
