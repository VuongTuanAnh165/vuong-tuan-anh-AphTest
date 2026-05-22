export function parseCategoryUrlFromPathname(pathnameInput) {
  const pathname = `${pathnameInput || ""}`.trim();

  if (!pathname.startsWith("/category")) {
    return "";
  }

  const suffix = pathname.slice("/category".length).trim();

  if (!suffix || suffix === "/") {
    return "";
  }

  return `/category/${suffix.replace(/^\/+|\/+$/g, "")}`;
}

export function buildCategoryIds(categoryData) {
  const currentId = Number(categoryData?.id);
  const childIds = Array.isArray(categoryData?.children)
    ? categoryData.children.map((item) => Number(item?.id)).filter((id) => id > 0)
    : [];

  return [...new Set([currentId, ...childIds].filter((id) => id > 0))];
}

export function mapFilterGroups(filterList) {
  if (!Array.isArray(filterList)) {
    return [];
  }

  return filterList
    .filter((group) => group?.filterKey && group?.filterName)
    .map((group) => ({
      filterKey: group.filterKey,
      filterName: group.filterName,
      options: Array.isArray(group.options)
        ? [...new Set(group.options.map((option) => `${option}`.trim()).filter(Boolean))]
        : [],
    }));
}
