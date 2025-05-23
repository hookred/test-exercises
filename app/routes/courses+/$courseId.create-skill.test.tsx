import { vi } from 'vitest';
import { action } from './$courseId.create-skill'; // Assuming the action is exported from $courseId.create-skill.tsx
import { createSkill } from '#app/models/skill.server.ts';
import { requireUserWithPermission } from '#app/utils/permissions.server.ts';
import { redirectWithToast } from '#app/utils/toast.server.ts';
import { prisma } from '#app/utils/db.server.ts';

vi.mock('#app/models/skill.server.ts');
vi.mock('#app/utils/permissions.server.ts');
vi.mock('#app/utils/toast.server.ts');
vi.mock('#app/utils/db.server.ts', () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Create Skill Action', () => {
  const courseId = 'existing-course-id';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a skill and redirect with a toast message', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Skill');
    formData.append('description', 'Test Skill Description');

    const request = new Request(`http://localhost/courses/${courseId}/create-skill`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as vi.Mock).mockResolvedValue({ id: courseId, title: 'Existing Course' });
    (createSkill as vi.Mock).mockResolvedValue({ id: 'new-skill-id' });
    (redirectWithToast as vi.Mock).mockImplementation((url, toast) => {
      return new Response(null, {
        status: 302,
        headers: { Location: url },
      });
    });

    const response = await action({ request, params: { courseId }, context: {} });

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:skill');
    expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: courseId } });
    expect(createSkill).toHaveBeenCalledWith({
      title: 'Test Skill',
      description: 'Test Skill Description',
      courseId: courseId,
    });
    expect(redirectWithToast).toHaveBeenCalledWith(
      `/skills/new-skill-id`,
      { title: 'Skill', description: 'The skill has been successfully created!' }
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(`/skills/new-skill-id`);
  });

  it('should return 404 if course not found', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Skill');
    formData.append('description', 'Test Skill Description');

    const request = new Request(`http://localhost/courses/${courseId}/create-skill`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as vi.Mock).mockResolvedValue(null); // Simulate course not found

    await expect(action({ request, params: { courseId }, context: {} })).rejects.toThrow('Course not found');

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:skill');
    expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: courseId } });
    expect(createSkill).not.toHaveBeenCalled();
  });


  it('should return errors if validation fails', async () => {
    const formData = new FormData();
    // Missing title to trigger validation error
    formData.append('title', '');
    formData.append('description', 'Test Skill Description');


    const request = new Request(`http://localhost/courses/${courseId}/create-skill`, {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as vi.Mock).mockResolvedValue({ id: courseId, title: 'Existing Course' });


    const response = await action({ request, params: { courseId }, context: {} });
    const responseData = await response.json();

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:skill');
    expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: courseId } });
    expect(createSkill).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData.result.initialValue).toEqual({ title: '', description: 'Test Skill Description' });
    expect(responseData.result.error.title).toBeDefined();
  });
});
