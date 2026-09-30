import { useEffect, useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { api } from '../api/client';
import { CURRENT_CUSTOMER_ID } from '../constants';

export default function Profile() {
  const [customer, setCustomer] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCustomer(CURRENT_CUSTOMER_ID).then((data) => {
      setCustomer(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone || '');
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await api.updateCustomer(CURRENT_CUSTOMER_ID, { firstName, lastName, phone });
      setCustomer(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!customer) return <p>Loading…</p>;

  const initials = `${customer.firstName[0] ?? ''}${customer.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="account-page">
      <div className="section-heading">
        <h2>My Profile</h2>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '999px',
              background: 'var(--color-accent-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{customer.firstName} {customer.lastName}</div>
            <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>{customer.email}</div>
          </div>
        </div>

        <div className="form-field">
          <label><User size={14} style={{ verticalAlign: -2, marginRight: 6 }} />First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div className="form-field">
          <label><User size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div className="form-field">
          <label><Mail size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Email</label>
          <input value={customer.email} disabled />
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>
            Email can't be changed — it's how your account links to support records.
          </p>
        </div>

        <div className="form-field">
          <label><Phone size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1-555-000-0000" />
        </div>

        {error && <p style={{ color: 'var(--color-critical)' }}>{error}</p>}
        {saved && <p style={{ color: 'var(--color-success)' }}>Profile updated.</p>}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
