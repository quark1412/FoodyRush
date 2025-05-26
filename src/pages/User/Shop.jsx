import React, { useState, useEffect, useContext } from "react";

import { getAllProducts } from "../../data/products";
import Banner from "../../components/Banner";
import ProductItem from "../../components/ProductItem";
import CheckBox from "../../components/CheckBox";
import FilterItem from "../../components/FilterItem";
import Pagination from "../../components/Pagination";
import {
  MAX_PRICE,
  MIN_PRICE,
  PRICE_GAP,
  PRODUCTS_PER_PAGE,
} from "../../utils/Constants";
import { SORT_BY } from "../../utils/Constants";
import { getAllCategories, getCategoryById } from "../../data/categories";
import { getAllImagesByProductId } from "../../data/productImages";
import LoadingOverlay from "../../components/LoadingOverlay";
import { formatToVND, formatURL } from "../../utils/format";
import Cookies from "js-cookie";
import AuthContext from "../../context/AuthContext";
import Error from "../Error";
import SkeletonItem from "../../components/Skeleton";

function Shop() {
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [tempMinPrice, setTempMinPrice] = useState(MIN_PRICE);
  const [tempMaxPrice, setTempMaxPrice] = useState(MAX_PRICE);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortCriteria, setSortCriteria] = useState(SORT_BY[0].value);
  const [currentPage, setCurrentPage] = useState(1);
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { auth, setHasError } = useContext(AuthContext);
  const permission = Cookies.get("permission") ?? null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value);
    if (maxPrice - value >= PRICE_GAP) {
      setTempMinPrice(value);
    } else {
      setTempMinPrice(maxPrice - PRICE_GAP);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value);
    if (value - minPrice >= PRICE_GAP) {
      setTempMaxPrice(value);
    } else {
      setTempMaxPrice(minPrice + PRICE_GAP);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.filter((category) => category !== categoryToRemove)
    );
  };

  const resetPrice = () => {
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setTempMinPrice(MIN_PRICE);
    setTempMaxPrice(MAX_PRICE);
    setIsApplied(false);
  };

  const clearAllFilters = () => {
    resetPrice();
    setSelectedCategories([]);
  };

  useEffect(() => {
    const progress = document.querySelector("#slider #progress");

    if (!progress) {
      return;
    }

    const updateProgress = () => {
      const minPercentage = (tempMinPrice / MAX_PRICE) * 100;
      const maxPercentage = (tempMaxPrice / MAX_PRICE) * 100;

      progress.style.left = minPercentage + "%";
      progress.style.right = 100 - maxPercentage + "%";
    };

    updateProgress();
  }, [tempMinPrice, tempMaxPrice]);

  const applyFilters = () => {
    setIsApplied(true);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
  };

  const filteredProducts = productData.filter((product) => {
    const isInPriceRange =
      product.price >= minPrice && product.price <= maxPrice;
    const isInSelectedCategories =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    return isInPriceRange && isInSelectedCategories;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortCriteria) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "rating_asc":
        return a.rating - b.rating;
      case "rating_desc":
        return b.rating - a.rating;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const fetchedProducts = await getAllProducts();

      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);

      const updatedProducts = await Promise.all(
        fetchedProducts.map(async (product) => {
          const images = product.images;
          let category = {};
          if (product.categoryId) {
            const categoryData = await getCategoryById(product.categoryId._id);
            category = categoryData;
          }
          return {
            ...product,
            images: images || [],
            category: category.name,
          };
        })
      );
      console.log(updatedProducts);
      setProductData(updatedProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isApplied, selectedCategories, sortCriteria]);

  if (user && (!permission || !permission.includes("SHOP"))) {
    setHasError(true);
    return (
      <Error
        errorCode={403}
        title={"Forbidden"}
        content={"Bạn không có quyền truy cập trang này."}
      />
    );
  }

  return (
    <div className="mb-20">
      <Banner title={"Menu"} route={"Trang chủ / Menu"} />
      <div className="flex gap-x-10 py-10 px-28">
        <div className="flex flex-col w-[260px] gap-y-4 text-[20px] font-bold">
          <div className="">Tùy chọn lọc</div>
          <div className="h-[1.5px] bg-[#C9C9C9] opacity-60"></div>
          <div className="flex flex-col gap-y-3">
            <div>Danh mục</div>
            <div className="flex flex-col gap-y-2 font-normal text-[16px] max-h-[200px] overflow-y-auto">
              {categories.map((category, index) => (
                <div
                  className="flex gap-x-2 items-center caret-transparent"
                  key={index}
                >
                  <CheckBox
                    isChecked={selectedCategories.includes(`${category.name}`)}
                    onChange={() => handleCategoryChange(`${category.name}`)}
                  />
                  <label className="">{`${category.name}`}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[1.5px] bg-[#C9C9C9] opacity-60"></div>
          <div>
            <div className="flex flex-col gap-y-3 mb-3">
              <div>Giá</div>
              <div
                id="price"
                className="flex font-normal text-[#4A4A4A] text-base"
              >
                <span>{formatToVND(tempMinPrice)}</span>
                <div className="ml-1 mr-1">-</div>
                <span>{formatToVND(tempMaxPrice)}</span>
              </div>
            </div>
            <div id="slider" className="relative h-[5px] bg-[#C9C9C9] rounded">
              <div
                id="progress"
                className="h-full left-0 right-0 absolute rounded bg-[#a93f15]"
              ></div>
            </div>
            <div id="range-input" className="relative">
              <input
                type="range"
                id="range-min"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_GAP}
                value={tempMinPrice}
                onChange={handleMinPriceChange}
              />
              <input
                type="range"
                id="range-max"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_GAP}
                value={tempMaxPrice}
                onChange={handleMaxPriceChange}
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-10 py-2 text-white font-medium text-base bg-[#a93f15] rounded-lg w-full mt-6"
            >
              Áp dụng
            </button>
          </div>
        </div>
        <div className="flex flex-col ml-20 gap-y-10 w-full">
          {isLoading ? (
            <div className="flex flex-wrap gap-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonItem key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    {filteredProducts.length > 0 ? (
                      <div>
                        Hiển thị {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} -{" "}
                        {Math.min(
                          currentPage * PRODUCTS_PER_PAGE,
                          filteredProducts.length
                        )}{" "}
                        của {filteredProducts.length} kết quả
                      </div>
                    ) : (
                      <div>Hiển thị 0 - 0 của 0 kết quả</div>
                    )}
                  </div>
                  <div>
                    Sắp xếp theo:
                    <select
                      value={sortCriteria}
                      onChange={(e) => setSortCriteria(e.target.value)}
                      className="border-[#0A0A0A] border-[1px] p-2 ml-2"
                    >
                      {SORT_BY.map((criteria) => (
                        <option key={criteria.value} value={criteria.value}>
                          {criteria.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  className="flex flex-wrap items-center gap-2 max-w-full"
                  id="filter-container"
                >
                  <span className="mr-2">Bộ lọc hiện tại:</span>
                  <div className="flex gap-3 flex-wrap">
                    {selectedCategories.map((category, index) => (
                      <FilterItem
                        key={index}
                        name={category}
                        onRemove={() => handleRemoveCategory(category)}
                      />
                    ))}
                    {(minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE) && (
                      <FilterItem
                        key="price-range"
                        name={`Giá: ${formatToVND(minPrice)} - ${formatToVND(
                          maxPrice
                        )}`}
                        onRemove={resetPrice}
                      />
                    )}
                  </div>
                  {(selectedCategories.length > 0 ||
                    minPrice !== MIN_PRICE ||
                    maxPrice !== MAX_PRICE) && (
                    <div
                      className="underline ml-2 text-[#A73E14] cursor-pointer whitespace-nowrap"
                      onClick={clearAllFilters}
                    >
                      Xóa tất cả
                    </div>
                  )}
                </div>
              </div>
              <div
                className="flex gap-x-5 gap-y-5 flex-wrap min-h-60"
                id="product-container"
              >
                {currentProducts.length > 0 && !isLoading ? (
                  currentProducts.map((product) => (
                    <ProductItem
                      key={product._id}
                      productName={product.name}
                      rating={product.rating}
                      image={
                        product.images.length > 0 ? product.images[0].url : ""
                      }
                      category={product.category}
                      price={product.price}
                      id={product._id}
                    />
                  ))
                ) : (
                  <div className="text-center w-full text-3xl font-bold">
                    <p>Không có sản phẩm tương ứng với bộ lọc của bạn.</p>
                  </div>
                )}
              </div>
              {currentProducts.length > 0 && (
                <div className="mt-5">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredProducts.length / PRODUCTS_PER_PAGE
                    )}
                    onPageChange={setCurrentPage}
                    svgClassName={"w-6 h-6"}
                    textClassName={"text-xl px-4 py-2"}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shop;
