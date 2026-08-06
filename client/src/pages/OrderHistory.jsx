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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="orders-page">
      <h2>My Order History</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order._id}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-body">
                <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <Link to={`/orders/${order._id}`} className="view-order-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
