import { useState } from 'react';

const SearchBar = ({ initialValue = '', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input 
        className="input search-input"
        type="text" 
        placeholder="Search products..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="btn-primary search-btn">Search</button>
    </form>
  );
};

export default SearchBar;
