import { cn } from '../../lib/utils'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  name: string
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RadioGroup({ name, label, options, value, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start p-3 rounded-lg border cursor-pointer transition-colors',
              value === option.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <span className="block text-xs text-gray-500 mt-0.5">{option.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
