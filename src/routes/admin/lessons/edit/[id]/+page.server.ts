import { getLesson } from '$lib/server/supabase-courses';

export const load = async ({ params }) => {
    const lessonId = params.id;
    const lesson = await getLesson(lessonId);
    return { lesson };
};