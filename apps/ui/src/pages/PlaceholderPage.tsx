interface Props {
  title: string;
  description: string;
  eyebrow: string;
}

export function PlaceholderPage({ title, description, eyebrow }: Props) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="subtitle">{description}</p>
        </div>
      </div>
      <div className="placeholder-soon">
        <span className="placeholder-soon__pill">In development</span>
        <p>This module will plug into the existing incident-register service and shared audit trail.</p>
      </div>
    </header>
  );
}
