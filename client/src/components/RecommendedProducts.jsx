import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const RecommendedProducts = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [generatedBy, setGeneratedBy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!productId) return;
    
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get(`/api/products/${productId}/recommendations`);
        if (isMounted) {
          setRecommendations(data.recommendations || []);
          setGeneratedBy(data.generatedBy);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    
    setLoading(true);
    fetchRecommendations();
    
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (error || (!loading && recommendations.length === 0)) {
    return null; // Fail silently, render nothing
  }

  return (
    <div className="recommended-products-section" style={{ marginTop: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          You Might Also Like
        </h3>
        {/* {generatedBy === 'ai' && (
          <span style={{ 
            fontSize: '0.75rem', 
            backgroundColor: 'rgba(52, 152, 219, 0.1)', 
            color: '#3498db', 
            padding: '4px 8px', 
            borderRadius: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            AI Suggested
          </span>
        )} */}
      </div>

      {loading ? (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card product-card" style={{ height: '320px', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--color-bg)' }}></div>
          ))}
        </div>
      ) : (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {recommendations.map((product) => (
            <Link to={`/products/${product.productId}`} key={product.productId} className="card product-card" style={{ textDecoration: 'none' }}>
              <div className="product-image-wrapper">
                {product.image ? (
                  <img src={`${import.meta.env.VITE_API_URL}${product.image}`} alt={product.name} className="product-card-img" />
                ) : (
                  <img src="https://via.placeholder.com/300x200?text=No+Image" alt="No image" className="product-card-img" />
                )}
                <div className="product-price-badge">
                  <span className="price-tag">${product.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="product-card-body">
                <div className="product-title">
                  <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: 'var(--space-1)' }}>{product.name}</h3>
                </div>
                {product.reason && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4', marginTop: 'var(--space-2)' }}>
                    {product.reason}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;
