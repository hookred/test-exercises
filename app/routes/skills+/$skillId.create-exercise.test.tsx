import { vi } from 'vitest';
import { action } from './$skillId.create-exercise'; // Assuming the action is exported from $skillId.create-exercise.tsx
import { createExercise } from '#app/models/exercise.server.ts';
import { findSkill } from '#app/models/skill.server.ts';
import { requireUserWithPermission } from '#app/utils/permissions.server.ts';
import { redirectWithToast } from '#app/utils/toast.server.ts';
import { prisma } from '#app/utils/db.server.ts';

vi.mock('#app/models/exercise.server.ts');
vi.mock('#app/models/skill.server.ts');
vi.mock('#app/utils/permissions.server.ts');
vi.mock('#app/utils/toast.server.ts');
vi.mock('#app/utils/db.server.ts', () => ({
  prisma: {
    skill: { // Mock prisma.skill.findUnique specifically if it's used directly, otherwise mock findSkill
      findUnique: vi.fn(),
    },
  },
}));

describe('Create Exercise Action', () => {
  const skillId = 'existing-skill-id';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an exercise and redirect with a toast message', async () => {
    const formData = new FormData();
    formData.append('content', 'Test Exercise Content');
    formData.append('result', 'Test Exercise Result');

    const request = new Request(`http://localhost/skills/${skillId}/create-exercise`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    // Mock findSkill if it's the primary way to fetch a skill, or prisma.skill.findUnique if used directly
    (findSkill as vi.Mock).mockResolvedValue({ id: skillId, title: 'Existing Skill' });
    // If $skillId.create-exercise.tsx uses prisma.skill.findUnique directly, mock that instead/additionally.
    // (prisma.skill.findUnique as vi.Mock).mockResolvedValue({ id: skillId, title: 'Existing Skill' });


    (createExercise as vi.Mock).mockResolvedValue({ id: 'new-exercise-id' });
    (redirectWithToast as vi.Mock).mockImplementation((url, toast) => {
      return new Response(null, {
        status: 302,
        headers: { Location: url },
      });
    });

    const response = await action({ request, params: { skillId }, context: {} });

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:exercise');
    expect(findSkill).toHaveBeenCalledWith(skillId);
    // Or if prisma.skill.findUnique is used directly in the action:
    // expect(prisma.skill.findUnique).toHaveBeenCalledWith({ where: { id: skillId } });
    expect(createExercise).toHaveBeenCalledWith({
      content: 'Test Exercise Content',
      result: 'Test Exercise Result',
      skillId: skillId,
    });
    expect(redirectWithToast).toHaveBeenCalledWith(
      `/skills/${skillId}`, // Assuming redirect back to the skill page
      { title: 'Exercise', description: 'The exercise has been successfully created!' }
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(`/skills/${skillId}`);
  });

  it('should return 404 if skill not found', async () => {
    const formData = new FormData();
    formData.append('content', 'Test Exercise Content');
    formData.append('result', 'Test Exercise Result');

    const request = new Request(`http://localhost/skills/${skillId}/create-exercise`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (findSkill as vi.Mock).mockResolvedValue(null); // Simulate skill not found
    // (prisma.skill.findUnique as vi.Mock).mockResolvedValue(null);


    await expect(action({ request, params: { skillId }, context: {} })).rejects.toThrow('Skill not found');

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:exercise');
    expect(findSkill).toHaveBeenCalledWith(skillId);
    // Or expect(prisma.skill.findUnique).toHaveBeenCalledWith({ where: { id: skillId } });
    expect(createExercise).not.toHaveBeenCalled();
  });

  it('should return errors if validation fails', async () => {
    const formData = new FormData();
    // Missing content to trigger validation error
    formData.append('content', '');
    formData.append('result', 'Test Exercise Result');


    const request = new Request(`http://localhost/skills/${skillId}/create-exercise`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (findSkill as vi.Mock).mockResolvedValue({ id: skillId, title: 'Existing Skill' });
    // (prisma.skill.findUnique as vi.Mock).mockResolvedValue({ id: skillId, title: 'Existing Skill' });


    const response = await action({ request, params: { skillId }, context: {} });
    const responseData = await response.json();

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:exercise');
    expect(findSkill).toHaveBeenCalledWith(skillId);
    // Or expect(prisma.skill.findUnique).toHaveBeenCalledWith({ where: { id: skillId } });
    expect(createExercise).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData.result.initialValue).toEqual({ content: '', result: 'Test Exercise Result' });
    expect(responseData.result.error.content).toBeDefined();
  });
});
