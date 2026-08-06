import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/api/admin/users');
        setUsers(data);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="loading-state">Loading users...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Manage Users</h2>
        <Link to="/admin/dashboard" className="back-link">&larr; Back to Dashboard</Link>
      </div>

      {users.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No users found.</p>
        </div>
      ) : (
        <div className="card table-responsive" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>ID</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Name</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Email</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Role</th>
                <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: '600' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: idx % 2 === 0 ? '#fff' : 'var(--color-bg)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{user._id.substring(0, 8)}...</td>
                  <td style={{ padding: 'var(--space-4)', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>{user.email}</td>
                  <td style={{ padding: 'var(--space-4)' }}><span className={`badge ${user.role}`}>{user.role}</span></td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
