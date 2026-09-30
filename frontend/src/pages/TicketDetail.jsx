import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Search, Loader2, CheckCircle2, ClipboardList } from 'lucide-react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Send },
  { key: 'TRIAGED', label: 'Triaged', icon: Search },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Loader2 },
  { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
];

function stepIndex(status) {
  if (status === 'SYNC_PENDING') return -1;
  if (status === 'ASSIGNED' || status === 'WAITING_FOR_CUSTOMER') return STEPS.findIndex((s) => s.key === 'IN_PROGRESS');
  return STEPS.findIndex((s) => s.key === status);
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      api.getTicket(id).then((data) => {
        if (!cancelled) setTicket(data);
      });
    }
    load();
    const interval = setInterval(load, 10000); // backend syncs ticket status roughly every 10s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  if (!ticket) return <p>Loading…</p>;

  const currentIndex = stepIndex(ticket.status);
  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className="account-page panel">
      <div className="section-heading">
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ticket
          </span>
          <h1 style={{ marginTop: 2 }}>#{ticket.ticketNumber}</h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <p style={{ color: 'var(--color-muted)' }}>Order #{ticket.orderId} · {ticket.issueType}</p>
      <h3 style={{ marginTop: 20 }}>{ticket.subject}</h3>
      <p style={{ color: 'var(--color-muted)' }}>{ticket.description}</p>

      <hr className="divider" />

      <h3>Status</h3>
      <div className="timeline">
        {STEPS.map(({ key, label, icon: Icon }, i) => {
          const state = i < currentIndex || (isResolved && i === currentIndex) ? 'done' : i === currentIndex ? 'current' : '';
          return (
            <div key={key} className={`timeline__step ${state}`}>
              <span className="timeline__connector" />
              <span className="timeline__icon"><Icon size={17} /></span>
              <span className="timeline__label">{label}</span>
            </div>
          );
        })}
      </div>
      {ticket.status === 'SYNC_PENDING' && (
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Sending to support system…</p>
      )}

      {(ticket.category || ticket.priority) && (
        <div style={{ display: 'flex', gap: 24, margin: '20px 0' }}>
          {ticket.category && (
            <div>
              <div className="stat-label">Category</div>
              <div style={{ fontWeight: 700 }}>{ticket.category}</div>
            </div>
          )}
          {ticket.priority && (
            <div>
              <div className="stat-label">Priority</div>
              <StatusBadge status={ticket.priority} />
            </div>
          )}
        </div>
      )}

      {ticket.resolution && (
        <div className="resolution-box" style={{ marginTop: 20 }}>
          <ClipboardList size={20} className="resolution-box__icon" />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Resolution</div>
            <div>{ticket.resolution}</div>
          </div>
        </div>
      )}
    </div>
  );
}
