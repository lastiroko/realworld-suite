import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DsarPage } from './pages/DsarPage';
import { AuditPage } from './pages/AuditPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import './App.css';

export type ViewKey = 'dsar' | 'incidents' | 'audit';

export default function App() {
  const [view, setView] = useState<ViewKey>('dsar');

  return (
    <div className="app-shell">
      <Sidebar active={view} onSelect={setView} />
      <main className="app-main">
        {view === 'dsar' && <DsarPage />}
        {view === 'incidents' && (
          <PlaceholderPage
            eyebrow="Acureq · Incidents"
            title="Incident response register"
            description="Triage security incidents, escalate to Section 8, and close them out with a full audit trail."
          />
        )}
        {view === 'audit' && <AuditPage />}
      </main>
    </div>
  );
}
