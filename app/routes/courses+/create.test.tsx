import { vi } from 'vitest';
import { action } from './create'; // Assuming the action is exported from create.tsx
import { createCourse } from '#app/models/course.server.ts';
import { requireUserWithPermission } from '#app/utils/permissions.server.ts';
import { redirectWithToast } from '#app/utils/toast.server.ts';

vi.mock('#app/models/course.server.ts');
vi.mock('#app/utils/permissions.server.ts');
vi.mock('#app/utils/toast.server.ts');

describe('Create Course Action', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a course and redirect with a toast message', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Course');
    formData.append('content', 'Test Content');

    const request = new Request('http://localhost/courses/create', {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);
    (createCourse as vi.Mock).mockResolvedValue({ id: 'new-course-id' });
    (redirectWithToast as vi.Mock).mockImplementation((url, toast) => {
      return new Response(null, {
        status: 302,
        headers: { Location: url },
      });
    });

    const response = await action({ request, params: {}, context: {} });

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:course');
    expect(createCourse).toHaveBeenCalledWith({
      title: 'Test Course',
      content: 'Test Content',
    });
    expect(redirectWithToast).toHaveBeenCalledWith(
      '/courses/new-course-id',
      { title: 'Course', description: 'The course has been successfully created!' }
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/courses/new-course-id');
  });

  it('should return errors if validation fails', async () => {
    const formData = new FormData();
    // Missing title and content to trigger validation error
    formData.append('title', '');
    formData.append('content', '');


    const request = new Request('http://localhost/courses/create', {
      method: 'POST',
      body: formData,
    });

    (requireUserWithPermission as vi.Mock).mockResolvedValue(null);

    const response = await action({ request, params: {}, context: {} });
    const responseData = await response.json();

    expect(requireUserWithPermission).toHaveBeenCalledWith(request, 'create:course');
    expect(createCourse).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(responseData.result.initialValue).toEqual({ title: '', content: '' });
    expect(responseData.result.error.title).toBeDefined();
    expect(responseData.result.error.content).toBeDefined();
  });
});
