import { type z } from "zod";
import { prisma } from "#app/utils/db.server.ts";
import { type CreateSkillSchema } from "#app/validation/skill-validation.ts";

export async function createSkill(skill: z.infer<typeof CreateSkillSchema>) {
  return await prisma.skill.create({
    data: {
      title: skill.title,
      description: skill.description,
      courses: {
        connect: {
          id: skill.courseId
        }
      }
    },
    select: {
      id: true,
      title: true,
      description: true
    }
  })
}

export async function findSkill(skillId: number) {
  return await prisma.skill.findUnique({
    where: { id: skillId },
    select: {
      id: true,
      title: true,
      description: true,

      exercises: {
        select: {
          exercise: {
            select: {
              id: true,
              content: true,
              result: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        }
      },

      courses: {
        select: {
          id: true,
          title: true,
          description: true
        }
      }
    }
  })
}