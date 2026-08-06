import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';
import './index.css'; // Importing global CSS

// Placeholder Pages
const Home = () => <div><h2>Welcome to Local Goods Marketplace</h2></div>;
const SellerDashboard = () => <div><h2>Seller Dashboard (Coming Soon)</h2></div>;
const AdminDashboard = () => <div><h2>Admin Dashboard (Coming Soon)</h2></div>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            
            {/* Protected Routes for Buyers/Any Authenticated User */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
            </Route>

            {/* Seller Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route path="/seller/*" element={<SellerDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
