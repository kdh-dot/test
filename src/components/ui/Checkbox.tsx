import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

interface CheckboxProps {
  id?: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ id, label, checked, onChange, className }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label
      htmlFor={checkboxId}
      className={cn('flex items-center cursor-pointer group', className)}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
            checked
              ? 'bg-primary border-primary'
              : 'border-gray-300 group-hover:border-gray-400'
          )}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  )
}
