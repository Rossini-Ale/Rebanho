import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [])

  const isSuccess = type === 'success'

  return createPortal(
    <div
      className="fixed bottom-[24px] right-[24px] z-[60] flex items-center gap-[10px] bg-white border border-border rounded-[14px] py-[14px] px-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
      style={{ animation: 'toastSlideIn 0.3s ease-out' }}
    >
      <span className={`w-[28px] h-[28px] rounded-full flex items-center justify-center ${isSuccess ? 'bg-chip-bg text-primary' : 'bg-danger-bg text-danger'}`}>
        {isSuccess ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
      </span>
      <span className="text-[14px] font-semibold text-primary-dark">{message}</span>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
