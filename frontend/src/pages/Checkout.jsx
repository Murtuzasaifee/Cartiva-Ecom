import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { CURRENT_CUSTOMER_ID } from '../constants';

export default function Checkout() {
  const { items, subtotal, total, DELIVERY_FEE, clearCart } = useCart();
  const [address, setAddress] = useState('123 Example Street, Dubai, UAE');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  async function handlePlaceOrder() {
    setPlacing(true);
    setError(null);
    try {
      const order = await api.createOrder({
        customerId: CURRENT_CUSTOMER_ID,
        shippingAddress: address,
        paymentMethod,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      clearCart();
      navigate(`/orders/${order.id}?confirmed=true`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="cart-layout">
      <div className="panel">
        <div className="checkout-steps">
          <div className="checkout-step done"><span className="checkout-step__dot"><Check size={12} /></span> Cart</div>
          <div className="checkout-step__line" />
          <div className="checkout-step active"><span className="checkout-step__dot">2</span> Checkout</div>
          <div className="checkout-step__line" />
          <div className="checkout-step"><span className="checkout-step__dot">3</span> Confirmation</div>
        </div>

        <h1>Checkout</h1>

        <div className="form-field">
          <label><Truck size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Delivery Address</label>
          <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="form-field">
          <label><CreditCard size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Payment</label>
          <label className="radio-row">
            <input type="radio" checked={paymentMethod === 'Credit Card'} onChange={() => setPaymentMethod('Credit Card')} />
            Credit Card
          </label>
          <label className="radio-row">
            <input type="radio" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} />
            Cash on Delivery
          </label>
          <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>Payment is mocked for this POC — no real charge occurs.</p>
        </div>

        {error && <p style={{ color: 'var(--color-critical)' }}>{error}</p>}

        <button className="btn btn-primary btn-block" disabled={placing} onClick={handlePlaceOrder}>
          {placing ? 'Placing Order…' : `Place Order — USD ${total.toFixed(0)}`}
        </button>
      </div>

      <div className="summary-card">
        <h3>Order Summary</h3>
        {items.map(({ product, quantity }) => (
          <div className="summary-row" key={product.id}>
            <span>{product.name} × {quantity}</span>
            <span>USD {(product.price * quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="summary-row"><span>Subtotal</span><span>USD {subtotal.toFixed(0)}</span></div>
        <div className="summary-row"><span>Delivery</span><span>USD {DELIVERY_FEE.toFixed(0)}</span></div>
        <div className="summary-row total"><span>Total</span><span>USD {total.toFixed(0)}</span></div>
      </div>
    </div>
  );
}
