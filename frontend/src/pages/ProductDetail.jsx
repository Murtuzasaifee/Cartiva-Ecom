import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Star, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setAdded(false);
    setQuantity(1);
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <p>Loading…</p>;

  function handleAddToCart() {
    addItem(product, quantity);
    setAdded(true);
  }

  const inStock = product.inventory > 0;

  return (
    <div className="product-detail">
      <div className="product-detail__media">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div>
        <span className="product-detail__category">{product.category}</span>
        <h1>{product.name}</h1>
        <div className="rating" style={{ marginBottom: 4 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
          ))}
          <span>128 reviews</span>
        </div>
        <div className="product-detail__price">USD {product.price.toFixed(0)}</div>
        <span className={`badge ${inStock ? 'badge-success' : 'badge-critical'}`}>
          <CheckCircle2 size={13} /> {inStock ? `In stock — ${product.inventory} available` : 'Out of stock'}
        </span>

        <hr className="divider" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className="stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={13} /></button>
            <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}><Plus size={13} /></button>
          </div>
          <button className="btn btn-primary" onClick={handleAddToCart} disabled={!inStock}>
            Add to Cart
          </button>
          {added && (
            <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
              Go to Cart
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 20, color: 'var(--color-muted)', fontSize: 13, marginBottom: 24 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Truck size={15} /> Free delivery over USD 300</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={15} /> Easy 14-day returns</span>
        </div>

        <hr className="divider" />

        <h3>Product Details</h3>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>{product.description}</p>
      </div>
    </div>
  );
}
