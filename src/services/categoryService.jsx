import axiosClient from "./interceptor";

const DEFAULT_LANG = "en";

// Ly do thay doi: truoc day goi API truc tiep trong page lam code kho bao tri.
// Tach service rieng de tai su dung va de test.

function normalizeLang(lang) {
  if (lang === "en" || lang === "vi") {
    return lang;
  }

  return DEFAULT_LANG;
}

function parseCategoryResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

function normalizeCategoryUrl(urlInput) {
  const rawValue = `${urlInput || ""}`.trim();

  if (!rawValue) {
    return "";
  }

  try {
    const parsed = new URL(rawValue, "http://localhost");
    return `/${parsed.pathname.replace(/^\/+|\/+$/g, "")}`;
  } catch {
    return `/${rawValue.replace(/^\/+|\/+$/g, "")}`;
  }
}

export const categoryService = {
  async getListCategory(langInput) {
    const lang = normalizeLang(langInput);
    const response = await axiosClient.get("/Category/GetListCategory", {
      params: { lang },
    });

    return parseCategoryResponse(response);
  },

  async getCategoryByUrl(langInput, urlInput) {
    const lang = normalizeLang(langInput);
    const url = normalizeCategoryUrl(urlInput);

    return axiosClient.get("/Category/GetCategoryByUrl", {
      params: { lang, url },
    });
  },
};
