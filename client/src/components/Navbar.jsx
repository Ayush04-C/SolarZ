import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GoogleTranslate from './GoogleTranslate';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/">Local Goods</Link>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle Navigation">
          ☰
        </button>

        <div className="navbar-links" style={{ display: isMenuOpen ? 'flex' : '' }}>
          <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Products</Link>
          {user ? (
            <>
              <Link to="/cart" className="nav-link" onClick={() => setIsMenuOpen(false)}>Cart</Link>
              <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>Orders</Link>
              {user.role === 'seller' && <Link to="/seller/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Seller Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
              <div className="logout-container">
                <span className={`badge ${user.role}`}>{user.role}</span>
                <button onClick={handleLogout} className="logout-btn">Logout ({user.name})</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
          <LanguageSwitcher />
          <GoogleTranslate />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
