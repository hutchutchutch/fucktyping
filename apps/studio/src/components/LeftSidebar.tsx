import type { FormSummary } from "../authoring/useForms";

const LINKS = [
  { label: "New form", href: "#", primary: true },
  { label: "Responses", href: "#" },
  { label: "Docs", href: "https://developers.cloudflare.com/durable-objects/" },
];

export interface LeftSidebarProps {
  /** Published forms for the "My forms" list. */
  forms?: FormSummary[];
  /** Optional callback when a form is clicked. */
  onSelectForm?: (formId: string) => void;
}

export function LeftSidebar({ forms = [], onSelectForm }: LeftSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">🎙 FuckTyping Studio</div>
      <nav className="nav">
        {LINKS.map((l) => (
          <a key={l.label} className={`nav-link${l.primary ? " primary" : ""}`} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="my-forms">
        <div className="my-forms-title">My forms</div>
        {forms.length === 0 ? (
          <div className="my-forms-empty">No published forms yet.</div>
        ) : (
          <ul className="my-forms-list">
            {forms.map((f) => (
              <li key={f.id}>
                <a
                  className="nav-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectForm?.(f.id);
                  }}
                >
                  {f.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sidebar-foot">Describe the form you want. The graph on the right updates as you talk.</div>
    </aside>
  );
}
