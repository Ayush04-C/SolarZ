import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    city: '',
    district: ''
  });
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data);
        if (!isEdit && data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    
    fetchCategories();

    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/api/products/${id}`);
          const p = data.product;
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            category: p.category?._id || '',
            city: p.location?.city || '',
            district: p.location?.district || ''
          });
        } catch (err) {
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('city', formData.city);
    data.append('district', formData.district);
    
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      setLoading(false);
    }
  };

  if (loading && isEdit) return <div className="loading-state">Loading product data...</div>;

  return (
    <div className="card product-form-container" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-6)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        {isEdit ? 'Edit Product' : 'Create New Product'}
      </h2>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Product Name</label>
          <input type="text" className="input" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Description</label>
          <textarea className="input" name="description" value={formData.description} onChange={handleChange} required rows="4" style={{ resize: 'vertical' }}></textarea>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Price ($)</label>
            <input type="number" className="input" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Stock</label>
            <input type="number" className="input" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Category</label>
          <select className="input" name="category" value={formData.category} onChange={handleChange} required>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>City</label>
            <input type="text" className="input" name="city" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>District</label>
            <input type="text" className="input" name="district" value={formData.district} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Product Images (Max 5)</label>
          <input type="file" className="input" multiple accept="image/*" onChange={handleFileChange} style={{ padding: 'var(--space-2)' }} />
          {isEdit && <small style={{ display: 'block', marginTop: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Uploading new images will append them to the existing ones.</small>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 'var(--space-3)', fontSize: '1.1rem' }}>
          {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
