import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading-state">Loading...</div>;

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'seller';
      case 'delivered': return 'active';
      case 'cancelled': return 'admin';
      case 'shipped': return 'buyer';
      default: return 'inactive';
    }
  };

  return (
    <div className="orders-page">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>My Order History</h2>
      {orders.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="card order-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span className="order-id" title={order._id}>
                  Order <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>#{order._id.substring(0, 8)}...</span>
                </span>
                <span className="order-date" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ marginBottom: 'var(--space-2)' }}><strong>Total:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>${order.totalAmount.toFixed(2)}</span></p>
                <p style={{ marginBottom: 'var(--space-4)' }}><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></p>
                <Link to={`/orders/${order._id}`} className="btn-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
