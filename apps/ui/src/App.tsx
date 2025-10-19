import { useEffect, useState } from 'react';

type Case = {
  id: number;
  reference: string;
  status: 'NEW' | 'VERIFYING' | 'DELIVERED';
  createdAt: string;
  dueAt: string;
  verifyingAt?: string | null;
  deliveredAt?: string | null;
  owner?: string | null;
  summary?: string | null;
};

type Audit = { id:number; action:string; at:string; details:string|null };

const columns: Array<{key: Case['status']; title: string}> = [
  { key: 'NEW', title: 'New' },
  { key: 'VERIFYING', title: 'Verifying' },
  { key: 'DELIVERED', title: 'Delivered' },
];

export default function App() {
  const [board, setBoard] = useState<Record<string, Case[]>>({ NEW:[], VERIFYING:[], DELIVERED:[] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  const [openId, setOpenId] = useState<number|null>(null);
  const [openCase, setOpenCase] = useState<Case|null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [owner, setOwner] = useState('');
  const [summary, setSummary] = useState('');

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
    if (openId === c.id) openDetails(c.id); // refresh drawer if open
  };

  const remove = async (id: number) => {
    await fetch(`http://localhost:8080/api/cases/${id}`, { method: 'DELETE' });
    load();
    if (openId === id) { setOpenId(null); setOpenCase(null); }
  };

  const openDetails = async (id: number) => {
    setOpenId(id);
    const [c, a] = await Promise.all([
      fetch(`http://localhost:8080/api/cases/${id}`).then(r=>r.json()),
      fetch(`http://localhost:8080/api/cases/${id}/audit`).then(r=>r.json())
    ]);
    setOpenCase(c);
    setOwner(c.owner ?? '');
    setSummary(c.summary ?? '');
    setAudits(a);
  };

  const saveDetails = async () => {
    if (!openId) return;
    await fetch(`http://localhost:8080/api/cases/${openId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, summary })
    });
    await openDetails(openId); // reload case & audit
    load(); // refresh board (owner might be shown later if you add it on cards)
  };

  const daysLeft = (due: string) => {
    const ms = new Date(due).getTime() - Date.now();
    return Math.ceil(ms / (1000*60*60*24));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>DSAR Workflow — Kanban</h1>
      <div style={{ marginBottom: 12, display:'flex', gap:8, flexWrap:'wrap' }}>
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
                <div key={c.id}
                     onClick={() => openDetails(c.id)}
                     style={{ background:'#fafafa', border:'1px solid #eee', borderRadius:8, padding:10, marginBottom:8, cursor:'pointer' }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                    <div style={{fontSize:12, opacity:0.7}}>{new Date(c.createdAt).toLocaleString()}</div>
                    <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} title="Delete" style={{fontSize:12}}>🗑️</button>
                  </div>
                  <div style={{fontSize:12, opacity:0.8}}>Ref: <code>{c.reference}</code></div>
                  <div style={{fontSize:12}}>
                    SLA: <b style={{color: late ? 'crimson' : undefined}}>
                      {late ? `${-left} day(s) overdue` : `${left} day(s) left`}
                    </b>
                  </div>
                  {c.status !== 'DELIVERED' &&
                    <button onClick={(e) => { e.stopPropagation(); move(c); }} style={{marginTop:6}}>Move →</button>
                  }
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Drawer */}
      {openCase && (
        <div style={{
          position:'fixed', top:0, right:0, width:420, height:'100%',
          background:'#fff', borderLeft:'1px solid #ddd', boxShadow:'-4px 0 16px rgba(0,0,0,0.08)', padding:16
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{margin:0}}>Case #{openCase.id}</h2>
            <button onClick={() => { setOpenId(null); setOpenCase(null); }} title="Close">✖</button>
          </div>
          <div style={{fontSize:12, opacity:0.7, marginBottom:8}}>
            Ref: <code>{openCase.reference}</code>
          </div>
          <div style={{display:'grid', gap:8}}>
            <div><b>Status:</b> {openCase.status}</div>
            <div><b>Created:</b> {new Date(openCase.createdAt).toLocaleString()}</div>
            <div><b>Due:</b> {new Date(openCase.dueAt).toLocaleString()}</div>
            <label style={{display:'grid', gap:4}}>
              <span>Owner</span>
              <input value={owner} onChange={e=>setOwner(e.target.value)} />
            </label>
            <label style={{display:'grid', gap:4}}>
              <span>Summary</span>
              <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={4}/>
            </label>
            <div style={{display:'flex', gap:8}}>
              <button onClick={saveDetails}>Save</button>
              {openCase.status !== 'DELIVERED' &&
                <button onClick={() => openCase && move(openCase)}>Move →</button>
              }
            </div>
          </div>

          <div style={{marginTop:16}}>
            <b>Audit</b>
            <ul style={{margin:0, paddingLeft:16, maxHeight:200, overflow:'auto'}}>
              {audits.map(a => (
                <li key={a.id}>
                  <span style={{opacity:0.7}}>{new Date(a.at).toLocaleString()}</span> — <b>{a.action}</b>
                  {a.details ? <> — <span>{a.details}</span></> : null}
                </li>
              ))}
              {audits.length === 0 && <li>No events</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
