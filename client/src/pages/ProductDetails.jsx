import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data.product);
        setReviews(data.reviews);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    try {
      const success = await addToCart(id, 1);
      if (success) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add to cart.');
      }
    } catch (err) {
      alert('Failed to add to cart. You might need a Buyer account.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-details-page">
      <div className="pd-header" style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div className="card pd-gallery" style={{ flex: '1 1 400px', padding: 0, overflow: 'hidden' }}>
          {product.images?.length > 0 ? (
             product.images.map((img, i) => (
                <img key={i} src={`${import.meta.env.VITE_API_URL}${img}`} alt={`${product.name} ${i}`} className="pd-main-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
             ))
          ) : (
            <img src="https://via.placeholder.com/500x400?text=No+Image" alt="No image" className="pd-main-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
        <div className="card pd-info" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', padding: 'var(--space-6)' }}>
          <div>
            <h2 className="pd-title" style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>{product.name}</h2>
            <p className="pd-category" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '600' }}>{product.category?.name}</p>
          </div>
          
          <div className="pd-meta" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="price-tag pd-price" style={{ fontSize: '1.25rem', padding: 'var(--space-2) var(--space-3)' }}>${product.price.toFixed(2)}</span>
            <span className="rating pd-rating" style={{ color: 'var(--color-text-muted)' }}>⭐ {product.rating || 'No ratings'}</span>
          </div>
          
          <p className="pd-desc" style={{ lineHeight: '1.7', color: 'var(--color-text)' }}>{product.description}</p>
          
          <div className="pd-seller-info" style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: 'var(--color-text-muted)' }}>Seller:</strong> 
              <span>{product.seller?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: 'var(--color-text-muted)' }}>Location:</strong> 
              <span>{product.location?.city}, {product.location?.district}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: 'var(--color-text-muted)' }}>Stock:</strong> 
              <span style={{ color: product.stock > 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: '600' }}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          <button 
            className="btn-primary pd-add-btn" 
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="pd-reviews">
        <h3 className="pd-reviews-title">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <div className="review-list">
            {reviews.map(review => (
              <div key={review._id} className="card review-card">
                <div className="review-header">
                  <strong>{review.user?.name}</strong>
                  <span className="rating">⭐ {review.rating}</span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
