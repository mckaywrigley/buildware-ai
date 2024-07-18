let progressCallback: ((progress: number) => void) | null = null

export function setProgressCallback(callback: (progress: number) => void) {
  progressCallback = callback
}

export function trackGenerationProgress(iteration: number, isComplete: boolean) {
  if (progressCallback) {
    const progress = isComplete ? 100 : Math.min((iteration + 1) * 20, 80)
    progressCallback(progress)
  }
}