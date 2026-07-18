import { X } from 'lucide-react'

export default function Modal({ title, onClose, onSubmit, submitLabel = 'Save', children, size = 'md' }) {
  const maxWidth = size === 'lg' ? 700 : size === 'sm' ? 400 : 560

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal animate-fade" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} id="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {onSubmit && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} id="modal-cancel-btn">Cancel</button>
            <button className="btn btn-primary" onClick={onSubmit} id="modal-submit-btn">{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}
