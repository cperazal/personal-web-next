import { notFound } from 'next/navigation'
import { ENTITIES } from '@/lib/admin/entities'
import { getEntity } from '@/lib/admin/actions'
import EntityForm from '@/components/admin/EntityForm'

type Params = Promise<{ entity: string; id: string }>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EntityEditPage({ params }: { params: Params }) {
  const { entity, id } = await params
  const def = ENTITIES[entity]
  if (!def || def.singleton) notFound()

  const isNew = id === 'new'
  if (!isNew && !UUID.test(id)) notFound()
  const row = isNew ? {} : await getEntity(entity, id)
  if (!row) notFound()

  const title = isNew ? `Nuevo ${def.singular}` : String(row[def.list.title] ?? def.singular)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <EntityForm entity={entity} id={isNew ? null : id} initial={row} />
    </div>
  )
}
