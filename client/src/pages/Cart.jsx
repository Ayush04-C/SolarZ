import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading) return <div>Loading cart...</div>;

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-state card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <h2 className="cart-empty-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Your Cart is Empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary" style={{marginTop: 'var(--space-4)'}}>Continue Shopping</button>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="cart-page">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Shopping Cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="card cart-item">
              <img 
                src={item.product.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${item.product.images[0]}` : 'https://via.placeholder.com/150'} 
                alt={item.product.name} 
                className="cart-item-img"
              />
              <div className="ci-info">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{item.product.name}</h4>
                <div style={{ margin: 'var(--space-2) 0' }}>
                   <span className="price-tag" style={{ fontSize: '1rem', padding: 'var(--space-1) var(--space-2)' }}>${item.product.price.toFixed(2)}</span>
                </div>
                <div className="ci-controls">
                  <input 
                    type="number" 
                    className="input cart-qty-input"
                    min="1" 
                    max={item.product.stock}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <button onClick={() => removeFromCart(item.product._id)} className="btn-danger ci-remove">Remove</button>
                </div>
                {item.product.stock < item.quantity && <span className="text-danger" style={{ fontSize: '0.875rem' }}>Exceeds available stock ({item.product.stock})!</span>}
              </div>
            </div>
          ))}
        </div>
        
        <div className="card cart-summary">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Order Summary</h3>
          <div className="summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            <span>Subtotal:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '700' }}>${subtotal.toFixed(2)}</span>
          </div>
          <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
