import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80&auto=format&fit=crop';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data.slice(0, 8));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero__content">
          <span className="hero__eyebrow">Shop. Discover. Delivered.</span>
          <h1>Everything you need.<br />Simple. Fast. Easy.</h1>
          <p>From everyday gear to weekend upgrades — shop the Cartiva collection
            and get real support the moment something goes wrong.</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="section-heading">
        <h2 style={{ fontSize: 20 }}>Shop by category</h2>
      </div>
      <div className="category-strip">
        {CATEGORIES.map(({ name, icon: Icon, tint, tintText }) => (
          <Link key={name} to={`/products?category=${encodeURIComponent(name)}`} className="category-tile">
            <span className="category-tile__icon" style={{ background: tint, color: tintText }}><Icon size={20} /></span>
            <span>{name}</span>
          </Link>
        ))}
      </div>

      <div className="section-heading">
        <h2>Featured Products</h2>
        <Link to="/products">View all</Link>
      </div>
      {loading ? (
        <p>Loading products…</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
