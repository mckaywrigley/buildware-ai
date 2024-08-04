interface CompletedStepProps {
  prLink: string
}

export const CompletedStep = ({ prLink }: CompletedStepProps) => {
  return (
    <div>
      <div>Run Complete</div>
      <div>
        PR Link:{" "}
        <a href={prLink} target="_blank" rel="noopener noreferrer">
          {prLink}
        </a>
      </div>
    </div>
  )
}
