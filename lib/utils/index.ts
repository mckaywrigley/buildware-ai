import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function logError(context: string, error: unknown): void {
  console.error(`Error in ${context}:`, error);
  // In a production environment, you might want to use a more robust logging solution
  // or send the error to an error tracking service like Sentry
}