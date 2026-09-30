import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, MessageSquareWarning } from 'lucide-react';
import { api } from '../api/client';
import { CURRENT_CUSTOMER_ID, ISSUE_TYPES } from '../constants';

export default function CreateTicket() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [issueType, setIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) api.getOrder(orderId).then(setOrder);
  }, [orderId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await api.createTicket({
        customerId: CURRENT_CUSTOMER_ID,
        orderId: Number(orderId),
        issueType,
        subject,
        description,
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" style={{ maxWidth: 560, margin: '0 auto' }} onSubmit={handleSubmit}>
      <div className="empty-state__icon" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)', margin: '0 0 16px' }}>
        <MessageSquareWarning size={22} />
      </div>
      <h1>Report an Issue</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: -8 }}>
        Order: <strong>#{order ? order.orderNumber : orderId}</strong>
      </p>

      <div className="form-field">
        <label>Issue Type</label>
        <select value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
          <option value="" disabled>Select an issue</option>
          {ISSUE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. My order has not arrived" required />
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us what happened — the more detail, the faster we can help." required />
      </div>

      {error && (
        <p style={{ color: 'var(--color-critical)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Ticket'}
      </button>
    </form>
  );
}
