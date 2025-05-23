import { type z } from 'zod';
import { prisma } from '#app/utils/db.server.ts'
import { type CreateCourseSchema } from '#app/validation/course-validation.ts';

export async function getCourses() {
  return await prisma.course.findMany();
}


export async function createCourse(course: z.infer<typeof CreateCourseSchema>) {
  return await prisma.course.create({
    data: course,
    select: {
      id: true,
      title: true,
      description: true
    }
  })
}

export async function findCourse(courseId: number) {
  return await prisma.course.findFirst({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      skills: {
        select: {
          id: true,
          title: true,
          description: true,

          createdAt: true,
          updatedAt: true,
        }
      }
    }
  })
}