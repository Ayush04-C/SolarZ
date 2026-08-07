import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/admin/products');
      setProducts(data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      await api.put(`/api/admin/products/${productId}/moderate`);
      // Update local state to reflect change
      setProducts(products.map(p => {
        if (p._id === productId) {
          return { ...p, isActive: !p.isActive };
        }
        return p;
      }));
      toast.success('Product status updated');
    } catch (err) {
      toast.error('Failed to update product status');
    }
  };

  if (loading) return <div className="loading-state">Loading products...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Manage Products</h2>
        <Link to="/admin/dashboard" className="back-link">&larr; Back to Dashboard</Link>
      </div>

      {products.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No products found on the platform.</p>
        </div>
      ) : (
        <div className="card table-responsive" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>ID / Image</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Name</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Seller</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Price</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Status</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: !product.isActive ? 'var(--color-bg)' : (idx % 2 === 0 ? '#fff' : 'var(--color-bg)'), opacity: !product.isActive ? 0.7 : 1, transition: 'background-color 0.2s' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    {product.images?.length > 0 ? (
                      <img src={`${import.meta.env.VITE_API_URL}${product.images[0]}`} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{product._id.substring(0, 8)}...</span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>{product.seller?.name || 'Unknown'}</td>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`badge ${product.isActive ? 'active' : 'admin'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <button 
                      className={product.isActive ? 'btn-danger' : 'btn-primary'}
                      onClick={() => handleToggleActive(product._id)}
                      style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem' }}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default ManageProducts;
