import { ContextGroupForm } from "@/components/context-groups/ContextGroupForm"

export const revalidate = 0

export default async function CreateContextGroupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Create New Context Group</h1>
      <ContextGroupForm />
    </div>
  )
}