import { Plus } from "lucide-react";
import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "#app/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitleLink } from "#app/components/ui/card";
import { getCourses } from "#app/models/course.server.ts";
import { userWithPermission } from "#app/utils/permissions.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  const courses = await getCourses();
  const canCreateCourse = await userWithPermission(request, 'create:course')

  return { courses, canCreateCourse }
}

export default function Course() {
  const { courses, canCreateCourse } = useLoaderData<typeof loader>();
  
  return (
    <main className="space-y-8 container">
      {canCreateCourse &&
        <div>
          <CreateButton />
        </div>
      }
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {courses.map(course => 
            <Card key={course.id}>
              <CardHeader>
                <CardTitleLink to={`/courses/${course.id}`}>{course.title}</CardTitleLink>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      ) : (
        <p className="italic text-neutral-400">
          No courses yet
        </p>
      )}

    </main>
  )
}

function CreateButton() {
  return (
    <Button asChild>
      <Link to={"/courses/create"}>
        <Plus /> Add new
      </Link>
    </Button>
  )
}