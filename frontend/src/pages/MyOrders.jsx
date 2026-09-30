import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { CURRENT_CUSTOMER_ID } from '../constants';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomerOrders(CURRENT_CUSTOMER_ID).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="account-page">
      <div className="section-heading">
        <h2>My Orders</h2>
        <span className="list-row__meta">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
      </div>

      {orders.length === 0 ? (
        <div className="panel empty-state">
          <div className="empty-state__icon"><Package size={24} /></div>
          <p style={{ marginBottom: 20 }}>No orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <Link to={`/orders/${order.id}`} className="order-card" key={order.id}>
            <div className="order-card__thumbs">
              {order.items.slice(0, 3).map((item) => (
                <img key={item.productId} src={item.productImageUrl} alt={item.productName} />
              ))}
            </div>
            <div className="order-card__body">
              <div className="order-card__title">Order {order.orderNumber}</div>
              <div className="order-card__meta">
                <span>{new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>USD {order.totalAmount.toFixed(0)}</span>
                <span>·</span>
                <span>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </Link>
        ))
      )}
    </div>
  );
}
