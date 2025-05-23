import { getFormProps, type useForm } from "@conform-to/react";
import { Form, type FormProps as DefaultFormProps } from "react-router";
import { Separator } from "#app/components/ui/separator";

import { ErrorList } from "../forms";
import { StatusButton } from "../ui/status-button";

type ConformFormType<Schema extends Record<string, any>> = ReturnType<typeof useForm<Schema>>[0];


// Define the props for the reusable Input component when used with FormField
interface FormProps<Schema extends Record<string, any>> extends DefaultFormProps {
  description?: string; // A description to add more details for specific fields
  ref?: React.Ref<HTMLFormElement>;
  isPending?: boolean,

  children: React.ReactNode,
  title?: string,
  submitButton?: {
    text: string
  },

  form: ConformFormType<Schema>;
}

export function FormTemplate<Schema extends Record<string, any>>({
  children,
  title,
  submitButton={
    text: "Save"
  },
  className,
  isPending,
  form,
  ...props
}: FormProps<Schema>) {
  return (
    <div className="">
      {title && <>
        <h2 className="text-lg font-medium">{title}</h2>
        <Separator className="mb-4" />
      </>}
      <ErrorList id={form.errorId} errors={form.errors} />

      <Form className={className} {...props} {...getFormProps(form)}>
        <div className="flex flex-col gap-6">
          {children}

          <div className="flex flex-col gap-3">
            <StatusButton
              form={form.id}
              type="submit"
              disabled={isPending}
              status={isPending ? 'pending' : 'idle'}
            >
              {submitButton.text}
            </StatusButton>
            {/* <Button disabled={pending} type="submit" className="w-full">
              {pending ? (
                <Loader className="animate-spin" stroke="2" />
              ) : (
                submitButton.text
              )}
            </Button> */}
          </div>
        </div>
      </Form>
    </div>
  )
}