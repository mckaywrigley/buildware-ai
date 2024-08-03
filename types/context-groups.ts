import { SelectContextGroup, SelectContextGroupFile } from "@/db/schema/context-groups-schema"

export interface ContextGroupWithFiles extends SelectContextGroup {
  files: SelectContextGroupFile[]
}