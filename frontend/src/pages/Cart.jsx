import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, total, DELIVERY_FEE } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="panel empty-state">
        <div className="empty-state__icon"><ShoppingCart size={24} /></div>
        <p style={{ marginBottom: 20 }}>Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="panel">
        <h1>Your Cart</h1>
        {items.map(({ product, quantity }) => (
          <div className="cart-line" key={product.id}>
            <div className="cart-line__media">
              <img src={product.imageUrl} alt={product.name} />
            </div>
            <div className="cart-line__body">
              <div>
                <div style={{ fontWeight: 700 }}>{product.name}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>{product.category}</div>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                <button className="remove-link" onClick={() => removeItem(product.id)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>USD {(product.price * quantity).toFixed(0)}</div>
          </div>
        ))}
      </div>

      <div className="summary-card">
        <h3>Order Summary</h3>
        <div className="summary-row"><span>Subtotal</span><span>USD {subtotal.toFixed(0)}</span></div>
        <div className="summary-row"><span>Delivery</span><span>USD {DELIVERY_FEE.toFixed(0)}</span></div>
        <div className="summary-row total"><span>Total</span><span>USD {total.toFixed(0)}</span></div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={() => navigate('/checkout')}>
          Checkout
        </button>

        <div className="trust-row"><Truck size={14} /> Delivered within 2–4 business days</div>
        <div className="trust-row"><ShieldCheck size={14} /> Secure checkout, easy returns</div>
      </div>
    </div>
  );
}
