import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const NotFound = () => (
  <section className="page">
    <h1>Page introuvable</h1>
    <p className="muted">Le lien que vous avez suivi n’existe pas.</p>
    <Link className="button" to="/">Retour au catalogue</Link>
  </section>
);

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/checkout"
                element={(
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders"
                element={(
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders/:id"
                element={(
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="site-footer">
            <p>Atelier e-commerce — React, Node.js, MongoDB et Stripe.</p>
          </footer>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
