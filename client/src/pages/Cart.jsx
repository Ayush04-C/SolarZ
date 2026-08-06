import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading) return <div>Loading cart...</div>;

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-state">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/products')} className="checkout-btn" style={{marginTop: '1rem'}}>Continue Shopping</button>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <img 
                src={item.product.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${item.product.images[0]}` : 'https://via.placeholder.com/150'} 
                alt={item.product.name} 
              />
              <div className="ci-info">
                <h4>{item.product.name}</h4>
                <p className="ci-price">${item.product.price.toFixed(2)}</p>
                <div className="ci-controls">
                  <input 
                    type="number" 
                    min="1" 
                    max={item.product.stock}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                  />
                  <button onClick={() => removeFromCart(item.product._id)} className="ci-remove">Remove</button>
                </div>
                {item.product.stock < item.quantity && <span className="ci-stock-warning">Exceeds available stock ({item.product.stock})!</span>}
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
