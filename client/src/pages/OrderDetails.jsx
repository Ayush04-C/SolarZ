import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="order-details-page">
      <div className="card order-success-banner" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', textAlign: 'center', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Order Confirmed!</h2>
        <p style={{ opacity: 0.9 }}>Thank you for your purchase.</p>
      </div>

      <div className="card od-card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
          Order <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>#{order._id}</span>
        </h3>
        <div style={{ display: 'grid', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> <span className={`badge ${order.status.toLowerCase()}`}>{order.status}</span></p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        </div>

        <h4 style={{fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)'}}>Items Purchased:</h4>
        <ul className="od-items" style={{ listStyle: 'none', padding: 0 }}>
          {order.items.map(item => (
            <li key={item._id} className="od-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
              <img 
                src={item.product?.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${item.product.images[0]}` : 'https://via.placeholder.com/100'} 
                alt={item.product?.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <div className="od-item-info" style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>{item.product?.name || 'Deleted Product'}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Qty: {item.quantity} x <span style={{ fontFamily: 'var(--font-mono)' }}>${item.priceAtPurchase.toFixed(2)}</span></p>
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>${(item.quantity * item.priceAtPurchase).toFixed(2)}</strong>
            </li>
          ))}
        </ul>

        <div className="od-total" style={{ textAlign: 'right', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '2px solid var(--color-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)' }}>Total Paid: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--color-primary)' }}>${order.totalAmount.toFixed(2)}</span></h3>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
