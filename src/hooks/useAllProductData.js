import { useCallback, useEffect, useMemo, useState } from "react";
import { categoryService } from "../services/categoryService";
import {
  buildKeywordSuggestions,
  buildMarketSections,
  normalizeCategoryTree,
} from "../utils/categoryMapper";

// Ly do thay doi: thay cach useEffect + xu ly truc tiep trong UI bang custom hook
// de tach biet data flow va phan render, dung theo coding rule da thong nhat.

const FALLBACK_KEYWORDS = [
  "Food Packaging",
  "Consumer Goods",
  "Building Materials",
  "Engineering Plastics",
  "Packaging",
  "Sustainable Products",
];

function mapErrorMessage(error, lang) {
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return lang === "vi"
    ? "Khong the tai danh muc san pham. Vui long thu lai."
    : "Unable to load product categories. Please try again.";
}

export function useAllProductData(lang = "en") {
  const [marketSections, setMarketSections] = useState([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState(FALLBACK_KEYWORDS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const rawCategories = await categoryService.getListCategory(lang);
      const normalizedTree = normalizeCategoryTree(rawCategories);
      const mappedSections = buildMarketSections(normalizedTree, lang);
      const mappedKeywords = buildKeywordSuggestions(
        normalizedTree,
        FALLBACK_KEYWORDS
      );

      setMarketSections(mappedSections);
      setKeywordSuggestions(mappedKeywords);
    } catch (error) {
      setMarketSections([]);
      setKeywordSuggestions(FALLBACK_KEYWORDS);
      setErrorMessage(mapErrorMessage(error, lang));
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(
    () => ({
      marketSections,
      keywordSuggestions,
      isLoading,
      errorMessage,
      retry: fetchData,
    }),
    [marketSections, keywordSuggestions, isLoading, errorMessage, fetchData]
  );
}
