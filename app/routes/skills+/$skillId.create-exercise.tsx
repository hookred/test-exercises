import { getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { type ActionFunctionArgs, data, type LoaderFunctionArgs } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { FormTemplate } from "#app/components/forms/default-form.tsx";
import { TextareaField } from "#app/components/forms.tsx";
import { SheetDescription, SheetHeader, SheetTitle } from "#app/components/ui/sheet.tsx";
import { createExercise } from "#app/models/exercise.server.ts";
import { findSkill } from "#app/models/skill.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { useIsPending } from "#app/utils/misc.tsx";
import { requireUserWithPermission } from "#app/utils/permissions.server.ts";
import { redirectWithToast } from "#app/utils/toast.server.ts";
import { CreateExerciseSchema } from "#app/validation/exercise-validation.ts";


export async function action({ request, params }: ActionFunctionArgs) {
  invariantResponse(params.skillId, 'Not found', { status: 404 })
  
  const skillId = parseInt(params.skillId);
  const skill = await findSkill(skillId);  
  invariantResponse(skill, 'Not found', { status: 404 });

  await requireUserWithPermission(request, 'create:exercise');
  const formData = await request.formData();


  const submission = await parseWithZod(formData, {
    schema: CreateExerciseSchema
      .superRefine(async (data, ctx) => {
        const skill = await prisma.skill.findUnique({
          select: { id: true },
          where: { id: skillId }
        });
        if (!skill) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Skill not found',
          })
        }
      })
      .transform(async (data) => {
        return {
          exercise: await createExercise(data, skillId),
          skillId: skillId
        }
      }),
    async: true
  })

  if (submission.status !== 'success') {
    return data(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  return redirectWithToast(
    safeRedirect(`/skills/${submission.value.skillId}`),
    { description: 'Exercise successfully created!' }
  )
}

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.skillId, 'Not found', { status: 404 })
}


export default function CreateExerciseOnSkill() {
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: 'create-exercise',
    constraint: getZodConstraint(CreateExerciseSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateExerciseSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <>
      <SheetHeader>
        <SheetTitle>Create a new exercise</SheetTitle>
        <SheetDescription>
          Quickly create a new exercise here. Click save when you're done.
        </SheetDescription>
      </SheetHeader>
      <div className="px-4">
        <FormTemplate
          form={form}
          isPending={isPending}
          method="POST"
        >
          <TextareaField
            label="Question"
            errors={fields.content.errors}
            { ...getTextareaProps(fields.content) }
          />

          <TextareaField
            label="Answer"
            errors={fields.result.errors}
            { ...getTextareaProps(fields.result) }
          />
        </FormTemplate>
      </div>
    </>
  )
}