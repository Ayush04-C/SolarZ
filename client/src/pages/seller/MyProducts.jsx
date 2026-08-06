import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  if (loading) return <div className="loading-state">Loading your products...</div>;

  return (
    <div className="my-products-page">
      <div className="my-products-header">
        <h2>My Inventory</h2>
        <Link to="/seller/products/new" className="add-to-cart-btn" style={{width: 'auto', textDecoration: 'none'}}>+ Create Product</Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">You haven't listed any active products yet.</div>
      ) : (
        <div className="seller-product-list">
          {products.map(product => (
            <div key={product._id} className="seller-product-row">
              <img 
                src={product.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${product.images[0]}` : 'https://via.placeholder.com/80'} 
                alt={product.name} 
              />
              <div className="sp-info">
                <h4>{product.name}</h4>
                <p>Price: ${product.price.toFixed(2)} | Stock: {product.stock}</p>
                <p>Category: {product.category?.name}</p>
              </div>
              <div className="sp-actions">
                <Link to={`/seller/products/edit/${product._id}`} className="edit-btn">Edit</Link>
                <button onClick={() => handleDelete(product._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
