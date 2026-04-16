export const ISSUE_TYPES = ['timeline', 'character', 'lore', 'plot_thread'] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];
