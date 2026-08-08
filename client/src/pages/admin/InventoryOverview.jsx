import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const InventoryOverview = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchInventory(filter);
  }, [filter]);

  const fetchInventory = async (statusFilter) => {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/admin/inventory?status=${statusFilter}` : '/api/admin/inventory';
      const { data } = await api.get(url);
      setInventory(data.products || []);
      setSummary(data.summary);
    } catch (err) {
      toast.error('Failed to load global inventory.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'out_of_stock') return 'badge-danger';
    if (status === 'low_stock') return 'badge-accent';
    return 'badge-success'; // in_stock
  };

  const formatStatus = (status) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="inventory-overview-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Global Inventory Overview</h2>
        <select 
          className="input" 
          style={{ width: 'auto' }} 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="in_stock">In Stock</option>
        </select>
      </div>

      {summary && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Products</h3>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>{summary.totalProducts}</p>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>In Stock</h3>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-success, #10b981)' }}>{summary.inStock}</p>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Low Stock</h3>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>{summary.lowStock}</p>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Out of Stock</h3>
            <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-danger)' }}>{summary.outOfStock}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading inventory...</div>
      ) : inventory.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>No products found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-surface-hover)' }}>
                <th style={{ padding: 'var(--space-4)' }}>Product</th>
                <th style={{ padding: 'var(--space-4)' }}>Seller</th>
                <th style={{ padding: 'var(--space-4)' }}>Stock Status</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ fontWeight: '600' }}>{item.name}</span>
                    <br/>
                    <small style={{ color: 'var(--color-text-muted)' }}>Threshold: {item.lowStockThreshold}</small>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>{item.seller?.name || 'Unknown'}</td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`badge ${getStatusBadgeClass(item.stockStatus)}`}>
                      {formatStatus(item.stockStatus)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {item.stock}
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

export default InventoryOverview;
