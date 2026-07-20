/**
 * Task types. Placeholder foundation — interfaces only.
 * Aligned with docs/DATABASE.md (tasks, subtasks).
 */

import type { BaseEntity, ID, ISODateString } from "@/types/common";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "blocked"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task extends BaseEntity {
  projectId: ID;
  parentTaskId: ID | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: ID | null;
  estimateHours: number | null;
  dueDate: ISODateString | null;
  completedAt: ISODateString | null;
  clientVisible: boolean;
}
