import { useEffect, useState } from 'react';

type Case = {
  id: number;
  reference: string;
  status: 'NEW' | 'VERIFYING' | 'DELIVERED';
  createdAt: string;
  dueAt: string;
  verifyingAt?: string | null;
  deliveredAt?: string | null;
};

const columns: Array<{key: Case['status']; title: string}> = [
  { key: 'NEW', title: 'New' },
  { key: 'VERIFYING', title: 'Verifying' },
  { key: 'DELIVERED', title: 'Delivered' },
];

export default function App() {
  const [board, setBoard] = useState<Record<string, Case[]>>({ NEW:[], VERIFYING:[], DELIVERED:[] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    fetch('http://localhost:8080/api/cases/board')
      .then(r => r.json())
      .then(setBoard)
      .catch(() => setErr('Backend not reachable'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createCase = async (dueDays?: number) => {
    await fetch('http://localhost:8080/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dueDays ? JSON.stringify({ dueDays }) : '{}'
    });
    load();
  };

  const move = async (c: Case) => {
    const next = c.status === 'NEW' ? 'VERIFYING' : c.status === 'VERIFYING' ? 'DELIVERED' : null;
    if (!next) return;
    await fetch(`http://localhost:8080/api/cases/${c.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: next })
    });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`http://localhost:8080/api/cases/${id}`, { method: 'DELETE' });
    load();
  };

  const daysLeft = (due: string) => {
    const ms = new Date(due).getTime() - Date.now();
    return Math.ceil(ms / (1000*60*60*24));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>DSAR Workflow — Kanban</h1>
      <div style={{ marginBottom: 12, display:'flex', gap:8 }}>
        <button onClick={() => createCase()}>Create Case (30d SLA)</button>
        <button onClick={() => createCase(5)}>Create Case (5d SLA)</button>
        {loading && <span>Loading…</span>}
        {err && <span style={{ color:'crimson' }}>{err}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {columns.map(col => (
          <div key={col.key} style={{ border:'1px solid #ddd', borderRadius:8, padding:12, minHeight:200 }}>
            <h3 style={{marginTop:0}}>{col.title} ({board[col.key]?.length ?? 0})</h3>
            {(board[col.key] ?? []).map(c => {
              const left = daysLeft(c.dueAt);
              const late = left < 0;
              return (
                <div key={c.id} style={{ background:'#fafafa', border:'1px solid #eee', borderRadius:8, padding:10, marginBottom:8 }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontSize:12, opacity:0.7}}>{new Date(c.createdAt).toLocaleString()}</div>
                    <button onClick={() => remove(c.id)} title="Delete" style={{fontSize:12}}>🗑️</button>
                  </div>
                  <div><code>{c.reference}</code></div>
                  <div style={{fontSize:12}}>
                    SLA: <b style={{color: late ? 'crimson' : undefined}}>
                      {late ? `${-left} day(s) overdue` : `${left} day(s) left`}
                    </b>
                  </div>
                  {c.status !== 'DELIVERED' &&
                    <button onClick={() => move(c)} style={{marginTop:6}}>Move →</button>
                  }
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
