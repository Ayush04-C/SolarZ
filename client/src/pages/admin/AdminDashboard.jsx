import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/products'),
          api.get('/api/admin/orders')
        ]);
        
        setStats({
          users: usersRes.data.length,
          products: productsRes.data.length,
          orders: ordersRes.data.length
        });
      } catch (err) {
        setError('Failed to load admin statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>Admin Dashboard</h2>
      
      <div className="dashboard-nav" style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <Link to="/admin/users" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-primary)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Manage Users</Link>
        <Link to="/admin/products" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-accent)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Manage Products</Link>
        <Link to="/admin/inventory" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-danger)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Inventory Overview</Link>
        <Link to="/admin/orders" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-text)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Manage Orders</Link>
        <Link to="/admin/analytics" className="card" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '600', padding: 'var(--space-4)', borderLeft: '4px solid var(--color-success, #10b981)', flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>Analytics</Link>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Users</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>{stats.users}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Products</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>{stats.products}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Orders</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>{stats.orders}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
