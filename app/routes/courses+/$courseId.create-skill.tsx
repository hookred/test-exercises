import { getInputProps, getSelectProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { FormTemplate } from "#app/components/forms/default-form.tsx";
import { InputField, SelectField } from "#app/components/forms.tsx";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "#app/components/ui/select.tsx";
import { SheetDescription, SheetHeader, SheetTitle } from "#app/components/ui/sheet.tsx";
import { getCourses } from "#app/models/course.server.ts";
import { createSkill } from "#app/models/skill.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { useIsPending } from "#app/utils/misc.tsx";
import { requireUserWithPermission } from "#app/utils/permissions.server.ts";
import { redirectWithToast } from "#app/utils/toast.server.ts";
import { CreateSkillSchema } from "#app/validation/skill-validation.ts";


export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithPermission(request, 'create:skill');
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: CreateSkillSchema
      .superRefine(async (data, ctx) => {
        const course = await prisma.course.findUnique({
          select: { id: true },
          where: { id: data.courseId }
        });
        if (!course) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Course not found',
          })
        }
      })
      .transform(async (data) => {
        return {
          skill: await createSkill(data),
          courseId: data.courseId
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
    safeRedirect(`/courses/${submission.value.courseId}`),
    { description: 'Skill successfully created!' }
  )
}

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.courseId, 'Not found', { status: 404 })
  const courseId = parseInt(params.courseId);
  return {
    courses: await getCourses(),
    defaultCourseId: courseId,
  }
}


export default function CreateSkillOnCourse() {
  const { courses, defaultCourseId } = useLoaderData<typeof loader>()
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: 'create-skill',
    constraint: getZodConstraint(CreateSkillSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateSkillSchema })
    },
    shouldRevalidate: 'onBlur',
    defaultValue: {
      courseId: defaultCourseId
    }
  })
  
  return (
    <>
      <SheetHeader>
        <SheetTitle>Create a new skill</SheetTitle>
        <SheetDescription>
          Quickly create a new skill here. Click save when you're done.
        </SheetDescription>
      </SheetHeader>
      <div className="px-4">
        <FormTemplate form={form} isPending={isPending} method="POST">
          <InputField
            label="Title"
            errors={fields.title.errors}
            { ...getInputProps(fields.title, { type: 'text' }) }
          />

          <InputField
            label="Description"
            errors={fields.description.errors}
            { ...getInputProps(fields.description, { type: 'text' }) }
          />

          <SelectField // Specify the form inputs type
            {...getSelectProps(fields.courseId) }
            defaultValue={fields.courseId.initialValue}
            label="Course id"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course to associate this new skill" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem
                  value={String(course.id)}
                  key={course.id}
                >
                    {course.title}
                </SelectItem>
              ))}
            </SelectContent>

          </SelectField>
        </FormTemplate>
      </div>
    </>
  )
}