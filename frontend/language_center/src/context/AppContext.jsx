import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();

const buildCartKey = (item) => {
  const courseId = item?.courseId ?? item?.id;
  const classId = item?.selectedClass?.classId ?? item?.classId ?? "no-class";
  return `${courseId}-${classId}`;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const addToCart = (item) => {
    const normalizedItem = {
      ...item,
      courseId: item?.courseId ?? item?.id,
      cartKey: buildCartKey(item),
    };

    if (
      cart.find(
        (existingItem) => existingItem.cartKey === normalizedItem.cartKey,
      )
    ) {
      alert("Khóa học đã có trong giỏ hàng!");
      return;
    }

    setCart((currentCart) => [...currentCart, normalizedItem]);
  };

  const removeFromCart = (identifier) =>
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartKey !== identifier && item.id !== identifier,
      ),
    );
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (total, item) => total + (item.tuitionFee || 0),
    0,
  );
  const cartOriginalTotal = cart.reduce(
    (total, item) => total + (item.originalPrice || item.tuitionFee || 0),
    0,
  );

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartOriginalTotal,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        isNotifOpen,
        setIsNotifOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
