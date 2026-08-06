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
      <h2>Orders Containing My Products</h2>
      
      {orders.length === 0 ? (
        <p>No one has purchased your products yet.</p>
      ) : (
        <div className="seller-orders-list">
          {orders.map(order => (
            <div key={order._id} className="seller-order-card">
              <div className="so-header">
                <strong>Order #{order._id}</strong>
                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <p><strong>Buyer:</strong> {order.buyer?.name} ({order.buyer?.email})</p>
              <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
              
              <h4>Items Sold By You:</h4>
              <ul className="so-items">
                {order.items.map(item => (
                  <li key={item._id}>
                    {item.product?.name || 'Deleted Product'} (x{item.quantity}) - ${item.priceAtPurchase.toFixed(2)} each
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
