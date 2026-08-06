import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
    } catch (err) {
      alert('Failed to update product status');
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
        <div className="empty-state">No products found on the platform.</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID / Image</th>
                <th>Name</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className={!product.isActive ? 'inactive-row' : ''}>
                  <td>
                    {product.images?.length > 0 ? (
                      <img src={`${import.meta.env.VITE_API_URL}${product.images[0]}`} alt={product.name} className="table-img" />
                    ) : (
                      <span>{product._id.substring(0, 8)}...</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.seller?.name || 'Unknown'}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn-small ${product.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleActive(product._id)}
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
