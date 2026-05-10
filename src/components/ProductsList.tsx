"use client";

import React, { useState } from "react";
import InventoryIcon from "@/components/icons/InventoryIcon";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import ProductRow from "./ProductRow";
import type { ProductData } from "@/lib/types";
import styles from "./ProductsList.module.css";

interface ProductsListProps {
  products: ProductData[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  isLoading,
  onDelete,
  onEdit,
}) => {
  const [page, setPage] = useState(0);

  const rowsPerPage = ITEMS_PER_PAGE;
  const totalCount = products.length;
  const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);
  const displayPage = Math.min(page, maxPage);
  const paginatedProducts = products.slice(
    displayPage * rowsPerPage,
    displayPage * rowsPerPage + rowsPerPage
  );

  const handlePrev = () => setPage(Math.max(0, displayPage - 1));
  const handleNext = () => setPage(Math.min(maxPage, displayPage + 1));

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th scope="col" className={styles.th}>Product</th>
                <th scope="col" className={styles.th}>Category</th>
                <th scope="col" className={styles.th}>Quantity</th>
                <th scope="col" className={styles.th}>Status</th>
                <th scope="col" className={`${styles.th} ${styles.right}`}>Price</th>
                <th scope="col" className={`${styles.th} ${styles.right}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowsPerPage }).map((_, i) => (
                <tr key={i} className={styles.row}>
                  <td className={styles.td}>
                    <div className={styles.skeletonCircle} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonLine} style={{ width: "120px" }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonLine} style={{ width: "60px" }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonLine} style={{ width: "80px" }} />
                  </td>
                  <td className={`${styles.td} ${styles.right}`}>
                    <div className={styles.skeletonLine} style={{ width: "60px", marginLeft: "auto" }} />
                  </td>
                  <td className={`${styles.td} ${styles.right}`}>
                    <div className={styles.skeletonLine} style={{ width: "80px", marginLeft: "auto" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <InventoryIcon size={56} />
        <h3 className={styles.emptyTitle}>No products found</h3>
        <p className={styles.emptyText}>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th scope="col" className={styles.th}>Product</th>
              <th scope="col" className={styles.th}>Category</th>
              <th scope="col" className={styles.th}>Quantity</th>
              <th scope="col" className={styles.th}>Status</th>
              <th scope="col" className={`${styles.th} ${styles.right}`}>Price</th>
              <th scope="col" className={`${styles.th} ${styles.right}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <ProductRow
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                quantity={product.quantity}
                price={product.price}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={handlePrev}
          disabled={displayPage === 0}
        >
          <ChevronLeftIcon size={16} />
          Previous
        </button>
        <span className={styles.pageInfo}>
          Page {displayPage + 1} of {maxPage + 1}
        </span>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={handleNext}
          disabled={displayPage >= maxPage}
        >
          Next
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductsList;
