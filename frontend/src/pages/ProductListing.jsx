import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

const PRICE_BUCKETS = [
  { label: 'Under USD 100', test: (p) => p < 100 },
  { label: 'USD 100 – 200', test: (p) => p >= 100 && p <= 200 },
  { label: 'Over USD 200', test: (p) => p > 200 },
];

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceFilter, setPriceFilter] = useState(null);

  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const category = searchParams.get('category');

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filtered = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (priceFilter && !PRICE_BUCKETS[priceFilter - 1].test(p.price)) return false;
    return true;
  });

  function toggleCategory(c) {
    const next = new URLSearchParams(searchParams);
    if (category === c) next.delete('category');
    else next.set('category', c);
    setSearchParams(next);
  }

  return (
    <div>
      <div className="section-heading">
        <h2>{category || (query ? `Results for "${query}"` : 'All Products')}</h2>
        <span className="list-row__meta">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
      </div>
      <div className="listing-layout">
        <aside className="filters">
          <h4>Category</h4>
          {categories.map((c) => (
            <label className="filter-option" key={c}>
              <input type="checkbox" checked={category === c} onChange={() => toggleCategory(c)} />
              {c}
            </label>
          ))}
          <h4>Price</h4>
          {PRICE_BUCKETS.map((bucket, i) => (
            <label className="filter-option" key={bucket.label}>
              <input
                type="radio"
                name="price"
                checked={priceFilter === i + 1}
                onChange={() => setPriceFilter(priceFilter === i + 1 ? null : i + 1)}
              />
              {bucket.label}
            </label>
          ))}
        </aside>
        <div className="product-grid">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No products match your filters.</div>
          ) : (
            filtered.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
