"use client"

import type * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { Label } from "#app/components/ui/label"
import { cn } from "#app/utils/misc.tsx"

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  htmlFor,
  error,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  error: string
}) {

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  FormItem,
  FormLabel,
  FormDescription,
}
