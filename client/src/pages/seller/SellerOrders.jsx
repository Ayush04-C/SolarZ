import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/seller/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch seller orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading-state">Loading orders...</div>;

  return (
    <div className="seller-orders-page">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>Orders Containing My Products</h2>
      
      {orders.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No one has purchased your products yet.</p>
        </div>
      ) : (
        <div className="seller-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {orders.map(order => (
            <div key={order._id} className="card seller-order-card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <div className="so-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <span title={order._id}>
                  <strong>Order</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>#{order._id.substring(0, 8)}...</span>
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <p><strong>Buyer:</strong> {order.buyer?.name} <span style={{ color: 'var(--color-text-muted)' }}>({order.buyer?.email})</span></p>
                <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
              </div>
              
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>Items Sold By You:</h4>
              <ul className="so-items" style={{ listStyle: 'none', padding: 0, margin: 0, backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {order.items.map(item => (
                  <li key={item._id} style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <span><strong style={{ color: 'var(--color-primary)' }}>{item.product?.name || 'Deleted Product'}</strong> (x{item.quantity})</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>${item.priceAtPurchase.toFixed(2)} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>each</span></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
