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
import SellerDashboard from './pages/seller/SellerDashboard';
import MyProducts from './pages/seller/MyProducts';
import ProductForm from './pages/seller/ProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import Inventory from './pages/seller/Inventory';
import InventoryOverview from './pages/admin/InventoryOverview';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import './index.css'; // Importing global CSS

// Removed Placeholder Pages

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="layout-container">
            <Toaster position="top-right" />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ProductList />} />
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
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<MyProducts />} />
                  <Route path="/seller/products/new" element={<ProductForm />} />
                  <Route path="/seller/products/edit/:id" element={<ProductForm />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/inventory" element={<Inventory />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route path="/admin/products" element={<ManageProducts />} />
                  <Route path="/admin/orders" element={<ManageOrders />} />
                  <Route path="/admin/inventory" element={<InventoryOverview />} />
                </Route>
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
