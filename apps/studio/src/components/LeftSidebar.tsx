import type { FormSummary } from "../authoring/useForms";

export interface LeftSidebarProps {
  /** Published forms for the "My forms" list. */
  forms?: FormSummary[];
  formsLoading?: boolean;
  formsError?: string | null;
  /** Optional callback when a form is clicked. */
  onSelectForm?: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onNewForm: () => void;
  onShowResponses: () => void;
  selectedFormId?: string | null;
}

export function LeftSidebar({
  forms = [],
  formsLoading = false,
  formsError = null,
  onSelectForm,
  onEditForm,
  onNewForm,
  onShowResponses,
  selectedFormId,
}: LeftSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">🎙 FuckTyping Studio</div>
      <nav className="nav">
        <button type="button" className="nav-link primary" onClick={onNewForm}>New form</button>
        <button type="button" className="nav-link" onClick={onShowResponses}>Responses</button>
        <a className="nav-link" href="https://developers.cloudflare.com/durable-objects/">Docs</a>
      </nav>
      <div className="my-forms">
        <div className="my-forms-title">My forms</div>
        {formsError ? (
          <div className="my-forms-error" role="alert">Could not load forms.</div>
        ) : formsLoading ? (
          <div className="my-forms-empty">Loading…</div>
        ) : forms.length === 0 ? (
          <div className="my-forms-empty">No published forms yet.</div>
        ) : (
          <ul className="my-forms-list">
            {forms.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={`nav-link${selectedFormId === f.id ? " selected" : ""}`}
                  onClick={() => onSelectForm?.(f.id)}
                >
                  {f.name}
                </button>
                <button
                  type="button"
                  className="form-edit"
                  aria-label={`Edit ${f.name}`}
                  onClick={() => onEditForm(f.id)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sidebar-foot">Describe the form you want. The graph on the right updates as you talk.</div>
    </aside>
  );
}
