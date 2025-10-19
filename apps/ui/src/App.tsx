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

type PageResp = {
  content: Case[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
};

type Audit = { id:number; action:string; at:string; details:string|null };

const columns: Array<{key: Case['status']; title: string}> = [
  { key: 'NEW', title: 'New' },
  { key: 'VERIFYING', title: 'Verifying' },
  { key: 'DELIVERED', title: 'Delivered' },
];

function Kanban() {
  const [board, setBoard] = useState<Record<string, Case[]>>({ NEW:[], VERIFYING:[], DELIVERED:[] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [openId, setOpenId] = useState<number|null>(null);
  const [openCase, setOpenCase] = useState<Case|null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [owner, setOwner] = useState(''); const [summary, setSummary] = useState('');

  const load = () => {
    setLoading(true);
    fetch('http://localhost:8080/api/cases/board')
      .then(r => r.json()).then(setBoard)
      .catch(() => setErr('Backend not reachable'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const createCase = async (dueDays?: number) => {
    await fetch('http://localhost:8080/api/cases', { method:'POST', headers:{'Content-Type':'application/json'}, body: dueDays? JSON.stringify({dueDays}) : '{}' });
    load();
  };

  const move = async (c: Case) => {
    const next = c.status === 'NEW' ? 'VERIFYING' : c.status === 'VERIFYING' ? 'DELIVERED' : null;
    if (!next) return;
    await fetch(`http://localhost:8080/api/cases/${c.id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({to:next}) });
    load(); if (openId === c.id) openDetails(c.id);
  };

  const remove = async (id: number) => {
    await fetch(`http://localhost:8080/api/cases/${id}`, { method:'DELETE' });
    load(); if (openId === id) { setOpenId(null); setOpenCase(null); }
  };

  const openDetails = async (id: number) => {
    setOpenId(id);
    const [c, a] = await Promise.all([
      fetch(`http://localhost:8080/api/cases/${id}`).then(r=>r.json()),
      fetch(`http://localhost:8080/api/cases/${id}/audit`).then(r=>r.json())
    ]);
    setOpenCase(c); setOwner(c.owner ?? ''); setSummary(c.summary ?? ''); setAudits(a);
  };

  const saveDetails = async () => {
    if (!openId) return;
    await fetch(`http://localhost:8080/api/cases/${openId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ owner, summary }) });
    await openDetails(openId); load();
  };

  const daysLeft = (due: string) => Math.ceil((new Date(due).getTime()-Date.now())/(1000*60*60*24));

  return (
    <div>
      <div style={{ marginBottom: 12, display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={() => createCase()}>Create Case (30d SLA)</button>
        <button onClick={() => createCase(5)}>Create Case (5d SLA)</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {columns.map(col => (
          <div key={col.key} style={{ border:'1px solid #ddd', borderRadius:8, padding:12, minHeight:200 }}>
            <h3 style={{marginTop:0}}>{col.title} ({board[col.key]?.length ?? 0})</h3>
            {(board[col.key] ?? []).map(c => {
              const left = daysLeft(c.dueAt), late = left < 0;
              return (
                <div key={c.id}
                     onClick={() => openDetails(c.id)}
                     style={{ background:'#fafafa', border:'1px solid #eee', borderRadius:8, padding:10, marginBottom:8, cursor:'pointer' }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                    <div style={{fontSize:12, opacity:0.7}}>{new Date(c.createdAt).toLocaleString()}</div>
                    <button onClick={(e)=>{e.stopPropagation(); remove(c.id);}} style={{fontSize:12}}>🗑️</button>
                  </div>
                  <div style={{fontSize:12, opacity:0.8}}>Ref: <code>{c.reference}</code></div>
                  <div style={{fontSize:12}}>SLA: <b style={{color: late?'crimson':undefined}}>{late?`${-left} overdue`:`${left} days left`}</b></div>
                  {c.status!=='DELIVERED' && <button onClick={(e)=>{e.stopPropagation(); move(c);}} style={{marginTop:6}}>Move →</button>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {openCase && (
        <div style={{position:'fixed', top:0, right:0, width:420, height:'100%', background:'#fff', borderLeft:'1px solid #ddd', boxShadow:'-4px 0 16px rgba(0,0,0,.08)', padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{margin:0}}>Case #{openCase.id}</h2>
            <button onClick={()=>{setOpenId(null); setOpenCase(null);}}>✖</button>
          </div>
          <div style={{fontSize:12, opacity:0.7, marginBottom:8}}>Ref: <code>{openCase.reference}</code></div>
          <label style={{display:'grid', gap:4}}><span>Owner</span><input value={owner} onChange={e=>setOwner(e.target.value)} /></label>
          <label style={{display:'grid', gap:4}}><span>Summary</span><textarea rows={4} value={summary} onChange={e=>setSummary(e.target.value)} /></label>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={saveDetails}>Save</button>
          </div>
          <div style={{marginTop:16}}><b>Audit</b></div>
          {/* audit rendering already present earlier; keep or add if needed */}
        </div>
      )}
    </div>
  );
}

function TableView() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'dueAt,asc'|'dueAt,desc'|'createdAt,desc'|'createdAt,asc'>('dueAt,asc');
  const [page, setPage] = useState(0);
  const [resp, setResp] = useState<PageResp|null>(null);

  const load = () => {
    const params = new URLSearchParams({
      q, status, page: String(page), size: '10', sort
    });
    fetch('http://localhost:8080/api/cases/page?' + params.toString())
      .then(r => r.json()).then(setResp);
  };
  useEffect(() => { load(); }, [page, sort]);

  return (
    <div style={{marginTop:24}}>
      <h2>Cases (Table)</h2>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <input placeholder="Search reference/owner/summary…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1}} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option>NEW</option><option>VERIFYING</option><option>DELIVERED</option>
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="dueAt,asc">Due ↑</option>
          <option value="dueAt,desc">Due ↓</option>
          <option value="createdAt,desc">Created ↓</option>
          <option value="createdAt,asc">Created ↑</option>
        </select>
        <button onClick={()=>{ setPage(0); load(); }}>Search</button>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead><tr>
          <th align="left">Ref</th><th>Status</th><th>Owner</th><th>Summary</th><th>Created</th><th>Due</th>
        </tr></thead>
        <tbody>
          {resp?.content.map(c=>(
            <tr key={c.id} style={{borderTop:'1px solid #eee'}}>
              <td><code>{c.reference}</code></td>
              <td style={{textAlign:'center'}}>{c.status}</td>
              <td style={{textAlign:'center'}}>{c.owner ?? ''}</td>
              <td>{c.summary ?? ''}</td>
              <td style={{textAlign:'center'}}>{new Date(c.createdAt).toLocaleString()}</td>
              <td style={{textAlign:'center'}}>{new Date(c.dueAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={!resp || page<=0}>Prev</button>
        <div>Page {resp ? resp.page+1 : 1} / {resp ? resp.totalPages : 1}</div>
        <button onClick={()=>setPage(p=> (resp && p+1<resp.totalPages) ? p+1 : p)} disabled={!resp || !resp.content || (resp.page+1>= (resp.totalPages||1))}>Next</button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'KANBAN'|'TABLE'>('KANBAN');
  return (
    <div style={{ padding: 24 }}>
      <h1>DSAR Workflow</h1>
      <div style={{marginBottom:12}}>
        <button onClick={()=>setView('KANBAN')} disabled={view==='KANBAN'}>Kanban</button>
        <button onClick={()=>setView('TABLE')}  disabled={view==='TABLE'} style={{marginLeft:8}}>Table</button>
      </div>
      {view==='KANBAN' ? <Kanban/> : <TableView/>}
    </div>
  );
}
