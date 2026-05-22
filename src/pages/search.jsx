import {
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Pagination,
  Row,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { useSearchData } from "../hooks/useSearchData";
import { parseSearchQueryFromLocation } from "../utils/searchMapper";

function SearchScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const textSearch = parseSearchQueryFromLocation(location.search);

  // Ly do thay doi: bo sung data binding tu API nhung giu toi da cau truc UI cu.
  const {
    keyword,
    categories,
    filterGroups,
    products,
    totalCount,
    page,
    pageSize,
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
    retry,
  } = useSearchData({ lang: "en", keywordInput: textSearch });

  const [form] = Form.useForm();
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.search]);

  useEffect(() => {
    form.setFieldsValue({
      textSearch: keyword,
      categories: selectedCategoryIds,
      ...activeFilters,
    });
  }, [activeFilters, form, keyword, selectedCategoryIds]);

  const hasAnyFilterValue = (values) => {
    const formValues = values || {};

    return Object.entries(formValues).some(([key, value]) => {
      if (key === "textSearch") {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(value);
    });
  };

  const normalizeKeyword = (value) => `${value || ""}`.trim();

  const onValuesChange = (_, allValues) => {
    const nextKeyword = normalizeKeyword(allValues?.textSearch);
    const hasKeywordChange = nextKeyword.length > 0 && nextKeyword !== keyword;

    // Ly do thay doi: cho phep bam Filter de doi URL tim kiem moi ngay tren trang search.
    setSubmitDisabled(!(hasAnyFilterValue(allValues) || hasKeywordChange));
  };

  const onFilter = async (values) => {
    const nextKeyword = normalizeKeyword(values?.textSearch);

    // Ly do thay doi: neu keyword thay doi thi uu tien dieu huong URL moi de dong bo route + state.
    if (nextKeyword.length > 0 && nextKeyword !== keyword) {
      navigate(`/search?query=${encodeURIComponent(nextKeyword)}`);
      return;
    }

    if (!hasAnyFilterValue(values)) {
      return;
    }

    await submitFilters({
      categoriesInput: values.categories || [],
      filtersInput: values,
      nextPage: 1,
    });
  };

  const handleClearFilters = async () => {
    form.resetFields();
    form.setFieldsValue({ textSearch: keyword, categories: [] });
    setSubmitDisabled(true);
    await clearFilters();
  };

  const renderProductContent = () => {
    if (isLoading && products.length === 0) {
      return <div className="_7vyg">Loading products...</div>;
    }

    if (errorType === "api-error") {
      return (
        <div className="_7vyg">
          <p>{errorMessage}</p>
          <Button type="link" onClick={retry}>
            Retry
          </Button>
        </div>
      );
    }

    if (products.length === 0) {
      return <div className="_7vyg">No products found.</div>;
    }

    return (
      <div className="products">
        {products.map((item) => {
          const slug = item.slug || item.url || "";
          const image = item.thumb || "/images/website/product-list_1.png";

          return (
            <div className="col has-hover product" key={item.id || `${slug}-${item.sku}`}>
              <div className="col-inner">
                <div className="box-product has-hover">
                  <div className="box-image customer-box-image-product">
                    <Link to={slug ? `/product/${slug}` : "#"} className="_1gqs block image-zoom">
                      <img src={image} className="_8wjh" />
                    </Link>
                  </div>
                  <div className="box-text box-text-products text-left">
                    <div className="title-wrapper">
                      <h4 className="product-title">
                        <Link to={slug ? `/product/${slug}` : "#"} className="product_link">
                          {item.prodName || "Product"}
                        </Link>
                      </h4>
                      <p className="sku">
                        SKU: <span>{item.sku || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isEmptyKeyword || errorType === "invalid-query") {
    return (
      <div id="content" className="content-area">
        <section className="penury-gym section">
          <div className="section-content relative">
            <div className="_7vyg">
              <h2 className="_5xfq _1kly">Invalid Search Keyword</h2>
              <p>{errorMessage || "Please enter a valid keyword to search products."}</p>
              <Link to="/all-product">Back to All Products</Link>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div id="content" className="content-area">
      <section className="heath-lek section">
        <div className="section-bg fill">
          <div className="video-overlay no-click fill"></div>
          <video
            className="video-bg fill"
            preload="true"
            playsInline
            autoPlay
            muted
            loop
          >
            <source
              src="images/website/video_category_product.mp4"
              type="video/mp4"
            />
          </video>
          <div className="section-bg-overlay absolute fill"></div>
        </div>
        <div className="section-content relative">
          <div className="_4csl row">
            <div className="_9trw col large-6 medium-6 small-12 RemovePaddingBottom">
              <div className="col-inner">
                <div className="_4yvp">
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
                        title: <span className="active-bread">Search</span>,
                      },
                    ]}
                    id="breadcrumb"
                  />
                  <h2 className="_5xfq _1kly">Search</h2>
                  <p className="_7vyg">
                    Results you search with keywords: &quot;{textSearch}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="penury-gym section">
        <div className="section-content relative">
          <div className=" category-page-row">
            <Row gutter={30}>
              <Col span={6}>
                <div className="product_sidebar_cate">
                  <div className="show-for-small filter-icon">
                    <div className="group-filter">
                      <i className="fa-light fa-filter"></i>
                    </div>
                    <span className="label">Filter</span>
                  </div>
                  <div className="col-inner">
                    <Form
                      layout="vertical"
                      form={form}
                      onValuesChange={onValuesChange}
                      onFinish={onFilter}
                    >
                      <div className="_4get">
                        <div className="_4yee">
                          <div className="_5tyu">Filters</div>
                          <div className="_2wzq">
                            <Button
                              type="link"
                              size="small"
                              id="clear-filter"
                              onClick={handleClearFilters}
                              disabled={!hasActiveFilters}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                        <Form.Item name="textSearch" className="_7pia">
                          <Input
                            placeholder="Search Products"
                            className="_8jji"
                            suffix={<SearchOutlined />}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Categories"
                        name="categories"
                        className="widget_product_categories"
                      >
                        <Checkbox.Group className="form-group">
                          {categories.map((category) => (
                            <Checkbox value={category.value} key={category.value}>
                              {category.label}
                            </Checkbox>
                          ))}
                        </Checkbox.Group>
                      </Form.Item>

                      {/* Ly do thay doi: render filter groups dong theo API de dong bo voi contract BE. */}
                      {filterGroups.map((group) => (
                        <Form.Item
                          label={group.filterName}
                          name={group.filterKey}
                          className="widget_product_categories"
                          key={group.filterKey}
                        >
                          <Checkbox.Group className="form-group">
                            {group.options.map((option) => (
                              <Checkbox value={option} key={option}>
                                {option}
                              </Checkbox>
                            ))}
                          </Checkbox.Group>
                        </Form.Item>
                      ))}

                      {!isSubmitDisabled && (
                        <Button
                          type="link"
                          htmlType="submit"
                          className="filter"
                          loading={isSubmitting}
                        >
                          Filter
                        </Button>
                      )}
                    </Form>
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <div className="product_cate">
                  <div className="_7mkr">
                    <h2 className="_3rac">Keyword: &quot;{keyword}&quot;</h2>
                  </div>
                  {renderProductContent()}

                  <Pagination
                    current={page}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={goToPage}
                    className="pagination-cntt"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      <section className="lichen-gel section">
        <div className="section-content relative">
          <div className="_2gia">
            <Row gutter={60}>
              <Col span={12}>
                <div className="text-box_image">
                  <p className="_0kce uppercase">Our catalog</p>
                  <h3 className="_8mak">Explore Our Catalogs</h3>
                  <p className="_8fet">
                    An Phat Holdings produces compostable bags and products like
                    knives, spoons, and straws from AnBio materials, decomposing
                    into water, CO₂, and humus in 6-12 months. Their compostable
                    packaging is the first in Vietnam certified with the OK
                    compost HOME by TUV Austria, ensuring biodegradability in
                    natural conditions within a year.
                  </p>
                  <div className="_3qdw">
                    <a href="#" className="button button-outline-green">
                      <span>Our Catalogs</span>
                      <i className="fa-regular fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="_1mtz">
                  <div className="image-box_image">
                    <img src="/images/website/explore.png" className="_6ikc" />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SearchScreen;
