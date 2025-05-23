import { Terminal } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#app/components/ui/alert"

export function NoExercise({
  message="We found no exercise"
}) {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}