import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, inventoryRes] = await Promise.all([
          api.get('/api/seller/stats'),
          api.get('/api/seller/inventory')
        ]);
        setStats(statsRes.data);
        setInventorySummary(inventoryRes.data.summary);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="seller-dashboard">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>Seller Dashboard</h2>
      
      <div className="dashboard-nav" style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <Link to="/seller/products" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-primary)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Manage My Products</Link>
        <Link to="/seller/inventory" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-accent)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Inventory</Link>
        <Link to="/seller/orders" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-secondary)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>View Customer Orders</Link>
        <Link to="/seller/products/new" className="card" style={{ textDecoration: 'none', color: '#fff', backgroundColor: 'var(--color-primary)', fontWeight: '600', padding: 'var(--space-4)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>+ Add New Product</Link>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Total Revenue</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Active Products</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text)' }}>{stats.totalProducts}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Total Orders</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text)' }}>{stats.totalOrders}</p>
        </div>
        {inventorySummary && (
          <>
            <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Low Stock Items</h3>
              <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>{inventorySummary.lowStock}</p>
            </div>
            <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Out of Stock</h3>
              <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-danger)' }}>{inventorySummary.outOfStock}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
