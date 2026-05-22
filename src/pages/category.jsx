import { SearchOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategoryPageData } from "../hooks/useCategoryPageData";

function Category() {
  // Ly do thay doi: bo sung data binding tu API nhung giu toi da cau truc UI cu.
  const {
    categoryData,
    filterGroups,
    products,
    totalCount,
    page,
    pageSize,
    isLoading,
    errorType,
    errorMessage,
    fetchProducts,
    retry,
  } = useCategoryPageData("en");

  const [form] = Form.useForm();
  const [filterData, setFilterData] = useState();
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);

  const children = Array.isArray(categoryData?.children)
    ? categoryData.children
    : [];

  const categoryName = categoryData?.categoryName || "Category";
  const categoryDescription =
    categoryData?.description || "No category description available.";

  const hasAnyValue = (values) =>
    Object.values(values || {}).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(value);
    });

  const onValuesChange = (_, allValues) => {
    setSubmitDisabled(!hasAnyValue(allValues));
  };

  const onFilter = (values) => {
    if (!hasAnyValue(values)) {
      return;
    }

    // Ly do thay doi: BE chua co API filter theo filterList tren category, nen tam luu UI state.
    setFilterData(values);
  };

  const clearFilters = () => {
    form.resetFields();
    setFilterData(undefined);
    setSubmitDisabled(true);
  };

  const handlePageChange = (nextPage) => {
    fetchProducts(nextPage);
  };

  const renderProductContent = () => {
    if (isLoading) {
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
      return <div className="_7vyg">No products found for this category.</div>;
    }

    return (
      <div className="products">
        {products.map((item) => (
          <div className="col has-hover product" key={item.id}>
            <div className="col-inner">
              <div className="box-product has-hover">
                <div className="box-image customer-box-image-product">
                  <Link to={`/product/${item.slug}`} className="_1gqs block image-zoom">
                    <img src={item.thumb} className="_8wjh" />
                  </Link>
                </div>
                <div className="box-text box-text-products text-left">
                  <div className="title-wrapper">
                    <h4 className="product-title">
                      <Link to={`/product/${item.slug}`} className="product_link">
                        {item.prodName}
                      </Link>
                    </h4>
                    <p className="sku">
                      SKU: <span>{item.sku}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (errorType === "invalid-url") {
    return (
      <div id="content" className="content-area">
        <section className="penury-gym section">
          <div className="section-content relative">
            <div className="_7vyg">
              <h2 className="_5xfq _1kly">Invalid Category URL</h2>
              <p>{errorMessage}</p>
              <Link to="/all-product">Back to All Products</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (errorType === "not-found") {
    return (
      <div id="content" className="content-area">
        <section className="penury-gym section">
          <div className="section-content relative">
            <div className="_7vyg">
              <h2 className="_5xfq _1kly">Category Not Found</h2>
              <p>{errorMessage}</p>
              <Button type="link" onClick={retry}>
                Retry
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
          <div className="_4csl">
            <Row gutter={30}>
              <Col span={12} className="_9trw RemovePaddingBottom">
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
                        title: <span className="active-bread">{categoryName}</span>,
                      },
                    ]}
                    id="breadcrumb"
                  />

                  <h2 className="_5xfq _1kly">{categoryName}</h2>
                  <div className="_7vyg">
                    <p>{categoryDescription}</p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
      <section className="penury-gym section">
        <div className="section-content relative">
          <div className="category-page-row">
            <Row gutter={30}>
              <Col span={6}>
                <div className="product_sidebar_cate">
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
                            onClick={clearFilters}
                            disabled={!filterData}
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
                        {children.map((child) => (
                          <Checkbox value={child.id} key={child.id}>
                            <Link to={child.link || "#"}>{child.categoryName}</Link>
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    </Form.Item>

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
                      <Button type="link" htmlType="submit" className="filter">
                        Filter
                      </Button>
                    )}
                  </Form>
                </div>
              </Col>

              <Col span={18}>
                <div className="_7mkr">
                  <h2 className="_3rac">{categoryName}</h2>
                </div>
                {renderProductContent()}

                <Pagination
                  current={page}
                  total={totalCount}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  className="pagination-cntt"
                />
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
                  <p className="_0kce">Our catalog</p>
                  <h3 className="_8mak">Explore Our Catalogs</h3>
                  <p className="_8fet">
                    Through a journey of establishment and continuous
                    development, An Phat Holdings has emerged as the leading
                    high-tech, environmentally friendly plastics group in
                    Southeast Asia. With over 20 years of experience, we are
                    dedicated to delivering high-quality, sustainable products
                    across a wide range of industries. As the region’s foremost
                    innovator in eco-friendly plastic solutions, we have built a
                    strong reputation and successfully expanded our presence
                    into key global markets, including Europe, the Americas, the
                    UAE, Japan, Korea, Singapore, Taiwan, and the Philippines.
                    Driven by ongoing research, innovation, and creativity, we
                    are committed to creating enduring value for our customers,
                    investors, and employees.
                  </p>
                  <div className="_3qdw">
                    <a className="button button-outline-green" href="/catalog">
                      <span>Our Catalogs</span>
                      <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                    </a>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="image-box_image">
                  <img src="/images/website/explore.png" className="_6ikc" />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Category;
