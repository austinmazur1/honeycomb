export const queryKeys = {
  profile: (userId?: string) => ["profile", userId] as const,
  saves: (userId?: string) => ["saves", userId] as const,
  save: (id?: string) => ["save", id] as const,
  categories: (userId?: string) => ["categories", userId] as const,
};
