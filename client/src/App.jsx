import { useEffect, useState } from 'react';

const LIMIT = 12;
export default function App() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetch('/api/categories').then(response => {
      if (!response.ok) throw new Error('Could not load categories');
      return response.json();
    }).then(setCategories).catch(err => setError(err.message));
  }, []);

  useEffect(() => { setPage(1); }, [search, selected]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ search, category: selected.join(','), page: String(page), limit: String(LIMIT) });
    setLoading(true);
    setError('');
    fetch(`/api/resources?${params}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load results. Please try again.');
        return response.json();
      })
      .then(result => { setItems(result.data); setPagination(result.pagination); })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, selected, page]);

  const toggleCategory = category => {
    setSelected(previous => previous.includes(category)
      ? previous.filter(value => value !== category)
      : [...previous, category]);
  };

  return (
    <main className="layout">
      <header className="hero">
        <span className="eyebrow">RESOURCE EXPLORER</span>
        <h1>Live Query Filter System</h1>
        <p>Discover learning resources with instant search, category filters and pagination.</p>
      </header>
      <section className="panel" aria-label="Search and filters">
        <label className="search-label" htmlFor="search">Search resources</label>
        <input id="search" type="search" placeholder="Search by title, category or level..."
          value={searchInput} onChange={event => setSearchInput(event.target.value)} />
        <div className="filter-heading"><strong>Categories</strong><button type="button" className="text-button" onClick={() => { setSelected([]); setSearchInput(''); }}>Clear all</button></div>
        <div className="filters">
          {categories.map(category => <label className="filter" key={category}>
            <input type="checkbox" checked={selected.includes(category)} onChange={() => toggleCategory(category)} />
            <span>{category}</span>
          </label>)}
        </div>
      </section>
      <div className="result-heading"><h2>Results</h2><span aria-live="polite">{loading ? 'Loading...' : `${pagination.total} resources found`}</span></div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? <div className="status" role="status">Loading resources...</div>
        : !error && items.length === 0 ? <div className="status">No matching resources. Try another search or category.</div>
        : !error && <div className="grid">{items.map(item => <article className="card" key={item.id}>
          <div className="card-top"><span className="category">{item.category}</span><span className="rating">★ {item.rating}</span></div>
          <h3>{item.title}</h3>
          <p>Explore this {item.level.toLowerCase()} learning resource.</p>
          <div className="meta"><span>{item.level}</span><span>{item.durationMinutes} min</span></div>
        </article>)}</div>}
      {!loading && !error && pagination.totalPages > 1 && <nav className="pagination" aria-label="Pagination">
        <button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
        <span>Page {page} of {pagination.totalPages}</span>
        <button disabled={page >= pagination.totalPages} onClick={() => setPage(value => value + 1)}>Next</button>
      </nav>}
      <footer>Live Query Filter System · React + Express</footer>
    </main>
  );
}
