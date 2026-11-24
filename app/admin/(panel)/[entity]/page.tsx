import { notFound } from 'next/navigation'
import { ENTITIES } from '@/lib/admin/entities'
import { listEntity } from '@/lib/admin/actions'
import EntityList from '@/components/admin/EntityList'

type Params = Promise<{ entity: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { entity } = await params
  return { title: ENTITIES[entity]?.label ?? 'Admin' }
}

export default async function EntityListPage({ params }: { params: Params }) {
  const { entity } = await params
  const def = ENTITIES[entity]
  if (!def || def.singleton) notFound()
  const rows = await listEntity(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EntityList entity={entity} rows={rows as any} />
}
