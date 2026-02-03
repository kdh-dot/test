import { Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

const steps = [
  { number: 1, title: '입력 방식' },
  { number: 2, title: '제품 정보' },
  { number: 3, title: '소구점' },
  { number: 4, title: '생성 옵션' },
  { number: 5, title: '카피 결과' },
]

export function StepIndicator() {
  const { currentStep, setStep, copies } = useAppStore()

  const canNavigateTo = (stepNumber: number) => {
    // Can always go back
    if (stepNumber < currentStep) return true
    // Can only go forward one step at a time (or if copies are generated)
    if (copies.length > 0 && stepNumber === 5) return true
    return stepNumber <= currentStep
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => canNavigateTo(step.number) && setStep(step.number)}
                disabled={!canNavigateTo(step.number)}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  canNavigateTo(step.number) ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    currentStep === step.number && 'bg-primary text-white',
                    currentStep > step.number && 'bg-success text-white',
                    currentStep < step.number && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Title */}
                <span
                  className={cn(
                    'hidden sm:block text-sm font-medium transition-colors',
                    currentStep === step.number && 'text-primary',
                    currentStep > step.number && 'text-gray-700',
                    currentStep < step.number && 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block w-12 lg:w-24 h-0.5 mx-2',
                    currentStep > step.number ? 'bg-success' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
