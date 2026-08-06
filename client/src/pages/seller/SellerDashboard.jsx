import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/seller/stats');
        setStats(data);
      } catch (err) {
        setError('Failed to load seller statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="seller-dashboard">
      <h2>Seller Dashboard</h2>
      
      <div className="dashboard-nav">
        <Link to="/seller/products" className="dashboard-link">Manage My Products</Link>
        <Link to="/seller/orders" className="dashboard-link">View Customer Orders</Link>
        <Link to="/seller/products/new" className="dashboard-link create-btn">+ Add New Product</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Active Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
