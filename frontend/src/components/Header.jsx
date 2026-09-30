import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ShoppingCart, Package, LifeBuoy, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../constants';
import Logo from './Logo';

const SHOPPING_ROUTES = ['/', '/products'];

export default function Header() {
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const showCategoryNav = SHOPPING_ROUTES.some(
    (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  );

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/products${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <header className="site-header">
      <div className="site-header__top">
        <Link to="/" className="brand">
          <span className="brand__mark"><Logo size={34} /></span>
          <span className="brand__text">
            Cartiva
            <span className="brand__tagline">Shop. Discover. Delivered.</span>
          </span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <Search size={16} className="search-form__icon" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <NavLink to="/orders" className="header-actions__link">
            <Package size={17} /> Orders
          </NavLink>
          <NavLink to="/support" className="header-actions__link">
            <LifeBuoy size={17} /> Support
          </NavLink>
          <Link to="/profile" className="icon-btn" title="My Profile">
            <User size={19} />
          </Link>
          <Link to="/cart" className="icon-btn" title="Cart">
            <ShoppingCart size={19} />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
        </div>
      </div>
      {showCategoryNav && (
        <nav className="category-nav">
          <NavLink to="/" end>Home</NavLink>
          {CATEGORIES.map((c) => (
            <NavLink key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`}>
              {c.name}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
