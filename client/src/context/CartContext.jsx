import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/api/cart');
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/api/cart', { productId, quantity });
      fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/api/cart/${productId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating cart', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart', error);
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
