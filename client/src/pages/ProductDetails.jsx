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
      <div className="pd-header">
        <div className="pd-gallery">
          {product.images?.length > 0 ? (
             product.images.map((img, i) => (
                <img key={i} src={`${import.meta.env.VITE_API_URL}${img}`} alt={`${product.name} ${i}`} className="pd-main-img" />
             ))
          ) : (
            <img src="https://via.placeholder.com/500x400?text=No+Image" alt="No image" className="pd-main-img" />
          )}
        </div>
        <div className="pd-info">
          <h2>{product.name}</h2>
          <p className="pd-category">{product.category?.name}</p>
          <div className="pd-meta">
            <span className="pd-price">${product.price.toFixed(2)}</span>
            <span className="pd-rating">★ {product.rating || 'No ratings'}</span>
          </div>
          <p className="pd-desc">{product.description}</p>
          <div className="pd-seller-info">
            <p><strong>Seller:</strong> {product.seller?.name}</p>
            <p><strong>Location:</strong> {product.location?.city}, {product.location?.district}</p>
            <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
          </div>
          
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="pd-reviews">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="review-list">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong>{review.user?.name}</strong>
                  <span>★ {review.rating}</span>
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
