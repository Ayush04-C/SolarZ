import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/admin/orders');
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading-state">Loading orders...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Manage Orders</h2>
        <Link to="/admin/dashboard" className="back-link">&larr; Back to Dashboard</Link>
      </div>

      {orders.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="card table-responsive" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Order ID</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Date</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Buyer</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Total</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: idx % 2 === 0 ? '#fff' : 'var(--color-bg)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{order._id.substring(0, 8)}...</td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: 'var(--space-4)', fontWeight: '500' }}>{order.buyer?.name || order.buyer?.email || 'Unknown'}</td>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>${order.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`badge ${order.status.toLowerCase() === 'pending' ? 'seller' : (order.status.toLowerCase() === 'delivered' ? 'active' : 'admin')}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
