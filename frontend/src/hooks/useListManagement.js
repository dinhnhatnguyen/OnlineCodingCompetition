import { useState, useCallback } from "react";

export const useListManagement = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);
  const [lastModifiedId, setLastModifiedId] = useState(null);

  // Cập nhật danh sách và đưa item vừa sửa lên đầu
  const updateList = useCallback((newItems, modifiedItemId = null) => {
    if (modifiedItemId) {
      // Tìm item vừa được sửa
      const modifiedItem = newItems.find((item) => item.id === modifiedItemId);
      if (modifiedItem) {
        // Lọc ra các item còn lại
        const otherItems = newItems.filter(
          (item) => item.id !== modifiedItemId
        );
        // Đặt item vừa sửa lên đầu danh sách
        setItems([modifiedItem, ...otherItems]);
        setLastModifiedId(modifiedItemId);
      } else {
        setItems(newItems);
      }
    } else {
      setItems(newItems);
    }
  }, []);

  // Reset trạng thái item vừa sửa
  const resetLastModified = useCallback(() => {
    setLastModifiedId(null);
  }, []);

  return {
    items,
    lastModifiedId,
    updateList,
    resetLastModified,
  };
};
