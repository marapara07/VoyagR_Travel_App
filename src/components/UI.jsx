export function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="section-title">
      <div className="icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, icon, children }) {
  return (
    <label className="field">
      <span>{icon}{label}</span>
      {children}
    </label>
  );
}

export function Empty({ text }) {
  return <p className="empty">{text}</p>;
}
