import { createPortal } from 'react-dom'
import Button from './Button'

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', onConfirm, onCancel, variant = 'danger' }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-[24px]" style={{ animation: 'modalFadeIn 0.15s ease-out' }}>
      <div className="absolute inset-0 bg-[rgba(15,22,16,0.35)]" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={onCancel} />
      <div className="relative bg-white rounded-[18px] p-[24px] w-[380px] shadow-[0_24px_64px_rgba(0,0,0,0.2)]" style={{ animation: 'modalSlideUp 0.2s ease-out' }}>
        <div className="text-[17px] font-extrabold text-primary-dark mb-[8px]">{title}</div>
        <div className="text-[14px] text-text-secondary font-medium mb-[22px] leading-[1.5]">{message}</div>
        <div className="flex gap-[10px] justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <button
            onClick={onConfirm}
            className={`rounded-button py-[10px] px-[20px] text-[14px] font-extrabold cursor-pointer border-none ${
              variant === 'danger'
                ? 'bg-danger text-white hover:opacity-90'
                : 'bg-primary text-white hover:bg-primary-medium'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>,
    document.body,
  )
}
