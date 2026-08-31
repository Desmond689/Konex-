import { useState } from "react";

/**
 * Blocking confirmation for dangerous actions (ban, suspend, restrict,
 * remove content, role changes). Per the moderation review notes, these
 * should never be a single accidental click, and destructive actions
 * should always capture a reason for the audit trail.
 */
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  requireReason = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (requireReason && reason.trim().length < 3) {
      setError("A reason is required for this action.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim() || null);
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {requireReason && (
          <div className="field">
            <label className="field-label">Reason</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Why is this action being taken? Staff and appeals reviewers will see this."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className={danger ? "btn btn-danger" : "btn btn-primary"}
            onClick={submit}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
