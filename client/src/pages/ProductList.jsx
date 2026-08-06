import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({ categories: [], cities: [], minAvailablePrice: 0, maxAvailablePrice: 0 });
  const [allCategories, setAllCategories] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setAllCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/products?${searchParams.toString()}`);
      setProducts(data.products);
      setAvailableFilters(data.availableFilters);
      setPageData({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (term) => {
    if (term) searchParams.set('search', term);
    else searchParams.delete('search');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      const newParams = new URLSearchParams();
      if (searchParams.get('search')) newParams.set('search', searchParams.get('search'));
      setSearchParams(newParams);
      return;
    }

    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage);
    setSearchParams(searchParams);
  };

  const currentFilters = {
    category: searchParams.get('category'),
    city: searchParams.get('city'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
  };

  return (
    <div className="product-list-page">
      <div className="pl-header">
        <h2>Our Products</h2>
        <SearchBar initialValue={searchParams.get('search') || ''} onSearch={handleSearch} />
      </div>

      <div className="pl-layout">
        <FilterSidebar 
          availableFilters={availableFilters}
          currentFilters={currentFilters}
          onFilterChange={handleFilterChange}
          allCategories={allCategories}
        />

        <div className="pl-main">
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {pageData.pages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={pageData.page === 1} 
                    onClick={() => handlePageChange(pageData.page - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {pageData.page} of {pageData.pages}</span>
                  <button 
                    disabled={pageData.page === pageData.pages} 
                    onClick={() => handlePageChange(pageData.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
