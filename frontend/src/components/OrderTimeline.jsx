import { ClipboardCheck, PackageCheck, Truck, Navigation, Home } from 'lucide-react';

const STEPS = [
  { key: 'PLACED', label: 'Ordered', icon: ClipboardCheck },
  { key: 'PACKED', label: 'Packed', icon: PackageCheck },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const isDelivered = status === 'DELIVERED';
  return (
    <div className="timeline">
      {STEPS.map(({ key, label, icon: Icon }, i) => {
        const state = i < currentIndex || (isDelivered && i === currentIndex) ? 'done' : i === currentIndex ? 'current' : '';
        return (
          <div key={key} className={`timeline__step ${state}`}>
            <span className="timeline__connector" />
            <span className="timeline__icon"><Icon size={17} /></span>
            <span className="timeline__label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
