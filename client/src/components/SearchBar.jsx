import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SearchBar = ({ initialValue = '', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          const { data } = await api.get(`/api/products/search-suggestions?search=${searchTerm}`);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={wrapperRef}>
      <form className="modern-search-bar" onSubmit={handleSubmit}>
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          className="modern-search-input"
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim().length > 0) setShowSuggestions(true);
          }}
        />
      </form>

      {showSuggestions && (
        <div className="search-dropdown">
          <div className="dropdown-header">Search Suggestions</div>
          
          {loading ? (
            <div className="dropdown-loading">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="dropdown-empty">No results found.</div>
          ) : (
            <>
              <ul className="suggestions-list">
                {suggestions.map(item => (
                  <li 
                    key={item._id} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item._id)}
                  >
                    <div className="suggestion-left">
                      <img 
                        src={item.images?.length > 0 ? `${import.meta.env.VITE_API_URL}${item.images[0]}` : 'https://via.placeholder.com/40'} 
                        alt={item.name} 
                        className="suggestion-avatar" 
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-title">{item.name}</div>
                        <div className="suggestion-subtitle">
                          ${item.price.toFixed(2)} <span className="subtitle-divider">|</span> {item.category?.name}
                        </div>
                      </div>
                    </div>
                    <div className="suggestion-right">
                      <svg className="location-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{item.location?.city}, {item.location?.district}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="dropdown-footer">
                <button type="button" onClick={handleSubmit} className="view-all-btn">
                  View all results for "{searchTerm}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
