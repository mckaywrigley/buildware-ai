"use client"

import { createProject, createWorkspace } from "@/db/queries"
import { createProfile } from "@/db/queries/profiles-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const ProfileCreator = async () => {
  const router = useRouter()

  useEffect(() => {
    const handleCreateProfile = async () => {
      try {
        const profileResult = await createProfile({});
        if ('error' in profileResult) {
          console.error('Error creating profile:', profileResult.error);
          // Handle the error (e.g., show an error message to the user)
          return;
        }

        const workspace = await createWorkspace({ name: "My Workspace" });
        const project = await createProject({
          name: "My Project",
          workspaceId: workspace.id
        });
        router.push(`/${workspace.id}/${project.id}/issues`);
      } catch (error) {
        console.error("Error in profile creation process:", error);
        // Handle the error (e.g., show an error message to the user)
      }
    };

    handleCreateProfile();
  }, []);

  return <></>;
};