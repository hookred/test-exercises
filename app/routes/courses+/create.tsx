import { getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, data, type LoaderFunctionArgs } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";
import { FormTemplate } from "#app/components/forms/default-form.tsx";
import { InputField } from "#app/components/forms.tsx";
import { createCourse } from "#app/models/course.server.ts";
import { useIsPending } from "#app/utils/misc.tsx";
import { requireUserWithPermission } from "#app/utils/permissions.server.ts";
import { redirectWithToast } from "#app/utils/toast.server.ts";
import { CreateCourseSchema } from "#app/validation/course-validation.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithPermission(request, 'create:course');
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithPermission(request, 'create:course');
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: CreateCourseSchema
      .transform(async (data) => {
        return await createCourse(data)
      }),
    async: true
  });

  if (submission.status !== 'success') {
    return data(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { id } = submission.value;

  return redirectWithToast(
    safeRedirect(`/courses/${id}`),
    { title: 'Course', description: 'The course has been successfully created!' }
  )
}

export default function NewCourse() {
  const isPending = useIsPending();
  const [form, fields] = useForm({
    id: 'create-course',
    constraint: getZodConstraint(CreateCourseSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateCourseSchema })
    },
    shouldRevalidate: 'onBlur'
  })

  return (
    <main className="container">
      <FormTemplate method="POST" form={form} isPending={isPending}>
        <InputField
          label="Title"
          errors={fields.title.errors}
          {...getInputProps(fields.title, { type: 'text' }) }
        />

        {/* TODO: Use a textarea */}
        <InputField
          label="Content"
          errors={fields.content.errors}
          { ...getInputProps(fields.content, { type: 'text' })}
        />
      </FormTemplate>
    </main>
  )
}