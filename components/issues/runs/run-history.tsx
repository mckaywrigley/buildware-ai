import { SelectRun, SelectRunStep } from "@/db/schema"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatDistanceToNow } from "date-fns"

interface RunHistoryProps {
  runs: (SelectRun & { steps: SelectRunStep[] })[]
}

export const RunHistory = ({ runs }: RunHistoryProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Run History</h2>
      <Accordion type="single" collapsible className="w-full">
        {runs.map((run, index) => (
          <AccordionItem key={run.id} value={`item-${index}`}>
            <AccordionTrigger>
              Run {index + 1} - {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>Status: {run.status}</p>
                <p>Total Cost: ${run.totalCost}</p>
                <h3 className="font-semibold">Steps:</h3>
                <ul className="list-inside list-disc">
                  {run.steps.map(step => (
                    <li key={step.id}>
                      {step.stepName} - Status: {step.status}, Cost: ${step.cost}
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}