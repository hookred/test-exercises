import { z } from "zod";
import { ContentSchema, TitleSchema } from "./global-validation";

export const CreateSkillSchema = z.object({
  title: TitleSchema,
  description: ContentSchema,
  courseId: z.number({ required_error: 'Course is required' })
})