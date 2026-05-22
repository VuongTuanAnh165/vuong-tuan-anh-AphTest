import "swiper/css";
import "swiper/css/pagination";
import { Breadcrumb, Button, Col, Image, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel, Pagination, Thumbs } from "swiper/modules";
import defaultImage from "../assets/images/defaultImage.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProductDetailData } from "../hooks/useProductDetailData";
import {
  DEFAULT_PRODUCT_VIEW,
  buildProductBreadcrumbLabels,
  normalizeSpecificationLines,
} from "../utils/productDetailMapper";

const DEFAULT_RELATED_PRODUCTS = [
  {
    id: "fallback-related-1",
    thumb: "/images/website/product-list_1.png",
    prodName: "Food Wrap",
    slug: "",
    sku: "036897488221-2",
  },
  {
    id: "fallback-related-2",
    thumb: "/images/website/product-list_2.png",
    prodName: "Overlock Jumbo bag",
    slug: "",
    sku: "036897488221-2",
  },
  {
    id: "fallback-related-3",
    thumb: "/images/website/product-list_3.png",
    prodName: "Food Wrap",
    slug: "",
    sku: "036897488221-2",
  },
  {
    id: "fallback-related-4",
    thumb: "/images/website/product-list_4.png",
    prodName: "Overlock Jumbo bag",
    slug: "",
    sku: "036897488221-2",
  },
  {
    id: "fallback-related-5",
    thumb: "/images/website/product-list_5.png",
    prodName: "Food Wrap",
    slug: "",
    sku: "036897488221-2",
  },
  {
    id: "fallback-related-6",
    thumb: "/images/website/product-list_6.png",
    prodName: "Overlock Jumbo bag",
    slug: "",
    sku: "036897488221-2",
  },
];

function renderRelatedProductSlide(item) {
  return (
    <SwiperSlide key={item.id}>
      <Link className="box_project block has-hover" to={item.slug ? `/product/${item.slug}` : ""}>
        <div className="media_prj image-zoom">
          <Image
            src={item.thumb}
            alt="Product Thumb"
            fallback={defaultImage}
            preview={false}
            className="_7omy"
          />
        </div>
        <div className="text_prj">
          <h4 className="textLine-2">{item.prodName}</h4>
          <div className="_7yax">
            <strong>SKU&nbsp;</strong>
            <span>{item.sku}</span>
          </div>
        </div>
      </Link>
    </SwiperSlide>
  );
}

function ProductDetail() {
  const { url } = useParams();
  const {
    productData,
    relatedProducts,
    mediaList,
    isLoading,
    errorType,
    errorMessage,
    retry,
  } = useProductDetailData(url);

  const swiperRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [direction, setDirection] = useState("vertical");
  const resolvedProduct = {
    ...DEFAULT_PRODUCT_VIEW,
    ...(productData || {}),
  };
  const breadcrumbLabels = buildProductBreadcrumbLabels(
    resolvedProduct.prodName,
    resolvedProduct.breadcrumbCategory
  );
  const specificationLines = normalizeSpecificationLines(
    resolvedProduct.specification
  );
  const displayRelatedProducts =
    relatedProducts.length > 0 ? relatedProducts : DEFAULT_RELATED_PRODUCTS;

  const updateDirection = () => {
    setDirection(window.innerWidth < 768 ? "horizontal" : "vertical");
  };

  useEffect(() => {
    updateDirection();
    window.addEventListener("resize", updateDirection);
    return () => {
      window.removeEventListener("resize", updateDirection);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    // Ly do thay doi: du lieu da duoc tach sang hook, effect nay chi giu viec scroll top khi doi product.
  }, [url]);

  if (errorType === "invalid-url") {
    return (
      <div id="content" className="content-area">
        <section className="coach-pug section">
          <div className="section-content relative">
            <div className="_0vqs">
              <Row gutter={30}>
                <Col span={24}>
                  <div className="_7vyg">
                    <h2 className="_9orw">Invalid Product URL</h2>
                    <p>{errorMessage}</p>
                    <Link to="/all-product" className="button button-gradient">
                      <span>Back to All Products</span>
                    </Link>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (errorType === "not-found") {
    return (
      <div id="content" className="content-area">
        <section className="coach-pug section">
          <div className="section-content relative">
            <div className="_0vqs">
              <Row gutter={30}>
                <Col span={24}>
                  <div className="_7vyg">
                    <h2 className="_9orw">Product Not Found</h2>
                    <p>{errorMessage}</p>
                    <Button type="primary" onClick={retry}>
                      Retry
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (errorType === "api-error") {
    return (
      <div id="content" className="content-area">
        <section className="coach-pug section">
          <div className="section-content relative">
            <div className="_0vqs">
              <Row gutter={30}>
                <Col span={24}>
                  <div className="_7vyg">
                    <h2 className="_9orw">Unable to load product</h2>
                    <p>{errorMessage}</p>
                    <Button type="primary" onClick={retry}>
                      Retry
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const showLoadingHint = isLoading && !productData;

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  return (
    <div id="content" className="content-area">
      <section className="coach-pug section">
        <div className="section-content relative">
          <div className="_0vqs">
            <Row gutter={30}>
              <Col span={24}>
                <Breadcrumb
                  items={[
                    {
                      title: (
                        <a href="/" className="item-bread">
                          Home
                        </a>
                      ),
                    },
                    {
                      title: (
                        <Link to="/all-product" className="item-bread">
                          All Products
                        </Link>
                      ),
                    },
                    {
                        title: breadcrumbLabels[2],
                    },
                    {
                        title: (
                          <span className="active-bread">
                            {breadcrumbLabels[3]}
                          </span>
                        ),
                    },
                  ]}
                  id="breadcrumb"
                />
              </Col>
            </Row>
          </div>
        </div>
      </section>
      <section className="snouting-daw section">
        <div className="section-content relative">
          <div className="_1ghu">
            <div className="_6tdv">
              <div className="product-vertical-thumbnails">
                  {/* Ly do thay doi: gallery lay tu media BE, neu khong co thi dung fallback static image hien co. */}
                <Swiper
                  modules={[Mousewheel, Pagination, Thumbs]}
                  direction={direction}
                  slidesPerView="auto"
                  spaceBetween={20}
                  mousewheel={true}
                  pagination={{
                    clickable: true,
                  }}
                  watchSlidesProgress={true}
                  onSwiper={setThumbsSwiper}
                  className="ThumbGallery GalleryArea"
                >
                    {mediaList.map((source, index) => (
                      <SwiperSlide key={`${source}-${index}`}>
                        <Image
                          src={source}
                          alt="Product Thumb"
                          fallback={defaultImage}
                          preview={false}
                        />
                      </SwiperSlide>
                    ))}
                </Swiper>
                <Image.PreviewGroup>
                  <Swiper
                    modules={[Thumbs]}
                    thumbs={{ swiper: thumbsSwiper }}
                    className="ProductGallery GalleryArea"
                  >
                      {mediaList.map((source, index) => (
                        <SwiperSlide key={`${source}-${index}`}>
                          <Image
                            src={source}
                            alt="Product Thumb"
                            fallback={defaultImage}
                            preview={false}
                          />
                        </SwiperSlide>
                      ))}
                  </Swiper>
                </Image.PreviewGroup>
              </div>

              <div className="_6hoq">
                <Button
                  style={{ textTransform: "none" }}
                  type="link"
                  className="_7lpb"
                    onClick={() => {
                      // Ly do thay doi: BE da tra dataSheet, co gia tri thi mo link, khong co thi giu UI nhu hien tai.
                      if (resolvedProduct.dataSheet) {
                        window.open(resolvedProduct.dataSheet, "_blank", "noopener,noreferrer");
                      }
                    }}
                >
                  <span>Download data sheet</span>
                  <i className="fa-regular fa-arrow-right"></i>
                </Button>
              </div>
            </div>
            <div className="_5enz">
              <div className="product-info">
                {showLoadingHint ? (
                  <div className="_7vyg">Loading product data...</div>
                ) : null}
                <h1 className="product-title product_title entry-title">
                  {resolvedProduct.prodName}
                </h1>
                <div className="sku">
                  <strong>SKU: </strong>
                  <span>{resolvedProduct.sku}</span>
                </div>
                <div className="description">
                  {resolvedProduct.shortDesc}
                </div>
                <div className="_6zrw">
                  <Link to="/contact-us" className="button button-gradient">
                    <span>Request Quote</span>
                  </Link>
                  <a href="#" className="button button-outline-green">
                    <span>Add to Basket</span>
                  </a>
                </div>
                <div className="contents widget-content">
                    <h4 className="_9cfu">
                      {productData?.specification ? "Specifications:" : "Performance Features:"}
                    </h4>
                  <div className="inner-content">
                      <ul>
                        {specificationLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="spinally-zee section">
        <div className="section-content relative">
          <div className="_7zow row">
            <div className="_4cnm col large-12 medium-12 small-12 RemovePaddingBottom">
              <div className="col-inner">
                <div className="_4zte">
                  <h2 className="_9orw">Specifications</h2>
                  <Button
                    style={{ textTransform: "none" }}
                    type="link"
                    className="_2oxj"
                  >
                    <span>Download data sheet</span>
                    <i className="fa-regular fa-arrow-right"></i>
                  </Button>
                </div>
              </div>
            </div>
            <div className="_5nyy col large-12 medium-12 small-12 RemovePaddingBottom">
              <div className="col-inner">
                <div className="wrapper-table"></div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="xylomas-goad section">
        <div className="section-content relative">
          <div className="_0qkm">
            <Row gutter={30}>
              <Col span={24}>
                <div className="blocks_title_nav">
                  <h2 className="title_prj">Frequently Bought Together</h2>
                  <div className="nav_swpier_prj">
                    <div className="swpier_prj-prev" onClick={handlePrev}>
                      <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
                    </div>
                    <div className="swpier_prj-next" onClick={handleNext}>
                      <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div className="_8sxd">
            <Row gutter={20}>
              <Col span={24} className="_0lfn">
                <Swiper
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  modules={[Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{ delay: 2500, disableOnInteraction: false }}
                  loop={true}
                  className="SliderProduct"
                  breakpoints={{
                    320: {
                      slidesPerView: 2,
                      spaceBetween: 12,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 12,
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 30,
                    },
                  }}
                >
                  {displayRelatedProducts.map((item) => renderRelatedProductSlide(item))}
                </Swiper>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;
