import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // { type: 'restock' | 'adjust' | 'history', product: null }
  const [stockInput, setStockInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  
  // History state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInventory(filter);
  }, [filter]);

  const fetchInventory = async (statusFilter) => {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/seller/inventory?status=${statusFilter}` : '/api/seller/inventory';
      const { data } = await api.get(url);
      setInventory(data.products || []);
    } catch (err) {
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!stockInput) return toast.error('Please enter a quantity.');
    const num = Number(stockInput);
    if (activeModal.type === 'restock' && num <= 0) return toast.error('Restock quantity must be positive.');

    try {
      await api.put(`/api/seller/inventory/${activeModal.product._id}/stock`, {
        quantityChange: num,
        type: activeModal.type,
        note: noteInput
      });
      toast.success('Stock updated successfully!');
      setActiveModal(null);
      setStockInput('');
      setNoteInput('');
      fetchInventory(filter); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const fetchHistory = async (productId) => {
    try {
      setHistoryLoading(true);
      const { data } = await api.get(`/api/seller/inventory/${productId}/history`);
      setHistoryLogs(data.logs || []);
    } catch (err) {
      toast.error('Failed to load history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = (product) => {
    setActiveModal({ type: 'history', product });
    fetchHistory(product._id);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'out_of_stock') return 'badge-danger';
    if (status === 'low_stock') return 'badge-accent';
    return 'badge-success'; // in_stock
  };

  const formatStatus = (status) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="inventory-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Inventory Management</h2>
        <select 
          className="input" 
          style={{ width: 'auto' }} 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="in_stock">In Stock</option>
        </select>
      </div>

      {loading ? (
        <div>Loading inventory...</div>
      ) : inventory.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>No products found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-surface-hover)' }}>
                <th style={{ padding: 'var(--space-4)' }}>Product</th>
                <th style={{ padding: 'var(--space-4)' }}>Stock Status</th>
                <th style={{ padding: 'var(--space-4)' }}>Quantity</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ fontWeight: '600' }}>{item.name}</span>
                    <br/>
                    <small style={{ color: 'var(--color-text-muted)' }}>Threshold: {item.lowStockThreshold}</small>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className={`badge ${getStatusBadgeClass(item.stockStatus)}`}>
                      {formatStatus(item.stockStatus)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => setActiveModal({ type: 'restock', product: item })}
                      >
                        Restock
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => setActiveModal({ type: 'adjust', product: item })}
                      >
                        Adjust
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--color-border)' }}
                        onClick={() => openHistory(item)}
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay */}
      {activeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {activeModal.type === 'history' ? (
              <>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Stock History: {activeModal.product.name}</h3>
                {historyLoading ? (
                  <p>Loading history...</p>
                ) : historyLogs.length === 0 ? (
                  <p>No stock history found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {historyLogs.map(log => (
                      <div key={log._id} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span className={`badge ${log.type === 'sale' ? 'badge-primary' : log.type === 'restock' ? 'badge-success' : 'badge-accent'}`}>
                            {log.type.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                          Changed by: <strong>{log.quantityChange > 0 ? '+' : ''}{log.quantityChange}</strong> 
                          <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>({log.previousStock} → {log.newStock})</span>
                        </p>
                        {log.note && <small style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Note: {log.note}</small>}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
                  <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleStockUpdate}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>
                  {activeModal.type === 'restock' ? 'Restock' : 'Adjust Inventory'} - {activeModal.product.name}
                </h3>
                <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                  Current Stock: <strong>{activeModal.product.stock}</strong>
                </p>
                
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    {activeModal.type === 'restock' ? 'Quantity to Add' : 'Quantity Change (+ or -)'}
                  </label>
                  <input 
                    type="number" 
                    className="input" 
                    value={stockInput} 
                    onChange={e => setStockInput(e.target.value)} 
                    placeholder={activeModal.type === 'restock' ? 'e.g. 50' : 'e.g. -5'}
                    required 
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Note (Optional)</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={noteInput} 
                    onChange={e => setNoteInput(e.target.value)} 
                    placeholder={activeModal.type === 'restock' ? 'e.g. Weekly delivery' : 'e.g. Damaged item'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setActiveModal(null); setStockInput(''); setNoteInput(''); }}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
