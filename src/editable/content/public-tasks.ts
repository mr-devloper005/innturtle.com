import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'

const hiddenTaskKeys = new Set<TaskKey>(['classified', 'profile'])

export function isPublicTaskKey(task?: string | null): task is TaskKey {
  return Boolean(task) && !hiddenTaskKeys.has(task as TaskKey)
}

export function getPublicTasks() {
  return SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key))
}
