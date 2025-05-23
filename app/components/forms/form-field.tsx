'use client'; // Assuming you are using Next.js App Router

import React from 'react';
import { type Control, type FieldValues, type Path, type ControllerProps } from 'react-hook-form';
import {
  FormDescription,
  FormItem,
  FormLabel, 
  FormControl,
  FormField as ShadcnFormField, // Alias to avoid name collision
  FormMessage,
} from '#app/components/ui/form';
import { Input, type InputProps } from '#app/components/ui/input';
import { Textarea, type TextAreaProps } from '#app/components/ui/textarea';
// Import useController and Control type, FieldValues, RegisterOptions, and FieldPath


// Define the props for the reusable FormField component
interface ReusableFormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>> {
  control: Control<TFieldValues>; // The control object from useForm
  name: TName; // The name of the field
  label: string; // The label for the field
  // Use the correct type for the render prop directly from ControllerProps
  render: ControllerProps<TFieldValues, TName>['render'];
  description?: React.ReactNode; // Optional description for the field
}

// Reusable FormField component
export function FormField<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>>({
  control,
  name,
  label,
  render, // This render prop now has the correct type from ControllerProps
  description,
}: ReusableFormFieldProps<TFieldValues, TName>) {
  return (
    // Use shadcn's FormField wrapper for context
    // Shadcn's FormField is a wrapper around react-hook-form's Controller
    <ShadcnFormField
      control={control}
      name={name}
      // Pass the render prop directly to ShadcnFormField
      render={({ field, fieldState, formState }) => (
        // Use shadcn's FormItem for layout and structure
        <FormItem>
          {/* Use shadcn's FormLabel for the field label */}
          <FormLabel>{label}</FormLabel>
          {/* Use shadcn's FormControl to wrap the actual input component */}
          <FormControl>
            {/* Call the provided render function, passing the necessary props */}
            {/* The 'render' prop passed to ReusableFormField is the function we call here */}
            {render({ field, fieldState, formState })}
          </FormControl>
          {/* Optional: Display a description below the input */}
          {description && <FormDescription>{description}</FormDescription>}
          {/* Use shadcn's FormMessage to display validation errors */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Define props for the InputFormField, extending InputProps for standard input attributes
// This component simplifies the usage for standard text/number/etc. inputs
interface InputFormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>> extends InputProps {
  control: Control<TFieldValues>; // The control object from useForm
  name: TName; // The name of the field
  label: string; // The label for the field
  description?: React.ReactNode; // Optional description for the field
  // Input-specific props like type, placeholder, etc., are inherited from InputProps
}

// InputFormField component - now wraps FormField
export function InputFormField<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>>({
  control,
  name,
  label,
  description,
  // Destructure other InputProps like type, placeholder, etc.
  ...inputProps // Collect all other props to pass to the Input component
}: InputFormFieldProps<TFieldValues, TName>) {
  return (
    // Use the FormField component
    <FormField
      control={control} // Pass control
      name={name} // Pass name
      label={label} // Pass label
      description={description} // Pass description
      // Provide the render prop expected by FormField
      render={({ field }) => (
        // Render the Input component inside the render function
        <Input
          {...field} // Spread field props (value, onChange, onBlur, etc.)
          {...inputProps} // Spread all other props passed to InputFormField (type, placeholder, etc.)
        />
      )}
    />
  );
}

// Define props for the Textarea, extending InputProps for standard input attributes
// This component simplifies the usage for standard text/number/etc. inputs
interface TextareaProps<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>> extends TextAreaProps {
  control: Control<TFieldValues>; // The control object from useForm
  name: TName; // The name of the field
  label: string; // The label for the field
  description?: React.ReactNode; // Optional description for the field
  // Input-specific props like type, placeholder, etc., are inherited from InputProps
}

// Textarea component - now wraps FormField
export function TextareaFormField<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>>({
  control,
  name,
  label,
  description,
  // Destructure other InputProps like type, placeholder, etc.
  ...inputProps // Collect all other props to pass to the Input component
}: TextareaProps<TFieldValues, TName>) {
  return (
    // Use the FormField component
    <FormField
      control={control} // Pass control
      name={name} // Pass name
      label={label} // Pass label
      description={description} // Pass description
      // Provide the render prop expected by FormField
      render={({ field }) => (
        // Render the Input component inside the render function
        <Textarea
          {...field} // Spread field props (value, onChange, onBlur, etc.)
          {...inputProps} // Spread all other props passed to Textarea (type, placeholder, etc.)
        />
      )}
    />
  );
}