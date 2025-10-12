import { useEffect, useState } from 'react';

export default function App() {
  const [msg, setMsg] = useState('Loading...');
  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then(r => r.text())
      .then(setMsg)
      .catch(() => setMsg('Backend not reachable'));
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>DSAR Workflow (MVP)</h1>
      <p>{msg}</p>
    </div>
  );
}
