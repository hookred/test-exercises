import { type Exercise } from "@prisma/client";
import { useState } from "react";
import { Form } from "react-router";
import { Button } from "#app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "#app/components/ui/card";
import { DisplayExercise } from "./display-exercise";

export function ExerciseTraining({
  exercise,
}: {
  exercise: Exercise,
}) {
  const [cardState, setCardState] = useState<'front' | 'showing-answer' | 'showing-result'>('front');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise</CardTitle>
      </CardHeader>
      <CardContent>
        <DisplayExercise
          displayAnswer={(cardState === 'showing-answer' || cardState === 'showing-result')}
          answerDisplayMessage="Hidden answer"
          hideBack
          exercise={exercise}
        />
      </CardContent>
      <CardFooter>
        <Form method="POST" className="flex justify-between">
          <input type="hidden" name="exerciseId" value={exercise.id} />
          {cardState === 'front' && (
            <Button type="button" onClick={() => setCardState('showing-answer')}>Reveal Answer</Button>
          )}
          {cardState === 'showing-answer' && (
            <Button type="button" onClick={() => setCardState('showing-result')}>Did you get it right?</Button>
          )}
          {cardState === 'showing-result' && (
            <>
              <Button
                variant="destructive"
                // onClick={() => onAnswer(false)}
                name="success"
                value="false"
              >
                Failed
              </Button>
              <Button
                // onClick={() => onAnswer(true)}
                name="success"
                value="true"
              >
                Success
              </Button>
            </>
          )}
        </Form>
      </CardFooter>
    </Card>
  )
}