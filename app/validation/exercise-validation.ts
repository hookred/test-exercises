import { z } from "zod";
import { ContentSchema } from "./global-validation";

export const CreateExerciseSchema = z.object({
  content: ContentSchema,
  result: ContentSchema,
})

export const AnswerExerciseSchema = z.object({
  exerciseId: z.number({ required_error: "Exercise Id is required"}),
  success: z.coerce.boolean({ required_error: "Success status is required" })
})