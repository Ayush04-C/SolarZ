import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Local Goods</Link>
      </div>
      <div className="navbar-links">
        <Link to="/products">Products</Link>
        {user ? (
          <>
            <Link to="/cart">Cart</Link>
            {user.role === 'seller' && <Link to="/seller/dashboard">Seller Dashboard</Link>}
            {user.role === 'admin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
            <button onClick={handleLogout} className="logout-btn">Logout ({user.name})</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
