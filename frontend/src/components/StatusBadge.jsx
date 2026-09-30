import { Clock, Send, Search, UserCheck, Loader2, MessageCircle, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

const CONFIG = {
  // Order statuses
  PLACED: { variant: 'info', icon: Clock, label: 'Placed' },
  PACKED: { variant: 'info', icon: Send, label: 'Packed' },
  SHIPPED: { variant: 'info', icon: Send, label: 'Shipped' },
  IN_TRANSIT: { variant: 'warning', icon: Loader2, label: 'In Transit' },
  DELIVERED: { variant: 'success', icon: CheckCircle2, label: 'Delivered' },
  // Ticket statuses
  SYNC_PENDING: { variant: 'neutral', icon: Clock, label: 'Sending…' },
  SUBMITTED: { variant: 'info', icon: Send, label: 'Submitted' },
  TRIAGED: { variant: 'info', icon: Search, label: 'Triaged' },
  ASSIGNED: { variant: 'warning', icon: UserCheck, label: 'Assigned' },
  IN_PROGRESS: { variant: 'warning', icon: Loader2, label: 'In Progress' },
  WAITING_FOR_CUSTOMER: { variant: 'warning', icon: MessageCircle, label: 'Waiting for You' },
  RESOLVED: { variant: 'success', icon: CheckCircle2, label: 'Resolved' },
  // Priority
  Critical: { variant: 'critical', icon: Flame, label: 'Critical' },
  High: { variant: 'warning', icon: AlertTriangle, label: 'High' },
  Medium: { variant: 'info', icon: null, label: 'Medium' },
  Low: { variant: 'neutral', icon: null, label: 'Low' },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const cfg = CONFIG[status] || { variant: 'neutral', icon: null, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`badge badge-${cfg.variant}`}>
      {Icon && <Icon size={12} />}
      {cfg.label}
    </span>
  );
}
