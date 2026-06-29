import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Modal({ title, subtitle, children, footer, onClose, width = 470 }) {
  const navigate = useNavigate()
  const close = onClose || (() => navigate(-1))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[24px]"
      style={{ animation: 'modalFadeIn 0.2s ease-out' }}
    >
      <div
        className="absolute inset-0 bg-[rgba(15,22,16,0.25)]"
        style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={close}
      />

      <div
        className="relative bg-bg rounded-[20px] overflow-hidden flex flex-col"
        style={{
          width,
          maxHeight: 'min(88vh, 720px)',
          animation: 'modalSlideUp 0.25s ease-out',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex justify-between items-center py-[18px] px-[24px] border-b border-border bg-white">
          <div>
            <div className="text-[17px] font-extrabold text-primary-dark leading-tight">{title}</div>
            {subtitle && <div className="text-[12.5px] text-text-secondary font-medium mt-[2px]">{subtitle}</div>}
          </div>
          <button
            onClick={close}
            className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center bg-transparent border-none cursor-pointer text-text-secondary hover:bg-segmented-bg hover:text-primary-dark transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-[22px_24px]">
          {children}
        </div>

        {footer && (
          <div className="py-[14px] px-[24px] border-t border-border bg-white flex gap-[10px] justify-end">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
