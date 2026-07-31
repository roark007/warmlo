/** Ordered list powering home page popular cost guides and header nav link. */
export const featuredRepairs = [
  "ignitor-replacement",
  "limit-switch-replacement",
  "blower-motor-replacement",
  "control-board-replacement",
] as const;

export type FeaturedRepairSlug = (typeof featuredRepairs)[number];
