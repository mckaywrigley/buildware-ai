"use client"

import {
  ParsedSpecification,
  SpecificationStep as SpecificationStepType
} from "@/types/run"
import { EditableStep } from "./editable-step"

interface SpecificationStepProps {
  specification: ParsedSpecification
  onUpdateSpecification: (updatedSpecification: ParsedSpecification) => void
}

export const SpecificationStep = ({
  specification,
  onUpdateSpecification
}: SpecificationStepProps) => {
  const handleUpdateItems = (updatedItems: SpecificationStepType[]) => {
    onUpdateSpecification({ ...specification, steps: updatedItems })
  }

  return (
    <EditableStep
      items={specification.steps}
      onUpdateItems={handleUpdateItems}
      title="Specification"
      description="Edit, remove, or add new steps as needed."
      itemName="specification"
    />
  )
}
