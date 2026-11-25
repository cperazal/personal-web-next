import { getEntity } from '@/lib/admin/actions'
import EntityForm from '@/components/admin/EntityForm'

export const metadata = { title: 'Perfil' }

export default async function ProfilePage() {
  const row = await getEntity('profile')
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Perfil</h1>
      <EntityForm entity="profile" id={(row?.id as string) ?? null} initial={row ?? {}} />
    </div>
  )
}
