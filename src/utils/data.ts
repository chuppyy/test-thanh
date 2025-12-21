export const extractIdFromSlug = (slug: string): string => {
  return slug?.slice(slug?.lastIndexOf("-") + 1) || "";
};
