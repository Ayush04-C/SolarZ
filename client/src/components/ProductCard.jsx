import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.length > 0 
    ? `${import.meta.env.VITE_API_URL}${product.images[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img src={imageUrl} alt={product.name} className="product-card-img" />
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-meta">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="rating">★ {product.rating}</span>
        </div>
        <p className="location">
          📍 {product.location?.city || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
