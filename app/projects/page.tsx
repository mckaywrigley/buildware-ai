import { Button } from "@/components/ui/button"
import {
  createProject,
  getProjectsByUserId
} from "@/db/queries/project-queries"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
  const projects = await getProjectsByUserId()

  const handleCreateProject = async (formData: FormData) => {
    "use server"
    const project = await createProject({ name: "New Project" })
    return redirect(`/${project.id}`)
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div>No projects</div>
          <form action={handleCreateProject}>
            <Button type="submit">Create a new project</Button>
          </form>
        </div>
      ) : (
        <div className="flex w-full max-w-[300px] flex-col items-center justify-center gap-4">
          <div className="text-2xl font-bold">Select a project.</div>
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/${project.id}`}
              className="bg-secondary border-primary/20 group relative flex w-full items-center gap-2 rounded border p-4 hover:opacity-80"
            >
              <div>{project.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
