import { Plus } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-[40px]">
      <div className="w-[72px] h-[72px] rounded-[20px] bg-chip-bg flex items-center justify-center mb-[20px]">
        <Icon size={32} className="text-primary-medium" />
      </div>
      <div className="text-[17px] font-extrabold text-primary-dark mb-[6px]">{title}</div>
      <div className="text-[14px] text-text-secondary font-medium text-center max-w-[320px] mb-[20px]">{description}</div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <span className="flex items-center gap-[6px]"><Plus size={16} /> {actionLabel}</span>
        </Button>
      )}
    </div>
  )
}
