import { z } from "zod";
import { TitleSchema, ContentSchema } from "./global-validation";

export const CreateCourseSchema = z.object({
  title: TitleSchema,
  content: ContentSchema
})