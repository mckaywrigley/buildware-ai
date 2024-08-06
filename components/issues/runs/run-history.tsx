import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { SelectRun, SelectRunStep } from "@/db/schema"
import { formatDistanceToNow } from "date-fns"

interface RunHistoryProps {
  runsWithSteps: (SelectRun & { steps: SelectRunStep[] })[]
}

export const RunHistory = ({ runsWithSteps }: RunHistoryProps) => {
  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Run History</div>

      <Accordion type="single" collapsible className="w-full">
        {runsWithSteps.map((run, index) => (
          <AccordionItem key={run.id} value={`item-${index}`}>
            <AccordionTrigger>
              Run {index + 1} - {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-2">
                <div>Status: {run.status}</div>
                <div>Total Cost: ${run.cost}</div>
                <div className="font-semibold">Steps:</div>
                <div>
                  {run.steps.map(step => (
                    <div key={step.id}>
                      {step.name} - Status: {step.status}, Cost: ${step.cost}
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}