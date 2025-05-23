import { getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Plus } from "lucide-react";
import { useLoaderData } from "react-router";
import { FormTemplate } from "#app/components/forms/default-form.tsx";
import { InputField } from "#app/components/forms.tsx";
import { Button } from "#app/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "#app/components/ui/sheet";
import { type loader } from "#app/routes/courses+/$courseId"
import { useIsPending } from "#app/utils/misc.tsx";
import { useOptionalUser, userHasPermission } from "#app/utils/user.ts";
import { CreateSkillSchema } from "#app/validation/skill-validation.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#app/components/ui/select.tsx";
import { FormControl } from "#app/components/ui/form.tsx";

export function QuickActions() {
  const user = useOptionalUser();
  const canCreateSkill = userHasPermission(
    user,
    'update:course'
  )

  return (
    <div>
      { canCreateSkill && <SheetSkill /> }
    </div>
  )
}

function SheetSkill() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus /> Create a skill
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a new skill</SheetTitle>
          <SheetDescription>
            Quickly create a new skill here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <CreateSkillForm />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CreateSkillForm() {
  const { courses } = useLoaderData<typeof loader>()
  const isPending = useIsPending();
  const [form, fields] = useForm({
    id: 'create-skill',
    constraint: getZodConstraint(CreateSkillSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateSkillSchema })
    },
    shouldRevalidate: 'onBlur'
  })

  return (
    <FormTemplate form={form} isPending={isPending}>
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

        { courses &&
          <FormField // Specify the form inputs type
            control={control} // Pass the control object from useForm
            name="courseId"
            label="Course id"
            render={({ field }) => (
              <Select onValueChange={field?.onChange} defaultValue={field?.value !== undefined ? String(field?.value) : undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course to associate this new skill" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem value={String(course.id)}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} // Specify that we want to render our reusable Input component
          />
        }
      </FormTemplate>
  )
}