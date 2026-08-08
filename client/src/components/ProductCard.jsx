import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.length > 0 
    ? `${import.meta.env.VITE_API_URL}${product.images[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="card product-card">
      <Link to={`/products/${product._id}`} className="product-image-wrapper">
        <img src={imageUrl} alt={product.name} className="product-card-img" />
        <span className="price-tag product-price-badge">${product.price.toFixed(2)}</span>
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-meta">
          <span className="rating">⭐ {product.rating ? Number(product.rating).toFixed(1) : '0.0'}</span>
        </div>
        <p className="location">
          {product.location?.city || 'Unknown'}
        </p>
        
        <div style={{ marginTop: 'var(--space-3)' }}>
          {product.stock === 0 ? (
            <span className="badge badge-danger" style={{ fontSize: '0.75rem', padding: 'var(--space-1) var(--space-2)' }}>Out of Stock</span>
          ) : product.stock > 0 && product.stock <= (product.lowStockThreshold || 5) ? (
            <span style={{ fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: '600' }}>Only {product.stock} left in stock</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
