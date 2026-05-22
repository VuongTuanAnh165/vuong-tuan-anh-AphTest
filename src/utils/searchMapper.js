export function normalizeSearchKeyword(keywordInput) {
  return `${keywordInput || ""}`.trim();
}

export function parseSearchQueryFromLocation(searchString) {
  const params = new URLSearchParams(`${searchString || ""}`);

  return normalizeSearchKeyword(params.get("query"));
}

export function normalizeCategoryIds(rawIds) {
  if (!Array.isArray(rawIds)) {
    return [];
  }

  return [...new Set(rawIds.map((id) => Number(id)).filter((id) => id > 0))];
}

export function parseSearchApiResponse(payload) {
  return {
    products: Array.isArray(payload?.products) ? payload.products : [],
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
    filters: Array.isArray(payload?.filters) ? payload.filters : [],
  };
}

export function parseFilterApiResponse(payload) {
  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    totalCount: Number(payload?.totalCount) || 0,
  };
}

export function mapCategoriesToOptions(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .filter((category) => category?.id && category?.categoryName)
    .map((category) => ({
      value: category.id,
      label: category.categoryName,
    }));
}

export function mapFiltersToGroups(filters) {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters
    .filter((group) => group?.filterKey && group?.filterName)
    .map((group) => ({
      filterKey: group.filterKey,
      filterName: group.filterName,
      options: Array.isArray(group.options)
        ? [...new Set(group.options.map((option) => `${option}`.trim()).filter(Boolean))]
        : [],
    }));
}

export function hasAnyTruthyValue(values) {
  if (!values || typeof values !== "object") {
    return false;
  }

  return Object.values(values).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(value);
  });
}

export function parseSearchApiError(error) {
  const status = Number(error?.status || error?.response?.status || 0);

  if (status === 422) {
    return {
      errorType: "invalid-query",
      message: "Invalid search keyword.",
    };
  }

  if (status === 404) {
    return {
      errorType: "empty",
      message: "No products found.",
    };
  }

  return {
    errorType: "api-error",
    message: "Unable to load search data.",
  };
}