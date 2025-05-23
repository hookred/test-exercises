import { z } from "zod"

export const TitleSchema = z
	.string({ required_error: 'Title is required' })
	.min(3, { message: 'Title is too short' })
	.max(100, { message: 'Title is too long' })

export const ContentSchema = z
	.string()