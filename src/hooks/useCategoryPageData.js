import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import {
  buildCategoryIds,
  mapFilterGroups,
  parseCategoryUrlFromPathname,
} from "../utils/categoryPageMapper";

const DEFAULT_LANG = "en";
const DEFAULT_PAGE = 1;
const PAGE_SIZE = 10;

function parseErrorMeta(error) {
  const status = Number(error?.status || error?.response?.status || 0);

  if (status === 404) {
    return {
      errorType: "not-found",
      errorMessage: "Category not found.",
    };
  }

  if (status === 422) {
    return {
      errorType: "invalid-url",
      errorMessage: "The category URL is invalid.",
    };
  }

  return {
    errorType: "api-error",
    errorMessage: "Unable to load category data. Please try again.",
  };
}

export function useCategoryPageData(lang = DEFAULT_LANG) {
  const location = useLocation();

  const [categoryUrl, setCategoryUrl] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorType, setErrorType] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");
  const categoryIdsRef = useRef([]);

  const categoryIds = useMemo(() => buildCategoryIds(categoryData), [categoryData]);

  const filterGroups = useMemo(
    () => mapFilterGroups(categoryData?.filterList),
    [categoryData]
  );

  const isLoading = loadingCategory || loadingProducts;

  useEffect(() => {
    categoryIdsRef.current = categoryIds;
  }, [categoryIds]);

  const resetProducts = useCallback(() => {
    setProducts([]);
    setTotalCount(0);
  }, []);

  const fetchProducts = useCallback(
    async (targetPage, idsInput) => {
      setLoadingProducts(true);
      const resolvedIds =
        Array.isArray(idsInput) && idsInput.length > 0
          ? idsInput
          : categoryIdsRef.current;

      try {
        const result = await productService.getProductByCategory(
          lang,
          targetPage,
          resolvedIds
        );

        setProducts(result.items);
        setTotalCount(result.totalCount);
        setPage(targetPage);
      } catch (error) {
        resetProducts();
        const parsedError = parseErrorMeta(error);
        setErrorType(parsedError.errorType);
        setErrorMessage(parsedError.errorMessage);
      } finally {
        setLoadingProducts(false);
      }
    },
    [lang, resetProducts]
  );

  const fetchCategoryAndProducts = useCallback(
    async (urlPath) => {
      setLoadingCategory(true);
      setErrorType("none");
      setErrorMessage("");

      try {
        const category = await categoryService.getCategoryByUrl(lang, urlPath);
        setCategoryData(category);
        setPage(DEFAULT_PAGE);

        const ids = buildCategoryIds(category);
        await fetchProducts(DEFAULT_PAGE, ids);
      } catch (error) {
        setCategoryData(null);
        resetProducts();

        const parsedError = parseErrorMeta(error);
        setErrorType(parsedError.errorType);
        setErrorMessage(parsedError.errorMessage);
      } finally {
        setLoadingCategory(false);
      }
    },
    [fetchProducts, lang, resetProducts]
  );

  const retry = useCallback(() => {
    if (!categoryUrl) {
      return;
    }

    fetchCategoryAndProducts(categoryUrl);
  }, [categoryUrl, fetchCategoryAndProducts]);

  useEffect(() => {
    const parsedUrl = parseCategoryUrlFromPathname(location.pathname);
    setCategoryUrl(parsedUrl);

    if (!parsedUrl) {
      setCategoryData(null);
      setErrorType("invalid-url");
      setErrorMessage("The category URL is invalid.");
      resetProducts();
      return;
    }

    fetchCategoryAndProducts(parsedUrl);
  }, [fetchCategoryAndProducts, location.pathname, resetProducts]);

  return {
    categoryData,
    categoryIds,
    filterGroups,
    products,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    isLoading,
    errorType,
    errorMessage,
    fetchProducts,
    retry,
  };
}
