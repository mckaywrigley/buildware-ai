"use client"

import {
  ParsedSpecification,
  SpecificationStep as SpecificationStepType
} from "@/types/run"
import { EditableStep } from "./editable-step"

interface SpecificationStepProps {
  parsedSpecification: ParsedSpecification
  onUpdateParsedSpecification: (
    updatedParsedSpecification: ParsedSpecification
  ) => void
}

export const SpecificationStep = ({
  parsedSpecification,
  onUpdateParsedSpecification
}: SpecificationStepProps) => {
  const handleUpdateItems = (updatedItems: SpecificationStepType[]) => {
    onUpdateParsedSpecification({ ...parsedSpecification, steps: updatedItems })
  }

  return (
    <EditableStep
      items={parsedSpecification.steps}
      onUpdateItems={handleUpdateItems}
      title="Specification"
      description="Edit, remove, or add new steps as needed."
      itemName="specification"
    />
  )
}
