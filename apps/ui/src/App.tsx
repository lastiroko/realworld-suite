import { useEffect, useState } from 'react';

type Case = { id: number; reference: string; status: string; createdAt: string };

export default function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch('http://localhost:8080/api/cases')
      .then(r => r.json())
      .then(setCases)
      .catch(() => setError('Backend not reachable'));

  useEffect(() => { load(); }, []);

  const createCase = async () => {
    setCreating(true);
    setError(null);
    try {
      await fetch('http://localhost:8080/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      await load();
    } catch {
      setError('Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h1>DSAR Workflow (MVP)</h1>
      <button onClick={createCase} disabled={creating}>
        {creating ? 'Creating…' : 'Create Case'}
      </button>
      {error && <p style={{color:'crimson'}}>{error}</p>}
      <ul style={{marginTop:16}}>
        {cases.map(c => (
          <li key={c.id}>
            <code>{c.reference}</code> — <b>{c.status}</b> — {new Date(c.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
