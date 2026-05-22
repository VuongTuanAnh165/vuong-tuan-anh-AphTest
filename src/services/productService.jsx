import axiosClient from "./interceptor";
import { normalizeProductSlug } from "../utils/productDetailMapper";

const DEFAULT_LANG = "en";

function normalizeLang(lang) {
  if (lang === "en" || lang === "vi") {
    return lang;
  }

  return DEFAULT_LANG;
}

function normalizeCategoryIds(rawIds) {
  if (!Array.isArray(rawIds)) {
    return [];
  }

  return [...new Set(rawIds.map((id) => Number(id)).filter((id) => id > 0))];
}

export const productService = {
  async getProductByCategory(langInput, pageInput, idsInput) {
    const lang = normalizeLang(langInput);
    const page = Math.max(1, Number(pageInput) || 1);
    const ids = normalizeCategoryIds(idsInput);

    const response = await axiosClient.get("/Product/GetProductByCategory", {
      params: { lang, page, ids },
    });

    return {
      items: Array.isArray(response?.items) ? response.items : [],
      totalCount: Number(response?.totalCount) || 0,
    };
  },

  async getProductByUrl(langInput, urlInput) {
    const lang = normalizeLang(langInput);
    const url = normalizeProductSlug(urlInput);

    return axiosClient.get("/Product/GetProductByUrl", {
      params: { lang, url },
    });
  },

  async getRelatedProducts(langInput, productIdInput) {
    const lang = normalizeLang(langInput);
    const id = Number(productIdInput) || 0;

    if (id <= 0) {
      return [];
    }

    const response = await axiosClient.get("/Product/GetRelatedProducts", {
      params: { lang, id },
    });

    return Array.isArray(response) ? response : [];
  },

  async searchProducts({ lang, query }) {
    const normalizedLang = normalizeLang(lang);
    const response = await axiosClient.get("/Product/SearchProducts", {
      params: {
        lang: normalizedLang,
        query: `${query || ""}`.trim(),
      },
    });

    return response;
  },

  async filterSearchProduct({
    lang,
    textSearch,
    categories,
    page = 1,
    maxResultCount = 8,
    filters,
  }) {
    const normalizedLang = normalizeLang(lang);
    const response = await axiosClient.post("/Product/FilterSearchProduct", {
      lang: normalizedLang,
      textSearch: `${textSearch || ""}`.trim(),
      categories,
      page,
      maxResultCount,
      ...(filters ? { filters } : {}),
    });

    return response;
  },
};
