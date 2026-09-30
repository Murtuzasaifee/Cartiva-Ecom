import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CheckCircle2, LifeBuoy } from 'lucide-react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { CURRENT_CUSTOMER_ID } from '../constants';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomerTickets(CURRENT_CUSTOMER_ID).then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading…</p>;

  const open = tickets.filter((t) => t.status !== 'RESOLVED').length;
  const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="account-page">
      <div className="section-heading">
        <h2>My Support</h2>
        <Link to="/orders" className="btn btn-secondary">Report a new issue</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__icon" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
            <Inbox size={20} />
          </span>
          <div>
            <div className="stat-value">{open}</div>
            <div className="stat-label">Open Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="stat-value">{resolved}</div>
            <div className="stat-label">Resolved Tickets</div>
          </div>
        </div>
      </div>

      <div className="panel">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><LifeBuoy size={24} /></div>
            <p>No support tickets yet.</p>
          </div>
        ) : (
          tickets.map((t) => (
            <div className="list-row" key={t.id}>
              <div>
                <div style={{ fontWeight: 700 }}>{t.ticketNumber}</div>
                <div className="list-row__meta">{t.subject}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {t.priority && <StatusBadge status={t.priority} />}
                <StatusBadge status={t.status} />
                <Link to={`/tickets/${t.id}`} className="btn btn-secondary">View</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
