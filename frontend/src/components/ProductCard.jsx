import { Link } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  function handleQuickAdd(e) {
    e.preventDefault();
    addItem(product, 1);
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__media">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        <span className="product-card__tag">{product.category}</span>
      </div>
      <div className="product-card__body">
        <div className="product-card__name">{product.name}</div>
        <div className="rating">
          <Star size={13} fill="currentColor" strokeWidth={0} />
          4.{(product.id * 3) % 9} <span>({20 + (product.id * 7) % 60})</span>
        </div>
        <div className="product-card__footer">
          <span className="price">
            <span className="price-currency">USD</span>{product.price.toFixed(0)}
          </span>
          <button className="quick-add" onClick={handleQuickAdd} title="Add to cart" type="button">
            <Plus size={17} />
          </button>
        </div>
      </div>
    </Link>
  );
}
