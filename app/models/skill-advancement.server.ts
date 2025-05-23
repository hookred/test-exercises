import { type Prisma, type PrismaClient } from "@prisma/client"
import { type DefaultArgs } from "@prisma/client/runtime/library"

function between0and100(n: number) {
  return Math.max(Math.min(n, 100), 0)
}


export async function createOrUpdateSkillAdvancement(data: {
  increase: number,
  userId: string,
  skillId: number,
}, tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
  const skillAdvancement = await tx.skillAdvancement.findFirst({
    where: {
      userId: data.userId,
      skillId: data.skillId
    }
  })

  if (skillAdvancement) {
    return await tx.skillAdvancement.update({
      where: {
        userId_skillId: {
          userId: data.userId,
          skillId: data.skillId
        }
      },
      data: {
        // This is arbitrary for now, just check that it's between 0 and 100
        progress: between0and100(skillAdvancement.progress + data.increase)
      }
    })
  }

  return await tx.skillAdvancement.create({
    data: {
      userId: data.userId,
      skillId: data.skillId,
      progress: between0and100(data.increase)
    }
  })
} 