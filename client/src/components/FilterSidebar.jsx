const FilterSidebar = ({ availableFilters, currentFilters, onFilterChange, allCategories }) => {
  
  const handleCategoryChange = (e) => {
    onFilterChange('category', e.target.value);
  };

  const handleCityChange = (e) => {
    onFilterChange('city', e.target.value);
  };

  const handlePriceChange = (e, type) => {
    onFilterChange(type, e.target.value);
  };

  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label>Category</label>
        <select value={currentFilters.category || ''} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {availableFilters.categories?.map(catId => {
            const cat = allCategories.find(c => c._id === catId);
            return (
              <option key={catId} value={catId}>
                {cat ? cat.name : 'Unknown Category'}
              </option>
            );
          })}
        </select>
      </div>

      <div className="filter-group">
        <label>City</label>
        <select value={currentFilters.city || ''} onChange={handleCityChange}>
          <option value="">All Cities</option>
          {availableFilters.cities?.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Min Price ($)</label>
        <input 
          type="number" 
          value={currentFilters.minPrice || ''} 
          onChange={(e) => handlePriceChange(e, 'minPrice')}
          placeholder={availableFilters.minAvailablePrice?.toString() || '0'}
        />
      </div>

      <div className="filter-group">
        <label>Max Price ($)</label>
        <input 
          type="number" 
          value={currentFilters.maxPrice || ''} 
          onChange={(e) => handlePriceChange(e, 'maxPrice')}
          placeholder={availableFilters.maxAvailablePrice?.toString() || 'Any'}
        />
      </div>

      <button className="clear-filters-btn" onClick={() => onFilterChange('clear', null)}>
        Clear Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;
