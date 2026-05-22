import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { productService } from "../services/productService";
import {
  normalizeProductGallerySources,
  normalizeProductSlug,
  parseProductApiError,
} from "../utils/productDetailMapper";

const DEFAULT_LANG = "en";

export function useProductDetailData(urlInput) {
  const requestIdRef = useRef(0);
  const [currentSlug, setCurrentSlug] = useState("");
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [errorType, setErrorType] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");

  const mediaList = useMemo(
    () => normalizeProductGallerySources(productData?.media, productData?.thumb),
    [productData]
  );

  const isLoading = loadingProduct || loadingRelated;

  const fetchRelatedProducts = useCallback(async (productId, requestId) => {
    setLoadingRelated(true);

    try {
      const items = await productService.getRelatedProducts(DEFAULT_LANG, productId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setRelatedProducts(items);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setRelatedProducts([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingRelated(false);
      }
    }
  }, []);

  const fetchProductDetail = useCallback(
    async (slug) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setLoadingProduct(true);
      setLoadingRelated(false);
      setErrorType("none");
      setErrorMessage("");
      setProductData(null);
      setRelatedProducts([]);

      try {
        const detail = await productService.getProductByUrl(DEFAULT_LANG, slug);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setProductData(detail);

        if (detail?.id) {
          await fetchRelatedProducts(detail.id, requestId);
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setProductData(null);
        setRelatedProducts([]);

        const parsedError = parseProductApiError(error);
        setErrorType(parsedError.errorType);
        setErrorMessage(parsedError.message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingProduct(false);
        }
      }
    },
    [fetchRelatedProducts]
  );

  const retry = useCallback(() => {
    if (!currentSlug) {
      return;
    }

    fetchProductDetail(currentSlug);
  }, [currentSlug, fetchProductDetail]);

  useEffect(() => {
    const slug = normalizeProductSlug(urlInput);
    setCurrentSlug(slug);

    if (!slug) {
      requestIdRef.current += 1;
      setProductData(null);
      setRelatedProducts([]);
      setLoadingProduct(false);
      setLoadingRelated(false);
      setErrorType("invalid-url");
      setErrorMessage("Invalid product URL.");
      return;
    }

    fetchProductDetail(slug);
  }, [fetchProductDetail, urlInput]);

  return {
    currentSlug,
    productData,
    relatedProducts,
    mediaList,
    isLoading,
    errorType,
    errorMessage,
    retry,
  };
}
