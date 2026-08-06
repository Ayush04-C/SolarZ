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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-details-page">
      <div className="order-success-banner">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase.</p>
      </div>

      <div className="od-card">
        <h3>Order #{order._id}</h3>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>

        <h4 style={{marginTop: '2rem'}}>Items Purchased:</h4>
        <ul className="od-items">
          {order.items.map(item => (
            <li key={item._id} className="od-item">
              <img 
                src={item.product?.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${item.product.images[0]}` : 'https://via.placeholder.com/100'} 
                alt={item.product?.name} 
              />
              <div className="od-item-info">
                <p><strong>{item.product?.name || 'Deleted Product'}</strong></p>
                <p>Qty: {item.quantity} x ${item.priceAtPurchase.toFixed(2)}</p>
              </div>
              <strong>${(item.quantity * item.priceAtPurchase).toFixed(2)}</strong>
            </li>
          ))}
        </ul>

        <div className="od-total">
          <h3>Total Paid: ${order.totalAmount.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
