"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import SearchIcon from "@/components/icons/SearchIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ProductsList from "./ProductsList";
import ProductModal from "./ProductModal";
import useProducts from "@/hooks/useProducts";
import type { ProductData } from "@/lib/types";
import styles from "./ProductsPage.module.css";

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterOption, setFilterOption] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const [sort, order] = sortOption.split("-");
  const apiSort = sort === "qty" ? "quantity" : sort;

  const { products, isLoading, error, deleteProduct, addProduct, updateProduct } =
    useProducts({
      search: searchQuery,
      status: filterOption,
      sort: apiSort,
      order: order as "asc" | "desc",
    });

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        setSelectedProduct(product);
        setIsModalOpen(true);
      }
    },
    [products]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (productData: Omit<ProductData, "id">) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, productData);
    } else {
      await addProduct(productData);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Inventory Overview</h2>
          <p className={styles.subtitle}>
            Manage your products, pricing, and stock levels.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <PlusIcon size={18} />
          Add Product
        </button>
      </div>

      {error && <div className={styles.errorBanner}>Error: {error}</div>}

      <div className={styles.controlsCard}>
        <div className={styles.controlsInner}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              aria-label="Search products by name or category"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.dropdownGroup}>
            <div className={styles.dropdown} ref={filterRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-label="Filter"
                aria-expanded={isFilterOpen}
                aria-haspopup="menu"
                aria-controls="filter-menu"
              >
                <span className={styles.dropdownTriggerLabel}>
                  {filterOption === "all" && "All Status"}
                  {filterOption === "in-stock" && "In Stock"}
                  {filterOption === "low-stock" && "Low Stock"}
                </span>
                <ChevronDownIcon size={14} />
              </button>
              {isFilterOpen && (
                <div id="filter-menu" className={styles.dropdownMenu} role="menu">
                  <button
                    className={`${styles.dropdownItem} ${filterOption === "all" ? styles.dropdownItemActive : ""}`}
                    onClick={() => { setFilterOption("all"); setIsFilterOpen(false); }}
                  >
                    All Status
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${filterOption === "in-stock" ? styles.dropdownItemActive : ""}`}
                    onClick={() => { setFilterOption("in-stock"); setIsFilterOpen(false); }}
                  >
                    In Stock
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${filterOption === "low-stock" ? styles.dropdownItemActive : ""}`}
                    onClick={() => { setFilterOption("low-stock"); setIsFilterOpen(false); }}
                  >
                    Low Stock
                  </button>
                </div>
              )}
            </div>

            <div className={styles.dropdown} ref={sortRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-label="Sort"
                aria-expanded={isSortOpen}
                aria-haspopup="menu"
                aria-controls="sort-menu"
              >
                <span className={styles.dropdownTriggerLabel}>
                  {sortOption === "name-asc" && "Name (A-Z)"}
                  {sortOption === "name-desc" && "Name (Z-A)"}
                  {sortOption === "price-asc" && "Price (Low-High)"}
                  {sortOption === "price-desc" && "Price (High-Low)"}
                  {sortOption === "qty-asc" && "Quantity (Low-High)"}
                  {sortOption === "qty-desc" && "Quantity (High-Low)"}
                </span>
                <ChevronDownIcon size={14} />
              </button>
              {isSortOpen && (
                <div id="sort-menu" className={styles.dropdownMenu} role="menu">
                  {[
                    { value: "name-asc", label: "Name (A-Z)" },
                    { value: "name-desc", label: "Name (Z-A)" },
                    { value: "price-asc", label: "Price (Low-High)" },
                    { value: "price-desc", label: "Price (High-Low)" },
                    { value: "qty-asc", label: "Quantity (Low-High)" },
                    { value: "qty-desc", label: "Quantity (High-Low)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.dropdownItem} ${sortOption === opt.value ? styles.dropdownItemActive : ""}`}
                      onClick={() => { setSortOption(opt.value); setIsSortOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductsList
        products={products}
        isLoading={isLoading}
        onDelete={deleteProduct}
        onEdit={handleOpenEditModal}
      />

      <ProductModal
        key={selectedProduct?.id || "new"}
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        product={selectedProduct}
      />
    </>
  );
};

export default ProductsPage;
