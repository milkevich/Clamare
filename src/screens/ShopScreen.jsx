// src/screens/ShopScreen.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import s from "../shared/ShopScreen.module.scss";
import { fetchProducts } from "../utils/shopify";
import { MdArrowDropDown } from "react-icons/md";
import { Fade } from "@mui/material";
import { Range, getTrackBackground } from "react-range";

// Define the size order for sorting sizes
const SIZE_ORDER = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"];

// Helper function to sort sizes
function compareSizes(a, b) {
  const A = a.toUpperCase();
  const B = b.toUpperCase();

  const indexA = SIZE_ORDER.indexOf(A);
  const indexB = SIZE_ORDER.indexOf(B);

  if (indexA === -1 && indexB === -1) {
    return A.localeCompare(B);
  } else if (indexA === -1) {
    return 1;
  } else if (indexB === -1) {
    return -1;
  } else {
    return indexA - indexB;
  }
}

const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [itemHover, setItemHover] = useState(null);
  const [fadeDelay, setFadeDelay] = useState(false);

  // Filter/Sort states
  const [availabilityFilter, setAvailabilityFilter] = useState(""); // '', 'available', 'unavailable'
  const [priceRange, setPriceRange] = useState([0, 0]); // [min, max]
  const [sortBy, setSortBy] = useState("A-Z"); // 'A-Z', 'Z-A', 'LOW-HIGH', 'HIGH-LOW'

  // Store the absolute min and max prices for resetting
  const [absolutePriceRange, setAbsolutePriceRange] = useState([0, 0]);

  // Dropdown visibility states
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    availability: false,
    price: false,
    sort: false,
  });

  const navigate = useNavigate();

  // Refs for detecting clicks outside the dropdowns
  const availabilityRef = useRef();
  const priceRef = useRef();
  const sortRef = useRef();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const shopifyProducts = await fetchProducts();
        setProducts(shopifyProducts);

        // Determine the price range based on products
        const prices = shopifyProducts.map((product) =>
          parseFloat(product.priceRange.minVariantPrice.amount)
        );
        const minPrice = Math.min(...prices, 0);
        const maxPrice = Math.max(...prices, 0);
        setPriceRange([minPrice, maxPrice]);
        setAbsolutePriceRange([minPrice, maxPrice]);

        setFadeDelay(false);
        setTimeout(() => {
          setFadeDelay(true);
        }, 10);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    loadProducts();
  }, []);

  // Handle clicks outside the dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        availabilityRef.current &&
        !availabilityRef.current.contains(event.target)
      ) {
        setIsDropdownOpen((prev) => ({ ...prev, availability: false }));
      }
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setIsDropdownOpen((prev) => ({ ...prev, price: false }));
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsDropdownOpen((prev) => ({ ...prev, sort: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  // Handle selection of filter/sort options
  const handleFilterSelect = (filterType, value) => {
    if (filterType === "availability") setAvailabilityFilter(value);
    if (filterType === "sort") setSortBy(value);
    setIsDropdownOpen((prev) => ({
      ...prev,
      [filterType]: false,
    }));
  };
  

  // Handle price range reset
  const handlePriceReset = () => {
    setPriceRange(absolutePriceRange);
  };

  // Filter products based on selected filters
  const filteredProducts = products.filter((product) => {
    // Availability filter
    if (availabilityFilter === "available" && !product.availableForSale) {
      return false;
    }
    if (availabilityFilter === "unavailable" && product.availableForSale) {
      return false;
    }

    // Price filter
    if (priceRange) {
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }
    }

    return true;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts];
  if (sortBy === "A-Z") {
    sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "Z-A") {
    sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === "LOW-HIGH") {
    sortedProducts.sort(
      (a, b) =>
        parseFloat(a.priceRange.minVariantPrice.amount) -
        parseFloat(b.priceRange.minVariantPrice.amount)
    );
  } else if (sortBy === "HIGH-LOW") {
    sortedProducts.sort(
      (a, b) =>
        parseFloat(b.priceRange.minVariantPrice.amount) -
        parseFloat(a.priceRange.minVariantPrice.amount)
    );
  }

  return (
    <Fade in={sortedProducts && fadeDelay}>
      <div>
        {/* Filter and Sort Section */}
        <div
          style={{
            borderBottom: "1px solid var(--border-color)",
            width: "100vw",
            fontSize: "10px",
            fontWeight: "580",
          }}
        >
          <div
            style={{
              padding: "10px 1.25rem",
              maxWidth: "1300px",
              margin: "auto",
              display: "flex",
              gap: "1.25rem",
              justifyContent: "space-between",
            }}
          >
            {/* LEFT SIDE FILTERS */}
            <div style={{ display: "flex", gap: "1.25rem" }}>
              <p style={{ margin: 0, fontWeight: "600" }}>FILTER:</p>

              {/* AVAILABILITY FILTER */}
              <span
                ref={availabilityRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => toggleDropdown("availability")}
              >
                <span>AVAILABILITY</span>
                <MdArrowDropDown size={12} />
                {isDropdownOpen.availability && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 20px)",
                      left: 0,
                      width: "200px",
                      backgroundColor: "var(--main-bg-color)",
                      border: "1px solid var(--border-color)",
                      zIndex: 100,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      onClick={() => handleFilterSelect("availability", "")}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                        
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={availabilityFilter === ""}
                        readOnly
                      />
                      <span>ALL PRODUCTS</span>
                    </div>
                    <div
                      onClick={() =>
                        handleFilterSelect("availability", "available")
                      }
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                        
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={availabilityFilter === "available"}
                        readOnly
                      />
                      <span>IN STOCK</span>
                    </div>
                    <div
                      onClick={() =>
                        handleFilterSelect("availability", "unavailable")
                      }
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={availabilityFilter === "unavailable"}
                        readOnly
                      />
                      <span>OUT OF STOCK</span>
                    </div>
                  </div>
                )}
              </span>
              <span
                ref={priceRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span onClick={() => toggleDropdown("price")}>PRICE</span>
                <MdArrowDropDown size={12} />
                {isDropdownOpen.price && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 20px)",
                      left: 0,
                      width: "300px",
                      padding: "20px",
                      backgroundColor: "var(--main-bg-color)",
                      border: "1px solid var(--border-color)",
                      zIndex: 100,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                      paddingBottom: '40px'
                    }}
                  >
                    <Range
                      values={priceRange}
                      step={1}
                      min={absolutePriceRange[0]}
                      max={absolutePriceRange[1]}
                      onChange={(values) => setPriceRange(values)}
                      renderTrack={({ props, children }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: "2px",
                            width: "100%",
                            background: getTrackBackground({
                              values: priceRange,
                              colors: ["var(--main-color)", "var(--main-color)", "var(--main-color)"],
                              min: absolutePriceRange[0],
                              max: absolutePriceRange[1],
                            }),
                            borderRadius: "3px",
                            marginBottom: '15px',
                            borderTop: '10px solid var(--main-bg-color)',
                            borderBottom: '10px solid var(--main-bg-color)',
                          }}
                        >
                          {children}
                        </div>
                      )}
                      renderThumb={({ index, props, isDragged }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: "8px",
                            width: "1px",
                            backgroundColor: "var(--main-color)",
                            border: "1px solid var(--main-color)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              height: "3px",
                              width: "3px",
                              backgroundColor: "var(--main-color)",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                      )}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <button
                      onClick={handlePriceReset}
                      style={{
                        fontSize: "10px",
                        cursor: "pointer",
                        backgroundColor: "var(--button-bg-color)",
                        border: "none",
                        borderRadius: "4px",
                        color: "var(--button-text-color)",
                        position: 'absolute',
                        marginLeft: '-10px',
                        marginTop: '15px',
                        fontWeight: '600'
                      }}
                    >
                      RESET
                    </button>
                  </div>
                )}
              </span>
            </div>

            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span
                ref={sortRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  position: "relative",
                  cursor: "pointer",
                  zIndex: 80
                }}
                onClick={() => toggleDropdown("sort")}
              >
                <span>SORT BY</span>
                <MdArrowDropDown size={12} />
                {isDropdownOpen.sort && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 20px)",
                      right: 0,
                      width: "200px",
                      backgroundColor: "var(--main-bg-color)",
                      border: "1px solid var(--border-color)",
                      zIndex: 100,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.025)",
                    }}
                  >
                    {["A-Z", "Z-A", "LOW-HIGH", "HIGH-LOW"].map((option) => (
                      <div
                        key={option}
                        onClick={() => handleFilterSelect("sort", option)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                         <input
                        type="checkbox"
                        checked={sortBy === option}
                        readOnly
                      />
                      <span>{option === "A-Z"
                          ? "A-Z"
                          : option === "Z-A"
                          ? "Z-A"
                          : option === "LOW-HIGH"
                          ? "Price: Low to High"
                          : "Price: High to Low"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </span>
              <span>{sortedProducts.length} PRODUCTS</span>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={{ padding: "1.25rem", maxWidth: "1470px", margin: "auto" }}>
          <ul className={s.shopGrid}>
            {sortedProducts.map((product, index) => {
              const firstVariant = product.variants.edges[0]?.node;

              const frontImage = product.images.edges[0]?.node.url;
              const backImage =
                product.images?.edges[2]?.node.url ||
                product.images?.edges[1]?.node.url ||
                null;

              const price = Math.floor(product.priceRange.minVariantPrice.amount);

              const numericVariantId = firstVariant?.id
                ? firstVariant.id.split("/").pop()
                : "";

              return (
                <li
                  key={product.id}
                  className={s.shopItem}
                  onMouseEnter={() => setItemHover(index)}
                  onMouseLeave={() => setItemHover(null)}
                  style={{ cursor: "pointer", position: "relative" }}
                  onClick={() => {
                    if (!firstVariant) return;
                    navigate(
                      `/products/${product.handle}?variant=${numericVariantId}`
                    );
                  }}
                >
                  <div className={s.imageWrapper} style={{ position: "relative" }}>
                    <img
                      className={`${s.shopImage} ${s.frontImage}`}
                      src={frontImage}
                      alt={product.title}
                      style={{ width: "100%", transition: "opacity 0.3s ease" }}
                    />
                    {backImage && (
                      <img
                        className={`${s.shopImage} ${s.backImage}`}
                        src={backImage}
                        alt={`${product.title} Variation`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          opacity: itemHover === index ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    )}
                  </div>

                  <p className={s.itemName}>{product.title.toUpperCase()}</p>
                  <p className={s.itemPrice}>${price}</p>

                  {/* On hover, show sizes */}
                  <div
                    style={{
                      opacity: itemHover === index ? 1 : 0,
                      transition: "ease-in-out 0.2s all",
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {(() => {
                      const sizesSet = new Set();
                      product.variants.edges.forEach(({ node: variant }) => {
                        const sizeOpt = variant.selectedOptions.find(
                          (opt) => opt.name.toLowerCase() === "size"
                        );
                        if (sizeOpt) {
                          sizesSet.add(sizeOpt.value);
                        }
                      });

                      const sortedSizes = Array.from(sizesSet).sort(compareSizes);
                      return sortedSizes.map((sizeVal) => (
                        <p key={sizeVal} style={{ fontSize: "12px", margin: 0 }}>
                          {sizeVal}
                        </p>
                      ));
                    })()}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Fade>
  );
};

export default ShopScreen;
