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
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Checkout</h2>
      
      <div className="checkout-layout">
        <div className="card checkout-form">
          <form onSubmit={handleCheckout}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Shipping Information</h3>
            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>Full Address</label>
              <textarea 
                className="input"
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                rows="4"
                placeholder="123 Main St, Springfield..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
            
            <div className="badge active mock-payment-badge" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)', display: 'block', textAlign: 'left', fontWeight: 'normal', textTransform: 'none' }}>
              <strong style={{ display: 'block', marginBottom: 'var(--space-1)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700' }}>Mock Payment — Confirm Order</strong>
              <span style={{ fontSize: '0.875rem' }}>This is a simulated checkout. Your card will not be charged.</span>
            </div>

            {error && <p className="error">{error}</p>}
            
            <button type="submit" className="btn-primary place-order-btn" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-6)', padding: 'var(--space-4)', fontSize: '1.1rem' }}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="card checkout-summary">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Order Details</h3>
          <ul className="checkout-item-list">
            {cart.map(item => (
              <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span>{item.product.name} (x{item.quantity})</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total:</strong>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--color-primary)' }}>${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
