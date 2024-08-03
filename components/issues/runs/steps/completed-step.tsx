interface CompletedStepProps {
  prLink: string
}

export const CompletedStep = ({ prLink }: CompletedStepProps) => {
  return (
    <div>
      <div>Run Complete</div>
      <div>PR Link: {prLink}</div>
    </div>
  )
}
