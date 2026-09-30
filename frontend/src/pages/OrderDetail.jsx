import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MessageCircleQuestion, RotateCcw } from 'lucide-react';
import { api } from '../api/client';
import OrderTimeline from '../components/OrderTimeline';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [searchParams] = useSearchParams();
  const confirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    api.getOrder(id).then(setOrder);
  }, [id]);

  if (!order) return <p>Loading…</p>;

  return (
    <div className="account-page">
      {confirmed && (
        <div className="panel" style={{ textAlign: 'center', background: 'var(--color-success-soft)', border: '1px solid var(--color-success)' }}>
          <div className="empty-state__icon" style={{ background: 'white', color: 'var(--color-success)', margin: '0 auto 12px' }}>
            <CheckCircle2 size={26} />
          </div>
          <h1 style={{ marginBottom: 6 }}>Order Confirmed</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Thank you for your order!</p>
          <p style={{ fontWeight: 700, marginBottom: 20 }}>
            Estimated Delivery: {new Date(Date.now() + 5 * 86400000).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      )}

      <div className="panel">
        <div className="section-heading">
          <h2>Order {order.orderNumber}</h2>
          <StatusBadge status={order.status} />
        </div>

        {order.items.map((item) => (
          <div className="list-row" key={item.productId}>
            <span>{item.productName} × {item.quantity}</span>
            <span style={{ fontWeight: 700 }}>USD {(item.unitPrice * item.quantity).toFixed(0)}</span>
          </div>
        ))}

        <h3 style={{ marginTop: 28 }}>Order Status</h3>
        <OrderTimeline status={order.status} />

        <hr className="divider" />

        <h3>Need help with this order?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to={`/tickets/new?orderId=${order.id}`} className="btn btn-primary">
            <MessageCircleQuestion size={16} /> Report an Issue
          </Link>
          <Link to={`/tickets/new?orderId=${order.id}`} className="btn btn-secondary">
            <RotateCcw size={16} /> Request Return
          </Link>
        </div>
      </div>
    </div>
  );
}
