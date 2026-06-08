"use client";

import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import { getStatus } from "@/lib/helpers/productHelpers";
import ConfirmModal from "./ConfirmModal";
import { useModal } from "@/hooks/useModal";
import { toggleFavourite, selectIsFavourite } from "@/store/favouritesSlice";
import type { RootState } from "@/store/store";
import styles from "./ProductRow.module.css";

interface ProductRowProps {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  id,
  name,
  category,
  quantity,
  price,
  onDelete,
  onEdit,
}) => {
  const { isOpen: showDeleteModal, openModal, closeModal } = useModal();
  const dispatch = useDispatch();
  const isFavourite = useSelector((state: RootState) => selectIsFavourite(id)(state));
  const status = getStatus(quantity);

  const handleDelete = useCallback(() => {
    onDelete(id);
    closeModal();
  }, [id, onDelete, closeModal]);

  const statusClass =
    status.class === "status-low"
      ? styles.low
      : status.class === "status-med"
      ? styles.med
      : styles.high;

  return (
    <>
      <tr className={styles.row}>
        <td className={styles.td}>
          <div className={styles.productCell}>
            <div className={styles.avatar}>{name.charAt(0)}</div>
            <span className={styles.name}>{name}</span>
          </div>
        </td>
        <td className={styles.td}>
          <span className={styles.category}>{category}</span>
        </td>
        <td className={styles.td}>
          <span className={styles.quantity}>{quantity}</span>
        </td>
        <td className={styles.td}>
          <span className={`${styles.chip} ${statusClass}`}>{status.label}</span>
        </td>
        <td className={`${styles.td} ${styles.right}`}>
          <span className={styles.price}>
            ${price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </td>
        <td className={`${styles.td} ${styles.right}`}>
          <div className={styles.actions}>
            <button
              className={`${styles.iconBtn} ${isFavourite ? styles.favourite : ""}`}
              onClick={() => dispatch(toggleFavourite(id))}
              title={isFavourite ? "Remove from favourites" : "Add to favourites"}
              aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
              aria-pressed={isFavourite}
            >
              <HeartIcon size={18} filled={isFavourite} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => onEdit(id)}
              title="Edit Product"
            >
              <EditIcon size={18} />
            </button>
            <button
              className={`${styles.iconBtn} ${styles.danger}`}
              onClick={openModal}
              title="Delete Product"
            >
              <TrashIcon size={18} />
            </button>
          </div>
        </td>
      </tr>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeModal}
        onConfirm={handleDelete}
        title="Delete Product"
        confirmText="Delete Product"
        variant="danger"
      >
        <p>
          Are you sure you want to delete <strong>&quot;{name}&quot;</strong>?
          This action cannot be undone and will permanently remove the item from
          your inventory.
        </p>
      </ConfirmModal>
    </>
  );
};

export default ProductRow;
