import { type Exercise } from "@prisma/client";
import { type z } from "zod";
import { prisma } from "#app/utils/db.server.ts";
import { type CreateExerciseSchema } from "#app/validation/exercise-validation.ts";
import { createOrUpdateSkillAdvancement } from "./skill-advancement.server";

export async function createExercise(exercise: z.infer<typeof CreateExerciseSchema>, skillId: number) {
  return await prisma.exercise.create({
    data: {
      content: exercise.content,
      result: exercise.result,
      skills: {
        create: [
          {
            skillId: skillId,
            impact: 100 // Max impact because the exercise is only linked to this skill
          }
        ]
      }
    }
  })
}


/**
 * Find an exercise associated to an id
 * @param id Id of an exercise (unique identifier)
 * @returns Exercise | null
 */
export const findExercise = async (id: number) => {
  return {
    exercise: await prisma.exercise.findUnique({
      where: {
        id
      }
    })
  };
}

/**
 * Search an exercise associated to a specific skill that the user has already tried
 * return firstly the exercise that the user failed. He can improve on them.
 * @param userId User id
 * @param skillId Search exercise of a specific skill
 * @returns Exercise | null
 */
const findAPreviousFailedExercise = async (userId: string, skillId: number) => {
  return await prisma.exercise.findFirst({
    include: {
      users: {
        take: 1,
        orderBy: [
          { succeed: 'asc' },
          { createdAt: 'asc' }
        ]
      }
    },
    where: {
      users: {
        every: {
          userId,
        }
      },
      skills: {
        every: {
          skillId
        }
      }
    },
  })
}

/**
 * Search an exercise associated to a specific skill and be sure that the specific
 * user never saw it.
 * @param userId User id
 * @param skillId Search exercise of a specific skill
 * @returns Exercise | null
 */
const findANewExercise = async (userId: string, skillId: number) => {
  return await prisma.exercise.findFirst({
    where: {
      skills: {
        some: {
          skillId
        }
      },
      users: {
        none: {
          userId
        }
      }
    },
    include: {
      skills: true
    }
  });
}

export async function getExerciseToEnhanceSkill(userId: string, skillId: number) {
  const chanceToFindNewExerciseFirst = 0.5

  const timeToFindNew = Math.random() > chanceToFindNewExerciseFirst;

  let exercise: Exercise | null = null;

  if (timeToFindNew) {
    exercise = await findANewExercise(userId, skillId);
    if (!exercise)
      exercise = await findAPreviousFailedExercise(userId, skillId)
  } else {
    exercise = await findAPreviousFailedExercise(userId, skillId)
    if (!exercise)
      exercise = await findANewExercise(userId, skillId);
  }
    
    return exercise
}

export interface AnswerExerciseProps {
  exerciseId: number,
  userId: string,
  succeed: boolean
}
export async function answerExercise(data: AnswerExerciseProps) {
  const exercise = await prisma.exercise.findFirstOrThrow({
    where: {
      id: data.exerciseId
    },
    include: {
      skills: true
    }
  });

  await prisma.$transaction(async (tx) => {
    await prisma.userOnExercise.create({
      data: {
        userId: data.userId,
        exerciseId: exercise.id,
        succeed: data.succeed
      }
    })
  
    await Promise.all(exercise.skills.map(skill => {
      return async () => {
        await createOrUpdateSkillAdvancement({
          userId: data.userId,
          skillId: skill.skillId,
          increase: data.succeed ? 10 : -10
        }, tx)
      }
    }))
  })


}