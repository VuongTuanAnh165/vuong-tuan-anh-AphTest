const DEFAULT_DESC = {
  en: "Product information is being updated.",
  vi: "Thong tin san pham dang duoc cap nhat.",
};

// Ly do thay doi: gom logic normalize/map category vao utility de tranh duplicate
// transform data o nhieu component/page.

function toSafeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstNonEmpty(...values) {
  return values.find((value) => Boolean(toSafeString(value))) || "";
}

export function normalizeCategoryTree(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .map((item) => {
      const id = toSafeNumber(item?.id);
      const categoryName = toSafeString(item?.categoryName);

      return {
        id,
        parentId: toSafeNumber(item?.parentId),
        categoryName,
        thumb: toSafeString(item?.thumb),
        link: toSafeString(item?.link),
        shortDesc: toSafeString(item?.shortDesc),
        description: toSafeString(item?.description),
        children: normalizeCategoryTree(item?.children),
      };
    })
    .filter((item) => item.id > 0 && item.categoryName);
}

export function buildMarketSections(categoryTree, lang = "en") {
  const defaultDescription = DEFAULT_DESC[lang] || DEFAULT_DESC.en;

  const markets = categoryTree.filter((category) => category.parentId === 0);

  return markets.map((market) => ({
    id: market.id,
    title: market.categoryName,
    image: market.thumb,
    link: market.link,
    items: (market.children || []).map((child) => ({
      id: child.id,
      title: child.categoryName,
      image: child.thumb,
      description: firstNonEmpty(
        child.shortDesc,
        child.description,
        defaultDescription
      ),
      link: child.link,
    })),
  }));
}

export function buildKeywordSuggestions(categoryTree, fallbackKeywords) {
  const keywords = [];
  const seen = new Set();

  categoryTree.forEach((market) => {
    [market, ...(market.children || [])].forEach((item) => {
      const name = toSafeString(item?.categoryName);
      if (!name || seen.has(name.toLowerCase())) {
        return;
      }

      seen.add(name.toLowerCase());
      keywords.push(name);
    });
  });

  if (keywords.length > 0) {
    return keywords.slice(0, 6);
  }

  return fallbackKeywords;
}
