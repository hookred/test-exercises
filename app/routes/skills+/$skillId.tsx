import { invariantResponse } from "@epic-web/invariant";
import { Plus } from "lucide-react";
import { type LoaderFunctionArgs, Outlet, useLoaderData, useNavigate, useOutlet } from "react-router";
import { LinkButton } from "#app/components/custom-buttons.tsx";
import { ListExercises } from "#app/components/sections/exercise/list-exercises.tsx";
import { SkillProgressIndicator } from "#app/components/sections/skills/progress-indicator.tsx";
import { Hero1 } from "#app/components/ui/hero1.tsx";
import { Sheet, SheetContent } from "#app/components/ui/sheet.tsx";
import { findSkill } from "#app/models/skill.server.ts";
import { userWithPermission } from "#app/utils/permissions.server.ts";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariantResponse(params.skillId, 'Not found', { status: 404 });

  const skillId = parseInt(params.skillId);
  const skill = await findSkill(skillId);

  invariantResponse(skill, 'Not found', { status: 404 });

  return {
    skill,
    canCreateExercise: !!(await userWithPermission(request, 'create:exercise'))
  }
}

export default function SkillRoute() {
  const inOutlet = !!useOutlet();
  const navigate = useNavigate();
  
  const { skill, canCreateExercise } = useLoaderData<typeof loader>();
  const exercises = skill.exercises.map(ex => ex.exercise);

  function onOpenChange(open: boolean) {
    if (!open) {
      void navigate(`/skills/${skill.id}`);
    }
  }

  return (
    <div>
      <main className="container">
        <Hero1
          heading={skill.title}
          description={skill.description || ''}
          buttons={{
            primary: {
              text: "Enhance my skill",
              url: `/skills/${skill.id}/enhance`
            }
          }}
          rightComponent={<SkillProgressIndicator progress={undefined} />}
        />

        { canCreateExercise &&
          <div>
            <LinkButton to={`/skills/${skill.id}/create-exercise`}>
              <Plus /> Add an exercise
            </LinkButton>
          </div>
        }

        <ListExercises exercises={exercises} canEditExercise={canCreateExercise} />

      </main>

      <Sheet open={inOutlet} onOpenChange={onOpenChange}>
        <SheetContent>
          <Outlet />
        </SheetContent>
      </Sheet>
    </div>
  )
}