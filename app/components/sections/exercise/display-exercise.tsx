import { type Exercise } from "@prisma/client";
import MarkdownRenderer from "#app/components/ui/markdown-renderer";
import { cn } from "#app/utils/misc.tsx";


export function DisplayExercise({
  exercise,
  displayAnswer=false,
  answerDisplayMessage="(HIDDEN) Click to reveal",
  className,
  hideBack=false,
  ...props
}: {
  exercise: Exercise,
  displayAnswer: boolean,
  answerDisplayMessage: string,
  hideBack: boolean
} & React.ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div>
        <strong>Content</strong>
        <MarkdownRenderer markdownContent={exercise.content} />
      </div>

      { (!hideBack || displayAnswer) &&
        <div>
          <strong>Answer</strong>
          {displayAnswer ?
            <MarkdownRenderer markdownContent={exercise.result} />
          : 
            <p className="italic">{answerDisplayMessage}</p>
          }
        </div>
      }
    </div>
  )
}