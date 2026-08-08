const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
      <button 
        className="btn-secondary"
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: 'var(--space-2) var(--space-4)' }}
      >
        Previous
      </button>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: '500', color: 'var(--color-text)' }}>
        Page {currentPage} of {totalPages}
      </span>
      <button 
        className="btn-secondary"
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: 'var(--space-2) var(--space-4)' }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
