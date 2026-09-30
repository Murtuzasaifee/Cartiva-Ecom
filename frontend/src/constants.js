import { Laptop, Shirt, Home as HomeIcon, Dumbbell, Tag } from 'lucide-react';

// No login flow yet — every customer-scoped API call uses this fixed account.
export const CURRENT_CUSTOMER_ID = 1;

export const ISSUE_TYPES = [
  'Delivery Issue',
  'Product Issue',
  'Payment Issue',
  'Return Request',
  'Refund Request',
  'Cancellation',
  'Other',
];

export const CATEGORIES = [
  { name: 'Electronics', icon: Laptop, tint: 'var(--color-info-soft)', tintText: 'var(--color-info)' },
  { name: 'Fashion', icon: Shirt, tint: 'var(--color-accent-2-soft)', tintText: 'var(--color-accent-2)' },
  { name: 'Home', icon: HomeIcon, tint: 'var(--color-accent-soft)', tintText: 'var(--color-accent-ink)' },
  { name: 'Sports', icon: Dumbbell, tint: 'var(--color-success-soft)', tintText: 'var(--color-success)' },
  { name: 'Deals', icon: Tag, tint: 'var(--color-warning-soft)', tintText: 'var(--color-warning)' },
];
