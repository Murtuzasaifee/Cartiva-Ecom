import { Link, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Logo from './components/Logo';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import SupportDashboard from './pages/SupportDashboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <>
      <Header />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <div className="brand" style={{ color: 'white' }}>
              <span className="brand__mark"><Logo size={30} /></span>
              <span className="brand__text" style={{ color: 'white' }}>
                Cartiva
                <span className="brand__tagline" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Shop. Discover. Delivered.
                </span>
              </span>
            </div>
          </div>
          <div className="site-footer__col">
            <h4>Shop</h4>
            <Link to="/">Home</Link>
            <Link to="/products">All Products</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="site-footer__col">
            <h4>Account</h4>
            <Link to="/orders">My Orders</Link>
            <Link to="/support">Support</Link>
            <Link to="/profile">My Profile</Link>
          </div>
        </div>
        <div className="site-footer__bottom">
          © {new Date().getFullYear()} Cartiva. All rights reserved.
        </div>
      </footer>
    </>
  );
}
