import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { productService } from "../services/productService";
import {
  hasAnyTruthyValue,
  mapCategoriesToOptions,
  mapFiltersToGroups,
  normalizeCategoryIds,
  normalizeSearchKeyword,
  parseFilterApiResponse,
  parseSearchApiError,
  parseSearchApiResponse,
} from "../utils/searchMapper";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;

function buildFilterPayload(values) {
  if (!values || typeof values !== "object") {
    return undefined;
  }

  const payload = {};

  Object.entries(values).forEach(([key, value]) => {
    if (key === "categories" || key === "textSearch") {
      return;
    }

    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    payload[key] = [...new Set(value.map((item) => `${item}`.trim()).filter(Boolean))];
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function normalizeFormFilters(values) {
  if (!values || typeof values !== "object") {
    return {};
  }

  const normalized = {};

  Object.entries(values).forEach(([key, value]) => {
    if (key === "categories" || key === "textSearch") {
      return;
    }

    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
}

export function useSearchData({ lang, keywordInput }) {
  const keyword = useMemo(() => normalizeSearchKeyword(keywordInput), [keywordInput]);
  const requestIdRef = useRef(0);

  const [categories, setCategories] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEmptyKeyword = keyword.length === 0;

  const resetResultState = useCallback(() => {
    setProducts([]);
    setTotalCount(0);
    setSelectedCategoryIds([]);
    setActiveFilters({});
    setPage(DEFAULT_PAGE);
  }, []);

  const applyFilterRequest = useCallback(
    async ({
      pageInput = DEFAULT_PAGE,
      categoriesInput,
      filtersInput,
      showSubmitting = false,
      requestId,
    }) => {
      if (showSubmitting) {
        setIsSubmitting(true);
      }

      try {
        const payload = await productService.filterSearchProduct({
          lang,
          textSearch: keyword,
          categories: normalizeCategoryIds(categoriesInput),
          page: pageInput,
          maxResultCount: DEFAULT_PAGE_SIZE,
          filters: filtersInput,
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        const parsed = parseFilterApiResponse(payload);
        setProducts(parsed.items);
        setTotalCount(parsed.totalCount);
        setPage(pageInput);
        setErrorType("");
        setErrorMessage("");
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        const parsedError = parseSearchApiError(error);
        setProducts([]);
        setTotalCount(0);
        setErrorType(parsedError.errorType);
        setErrorMessage(parsedError.message);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
          if (showSubmitting) {
            setIsSubmitting(false);
          }
        }
      }
    },
    [keyword, lang]
  );

  const loadSearchData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorType("");
    setErrorMessage("");

    if (isEmptyKeyword) {
      setCategories([]);
      setFilterGroups([]);
      resetResultState();
      setIsLoading(false);
      return;
    }

    try {
      const searchPayload = await productService.searchProducts({
        lang,
        query: keyword,
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      const parsed = parseSearchApiResponse(searchPayload);
      const mappedCategories = mapCategoriesToOptions(parsed.categories);
      const mappedFilters = mapFiltersToGroups(parsed.filters);

      setCategories(mappedCategories);
      setFilterGroups(mappedFilters);

      await applyFilterRequest({
        categoriesInput: [],
        filtersInput: undefined,
        pageInput: DEFAULT_PAGE,
        requestId,
      });
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      const parsedError = parseSearchApiError(error);
      setCategories([]);
      setFilterGroups([]);
      resetResultState();
      setErrorType(parsedError.errorType);
      setErrorMessage(parsedError.message);
      setIsLoading(false);
    }
  }, [applyFilterRequest, isEmptyKeyword, keyword, lang, resetResultState]);

  useEffect(() => {
    loadSearchData();
  }, [loadSearchData]);

  const submitFilters = useCallback(
    async ({ categoriesInput, filtersInput, nextPage = DEFAULT_PAGE }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      const normalizedCategoryIds = normalizeCategoryIds(categoriesInput);
      const normalizedFilters = buildFilterPayload(filtersInput);
      const normalizedFormFilters = normalizeFormFilters(filtersInput);

      setSelectedCategoryIds(normalizedCategoryIds);
      setActiveFilters(normalizedFormFilters);

      await applyFilterRequest({
        categoriesInput: normalizedCategoryIds,
        filtersInput: normalizedFilters,
        pageInput: nextPage,
        showSubmitting: true,
        requestId,
      });
    },
    [applyFilterRequest]
  );

  const clearFilters = useCallback(async () => {
    await submitFilters({
      categoriesInput: [],
      filtersInput: {},
      nextPage: DEFAULT_PAGE,
    });
  }, [submitFilters]);

  const goToPage = useCallback(
    async (nextPage) => {
      await submitFilters({
        categoriesInput: selectedCategoryIds,
        filtersInput: activeFilters,
        nextPage,
      });
    },
    [activeFilters, selectedCategoryIds, submitFilters]
  );

  const hasActiveFilters = useMemo(() => {
    return selectedCategoryIds.length > 0 || hasAnyTruthyValue(activeFilters);
  }, [activeFilters, selectedCategoryIds]);

  return {
    keyword,
    categories,
    filterGroups,
    products,
    totalCount,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    isLoading,
    isSubmitting,
    errorType,
    errorMessage,
    isEmptyKeyword,
    selectedCategoryIds,
    activeFilters,
    hasActiveFilters,
    submitFilters,
    clearFilters,
    goToPage,
    retry: loadSearchData,
  };
}
