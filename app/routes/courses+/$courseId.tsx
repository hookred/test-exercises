import { invariant, invariantResponse } from "@epic-web/invariant";
import { Plus } from "lucide-react";
import { type LoaderFunctionArgs, Outlet, useLoaderData, useNavigate, useOutlet } from "react-router";
import { LinkButton } from "#app/components/custom-buttons.tsx";
import { ListSkillsTable } from "#app/components/sections/skills/list-skills-table.tsx";
import { Hero1 } from "#app/components/ui/hero1.tsx";
import { Sheet, SheetContent } from "#app/components/ui/sheet.tsx";
import { findCourse, getCourses } from "#app/models/course.server.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.courseId, 'Missing courseId param');
  const course = await findCourse(parseInt(params.courseId))

  // TODO: This is not a good idea to fetch all courses each time
  // TODO: Just do it for allowed users.
  const courses = await getCourses();

  invariantResponse(course, 'Not found', { status: 404 })
  return { course, courses }
}

export default function CourseRoute() {
  const inOutlet = !!useOutlet();
  const navigate = useNavigate();
  
  const { course } = useLoaderData<typeof loader>();

  function onOpenChange(open: boolean) {
    if (!open) {
      void navigate(`/courses/${course.id}`);
    }
  }


  return (
    <main>
      <Hero1
        heading={course.title}
        description={course.description || ''}
      />

      <div className="container">
        <LinkButton to="./create-skill">
          <Plus /> Create a skill
        </LinkButton>

        <ListSkillsTable skills={course.skills} />
      </div>

      <Sheet open={inOutlet} onOpenChange={onOpenChange}>
        <SheetContent>
          <Outlet />
        </SheetContent>
      </Sheet>
    </main>
  )
}