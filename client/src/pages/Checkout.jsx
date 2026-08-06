import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import api from '../api/axios';

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cart.length === 0) {
    return <div className="main-content">Your cart is empty.</div>;
  }

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/orders/checkout', { shippingAddress: address });
      clearCart();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      
      <div className="checkout-layout">
        <div className="checkout-form">
          <form onSubmit={handleCheckout}>
            <h3>Shipping Information</h3>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label>Full Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                rows="4"
                placeholder="123 Main St, Springfield..."
                style={{width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc'}}
              ></textarea>
            </div>
            
            <div className="mock-payment-banner">
              <strong>Mock Payment — Confirm Order</strong>
              <p>This is a simulated checkout. Your card will not be charged.</p>
            </div>

            {error && <p className="error">{error}</p>}
            
            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h3>Order Details</h3>
          <ul className="checkout-item-list">
            {cart.map(item => (
              <li key={item._id}>
                <span>{item.product.name} (x{item.quantity})</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            <strong>Total:</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
