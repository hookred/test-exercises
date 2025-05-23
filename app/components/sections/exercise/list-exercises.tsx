import { type Exercise } from "@prisma/client";
import { LinkButton } from "#app/components/custom-buttons.tsx";
import { Button } from "#app/components/ui/button"
import { Card, CardContent } from "#app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#app/components/ui/dialog"
import MarkdownRenderer from "#app/components/ui/markdown-renderer";

interface Props {
  exercises: Exercise[],
  canEditExercise: boolean
}

export function ListExercises({ exercises, canEditExercise }: Props) {
  if (exercises.length == 0) {
    return (
      <p className="text-center italic text-gray-400">
        No exercise now.
      </p>
    )
  }
  return (
    <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
      {exercises.map(exercise => (
        <ExerciseCard exercise={exercise} key={exercise.id} canEditExercise={canEditExercise} />
      ))}
    </div>
  )
}

async function ExerciseCard({ exercise, canEditExercise }: { exercise: Exercise, canEditExercise: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer">
          <CardContent className="space-y-4">
            <div>
              <strong>Content</strong>
              <MarkdownRenderer markdownContent={exercise.content} />
            </div>
            
            <div>
              <strong>Answer</strong>
              <p className="italic">HIDDEN (click to reveal)</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exercise</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <strong>Content</strong>
            <MarkdownRenderer markdownContent={exercise.content} />
          </div>

          <div>
            <strong>Answer</strong>
            <MarkdownRenderer markdownContent={exercise.result} />
          </div>
        </div>

        <DialogFooter>
          {canEditExercise &&
            <LinkButton to={`/exercises/${exercise.id}/edit`} variant="link">Edit</LinkButton>
          }
          <Button disabled>Add to my collection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}