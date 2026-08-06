import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css'; // Importing global CSS

// Placeholder Pages
const Home = () => <div><h2>Welcome to Local Goods Marketplace</h2></div>;
const Products = () => <div><h2>Products Page (Coming Soon)</h2></div>;
const ProductDetail = () => <div><h2>Product Detail Page (Coming Soon)</h2></div>;
const Cart = () => <div><h2>Cart Page (Coming Soon)</h2></div>;
const Checkout = () => <div><h2>Checkout Page (Coming Soon)</h2></div>;
const SellerDashboard = () => <div><h2>Seller Dashboard (Coming Soon)</h2></div>;
const AdminDashboard = () => <div><h2>Admin Dashboard (Coming Soon)</h2></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Protected Routes for Buyers/Any Authenticated User */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
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
    </AuthProvider>
  );
}

export default App;
