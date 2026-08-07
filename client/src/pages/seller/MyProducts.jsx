import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      const { data } = await api.get('/api/products/mine');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch seller products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? (It will be hidden from the store)')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchMyProducts();
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  if (loading) return <div className="loading-state">Loading your products...</div>;

  return (
    <div className="my-products-page">
      <div className="my-products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>My Inventory</h2>
        <Link to="/seller/products/new" className="btn-primary" style={{ textDecoration: 'none' }}>+ Create Product</Link>
      </div>

      {products.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>You haven't listed any active products yet.</p>
        </div>
      ) : (
        <div className="seller-product-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {products.map(product => (
            <div key={product._id} className="card seller-product-row" style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap', padding: 'var(--space-4)' }}>
              <img 
                src={product.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${product.images[0]}` : 'https://via.placeholder.com/80'} 
                alt={product.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <div className="sp-info" style={{ flex: '1 1 200px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 'var(--space-1)' }}>{product.name}</h4>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  Price: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>${product.price.toFixed(2)}</span> 
                  <span style={{ margin: '0 var(--space-2)' }}>|</span> 
                  Stock: <span style={{ fontWeight: '600', color: product.stock > 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>{product.stock}</span>
                </p>
                <p style={{ fontSize: '0.875rem' }}>Category: <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{product.category?.name}</span></p>
              </div>
              <div className="sp-actions" style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link to={`/seller/products/edit/${product._id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>Edit</Link>
                <button onClick={() => handleDelete(product._id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
