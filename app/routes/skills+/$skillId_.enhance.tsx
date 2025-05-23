import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { type ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { z } from "zod";
import { GoBackButton } from "#app/components/custom-buttons.tsx";
import { ExerciseTraining } from "#app/components/sections/exercise/exercise-training.tsx";
import { NoExercise } from "#app/components/sections/exercise/no-exercise.tsx";
import { answerExercise, getExerciseToEnhanceSkill } from "#app/models/exercise.server.ts";
import { findSkill } from "#app/models/skill.server.ts";
import { requireUserId } from "#app/utils/auth.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { redirectWithToast } from "#app/utils/toast.server.ts";
import { AnswerExerciseSchema } from "#app/validation/exercise-validation.ts";

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  invariantResponse(params.skillId, 'Not found', { status: 404 });
  
  const skillId = parseInt(params.skillId);
  const skill = await findSkill(skillId);
  invariantResponse(skill, 'Not found', { status: 404 });
  
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: () =>
      AnswerExerciseSchema.superRefine(async (data, ctx) => {
        const exercise = await prisma.exercise.findUnique({
          select: { id: true },
          where: { id: data.exerciseId }
        })
        if (!exercise) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Exercise not found"
          });
        }
      })
      .transform(async (data) => {
        await answerExercise({
          userId,
          exerciseId: data.exerciseId,
          succeed: data.success
        })
      }),
      async: true
  });

  if (submission.status !== 'success') {
    console.error(submission.error);
    console.error(submission.error);
    return redirectWithToast('./', {
      title: 'Oops',
      description: 'An error occured',
      type: 'error'
    })
  }

}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariantResponse(params.skillId, 'Not found', { status: 404 });
  
  const skillId = parseInt(params.skillId);
  const skill = await findSkill(skillId);
  
  invariantResponse(skill, 'Not found', { status: 404 });
  
  const exercise = await getExerciseToEnhanceSkill(userId, skillId);

  return { exercise, skillId }
}

export default function SkillEnhanceRoute() {
  const { exercise, skillId } = useLoaderData<typeof loader>();

  return (
    <main className="container">
      
      <GoBackButton to={`/skills/${skillId}`}>
        Go back to skill
      </GoBackButton>

      { exercise ? (
        <ExerciseTraining
          exercise={exercise}
        />
      ) : (
        <NoExercise />
      )}

    </main>
  )
}