"use client"

import { Button } from "@/components/ui/button"
import { updateIssue } from "@/db/queries"
import {
  SelectInstruction,
  SelectIssue,
  SelectProject,
  stepOrder
} from "@/db/schema"
import { runCompletedStep } from "@/lib/runs/run-completed-step"
import { runEmbeddingStep } from "@/lib/runs/run-embedding-step"
import { runImplementationStep } from "@/lib/runs/run-implementation-step"
import { runPlanStep } from "@/lib/runs/run-plan-step"
import { runPRStep } from "@/lib/runs/run-pr-step"
import { runRetrievalStep } from "@/lib/runs/run-retrieval-step"
import { runSpecificationStep } from "@/lib/runs/run-specification-step"
import { runStartStep } from "@/lib/runs/run-start-step"
import {
  ParsedImplementation,
  ParsedPlan,
  ParsedSpecification,
  RunStepName,
  RunStepStatus,
  RunStepStatuses
} from "@/types/run"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RunButton } from "./run-button"
import { RunStepContent } from "./run-step-content"
import { RunStepStatusList } from "./run-step-status-list"
import { RunTooltip } from "./run-tooltip"
import { createRun, getRunsByIssueId, updateRun } from "@/db/queries/runs-queries"
import { createRunStep } from "@/db/queries/run-steps-queries"

interface RunDashboardProps {
  issue: SelectIssue
  project: SelectProject
  instructions: SelectInstruction[]
}

export const RunDashboard = ({
  issue,
  project,
  instructions
}: RunDashboardProps) => {
  const router = useRouter()
  const [selectedStep, setSelectedStep] = useState<RunStepName | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<RunStepName | null>(null)
  const [stepStatuses, setStepStatuses] = useState<RunStepStatuses>({
    started: null,
    embedding: null,
    retrieval: null,
    specification: null,
    plan: null,
    implementation: null,
    pr: null,
    completed: null
  })
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const [prLink, setPrLink] = useState("")
  const [specificationResponse, setSpecificationResponse] = useState("")
  const [parsedSpecification, setParsedSpecification] =
    useState<ParsedSpecification>({ steps: [] })
  const [planResponse, setPlanResponse] = useState("")
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan>({ steps: [] })
  const [parsedImplementation, setParsedImplementation] =
    useState<ParsedImplementation>({
      files: [],
      prTitle: "",
      prDescription: ""
    })
  const [latestCodebaseFiles, setLatestCodebaseFiles] = useState<
    { path: string; content: string }[]
  >([])
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)

  const instructionsContext = instructions
    .map(
      instruction =>
        `<instruction name="${instruction.name}">
${instruction.content}
</instruction>`
    )
    .join("\n\n")

  useEffect(() => {
    setSelectedStep(null)
  }, [currentStep])

  useEffect(() => {
    const fetchExistingRun = async () => {
      const runs = await getRunsByIssueId(issue.id)
      const latestRun = runs[0]
      if (latestRun && latestRun.status === "in_progress") {
        setCurrentRunId(latestRun.id)
        setCurrentStep(latestRun.currentStep)
        setIsRunning(true)
      }
    }
    fetchExistingRun()
  }, [issue.id])

  const updateStepStatus = (step: RunStepName, status: RunStepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const runNextStep = async (step: RunStepName) => {
    const stepStatus = stepStatuses[step]

    if (stepStatus === null) {
      updateStepStatus(step, "in_progress")

      try {
        switch (step) {
          case "started":
            await runStartStep()
            break
          case "embedding":
            await runEmbeddingStep({ project })
            break
          case "retrieval":
            const retrievalStepResponse = await runRetrievalStep({
              issue,
              project
            })
            setLatestCodebaseFiles(
              retrievalStepResponse.codebaseFiles.map(file => ({
                path: file.path,
                content: file.content || ""
              }))
            )
            setWaitingForConfirmation(true)
            return
          case "specification":
            const specificationStepResponse = await runSpecificationStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext
            })
            setSpecificationResponse(
              specificationStepResponse.specificationResponse
            )
            setParsedSpecification(
              specificationStepResponse.parsedSpecification
            )
            setWaitingForConfirmation(true)
            return
          case "plan":
            const planStepResponse = await runPlanStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              specification: specificationResponse
            })
            setPlanResponse(planStepResponse.planResponse)
            setParsedPlan(planStepResponse.parsedPlan)
            setWaitingForConfirmation(true)
            return
          case "implementation":
            const implementationStepResponse = await runImplementationStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              plan: planResponse
            })
            setParsedImplementation(
              implementationStepResponse.parsedImplementation
            )
            setWaitingForConfirmation(true)
            return
          case "pr":
            const prStepResponse = await runPRStep({
              issue,
              project,
              parsedImplementation
            })
            setPrLink(prStepResponse.prLink)
            break
          case "completed":
            await runCompletedStep()
            updateIssue(issue.id, { status: "completed" })
            break
        }

        handleStepCompletion(step, stepOrder.indexOf(step))
      } catch (error) {
        console.error("Error running step:", error)
        updateStepStatus(step, "failed")
      }
    }
  }

  const handleConfirmation = () => {
    setWaitingForConfirmation(false)
    if (currentStep) {
      handleStepCompletion(currentStep, stepOrder.indexOf(currentStep))
    }
  }

  const handleStepCompletion = async (stepName: RunStepName, stepIndex: number) => {
    if (currentRunId) {
      await updateRun(currentRunId, { currentStep: stepName })
      await createRunStep({
        runId: currentRunId,
        name: stepName,
        status: "completed",
        content: JSON.stringify(
          stepName === "specification"
            ? parsedSpecification
            : stepName === "plan"
            ? parsedPlan
            : stepName === "implementation"
            ? parsedImplementation
            : null
        )
      })
    }
    updateStepStatus(stepName, "completed")
    const nextStep = stepOrder[stepIndex + 1]
    const isLastStep = stepIndex === stepOrder.length - 1

    if (isLastStep) {
      setIsRunning(false)
      if (currentRunId) {
        await updateRun(currentRunId, { status: "completed" })
      }
    } else {
      setCurrentStep(nextStep)
      runNextStep(nextStep)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setWaitingForConfirmation(false)
    const run = await createRun({
      issueId: issue.id,
      status: "in_progress",
      currentStep: stepOrder[0]
    })
    setCurrentRunId(run.id)
    setCurrentStep(stepOrder[0])
    runNextStep(stepOrder[0])
  }

  const handleStepClick = (step: RunStepName) => {
    const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1
    const clickedStepIndex = stepOrder.indexOf(step)

    if (clickedStepIndex <= currentStepIndex) {
      setSelectedStep(step)
    }
  }

  const updateParsedSpecification = (
    updatedSpecification: ParsedSpecification
  ) => {
    setParsedSpecification(updatedSpecification)

    const xmlSpecification = `<specification>
${updatedSpecification.steps.map(step => `  <step>${step.text}</step>`).join("\n")}
</specification>`

    setSpecificationResponse(xmlSpecification)
  }

  const updateParsedPlan = (updatedPlan: ParsedPlan) => {
    setParsedPlan(updatedPlan)

    const xmlPlan = `<plan>
${updatedPlan.steps.map(step => `  <step>${step.text}</step>`).join("\n")}
</plan>`

    setPlanResponse(xmlPlan)
  }

  const updateParsedImplementation = (
    updatedImplementation: ParsedImplementation
  ) => {
    setParsedImplementation(updatedImplementation)
  }

  return (
    <>
      <div className="w-full border-b">
        <div className="flex h-14 items-center justify-between px-4 lg:h-[59px]">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push(`.`)}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>

            <RunTooltip issueName={issue.name} issueContent={issue.content} />

            <div className="truncate font-bold">{issue.name}</div>
          </div>

          <RunButton
            isRunning={isRunning}
            issueStatus={issue.status}
            waitingForConfirmation={waitingForConfirmation}
            onRun={handleRun}
            onConfirm={handleConfirmation}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="grid size-full grid-cols-12">
          <div className="col-span-4 overflow-y-auto border-r p-4">
            <RunStepStatusList
              currentStep={currentStep}
              waitingForConfirmation={waitingForConfirmation}
              onStepClick={handleStepClick}
              stepStatuses={stepStatuses}
            />
          </div>

          <div className="col-span-8 overflow-y-auto p-6">
            <RunStepContent
              stepName={selectedStep || currentStep}
              prLink={prLink}
              specification={parsedSpecification}
              plan={parsedPlan}
              implementation={parsedImplementation}
              onUpdateSpecification={updateParsedSpecification}
              onUpdatePlan={updateParsedPlan}
              onUpdateImplementation={updateParsedImplementation}
            />
          </div>
        </div>
      </div>
    </>
  )
}