export const Status = {
  STATUS_WAITING_FOR_DELEGATION: 0,
  STATUS_PENDING: 1,
  STATUS_DONE: 2,
  STATUS_ERROR: 3,
} as const;

export type Status = (typeof Status)[keyof typeof Status];
