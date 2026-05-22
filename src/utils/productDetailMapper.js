export const DEFAULT_PRODUCT_GALLERY_SOURCES = [
  "/images/website/product_1.png",
  "/images/website/product_2.png",
  "/images/website/product_3.png",
];

export const DEFAULT_PRODUCT_VIEW = {
  breadcrumbCategory: "Packaging",
  prodName: "Food Wrap",
  sku: "036897488221-2",
  shortDesc:
    "100% compostable: made from PBAT compostable material, AnEco food wrap is capable of completely decomposing within 6-12 months into humus, water, Co2.",
  description:
    "100% compostable: made from PBAT compostable material, AnEco food wrap is capable of completely decomposing within 6-12 months into humus, water, Co2.",
  dataSheet: "",
  specification:
    "With outstanding features to other products on the market, AnEco compostable cling wrap is transparent, flexible with a sharp cutting bar, easy for consumers in food preservation.; Convenient thumb opening allows for a safe, easy grasp on the film; FDA Compliant; CFIA Compliant; Kosher Compliant",
};

export function normalizeProductSlug(urlInput) {
  const rawValue = `${urlInput || ""}`.trim();

  if (!rawValue) {
    return "";
  }

  try {
    const parsed = new URL(rawValue, "http://localhost");
    const pathname = parsed.pathname.replace(/^\/+|\/+$/g, "");

    if (!pathname) {
      return "";
    }

    const segments = pathname.split("/");
    return segments[segments.length - 1] || "";
  } catch {
    const pathname = rawValue.replace(/^\/+|\/+$/g, "");
    const segments = pathname.split("/");
    return segments[segments.length - 1] || "";
  }
}

export function parseProductApiError(error) {
  const status = Number(error?.status || error?.response?.status || 0);

  if (status === 404) {
    return {
      errorType: "not-found",
      message: "Product not found.",
    };
  }

  if (status === 422) {
    return {
      errorType: "invalid-url",
      message: "Invalid product URL.",
    };
  }

  return {
    errorType: "api-error",
    message: "Unable to load product data.",
  };
}

export function normalizeProductGallerySources(mediaList, thumbFallback) {
  const normalizedMedia = Array.isArray(mediaList)
    ? mediaList.map((item) => `${item || ""}`.trim()).filter(Boolean)
    : [];

  if (normalizedMedia.length > 0) {
    return [...new Set(normalizedMedia)];
  }

  const thumbValue = `${thumbFallback || ""}`.trim();
  if (thumbValue) {
    return [thumbValue];
  }

  return DEFAULT_PRODUCT_GALLERY_SOURCES;
}

export function normalizeSpecificationLines(specificationInput) {
  const rawValue = `${specificationInput || ""}`.trim();

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(/[\r\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildProductBreadcrumbLabels(productName, categoryName) {
  return [
    "Home",
    "All Products",
    categoryName || DEFAULT_PRODUCT_VIEW.breadcrumbCategory,
    productName || DEFAULT_PRODUCT_VIEW.prodName,
  ];
}
