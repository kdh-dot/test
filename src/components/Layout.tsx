import { FolderOpen, Sparkles } from 'lucide-react'
import { Button } from './ui'
import { useAppStore } from '../store/useAppStore'
import { StepIndicator } from './StepIndicator'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { setShowProjectsModal } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CopyFlow</span>
            </div>

            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjectsModal(true)}
              className="flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">저장된 프로젝트</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
