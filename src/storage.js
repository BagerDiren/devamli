import AsyncStorage from '@react-native-async-storage/async-storage';

const COURSES_KEY = '@devamli/courses/v1';

export async function loadCourses() {
  try {
    const raw = await AsyncStorage.getItem(COURSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('loadCourses failed:', err);
    return [];
  }
}

export async function saveCourses(courses) {
  try {
    await AsyncStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (err) {
    console.warn('saveCourses failed:', err);
  }
}

export function makeCourse({ name, code, weeklyHours, totalWeeks, absenceLimitPercent, color }) {
  return {
    id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    code: (code || '').trim(),
    weeklyHours: Number(weeklyHours) || 3,
    totalWeeks: Number(totalWeeks) || 14,
    absenceLimitPercent: Number(absenceLimitPercent) || 30,
    color: color || '#2563EB',
    createdAt: new Date().toISOString(),
    sessions: [],
  };
}

export function makeSession({ date, status, note }) {
  return {
    id: 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date,
    status,
    note: (note || '').trim(),
  };
}

export function upsertCourse(courses, updated) {
  const idx = courses.findIndex((c) => c.id === updated.id);
  if (idx === -1) return [updated, ...courses];
  const next = courses.slice();
  next[idx] = updated;
  return next;
}

export function removeCourse(courses, id) {
  return courses.filter((c) => c.id !== id);
}

export function addSession(course, session) {
  return { ...course, sessions: [session, ...(course.sessions || [])] };
}

export function removeSession(course, sessionId) {
  return { ...course, sessions: (course.sessions || []).filter((s) => s.id !== sessionId) };
}
