import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  }

  const styles = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in',
        styles[toast.type]
      )}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-gray-200/50 rounded transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

// Toast container with state management
let toastListeners: ((toasts: ToastMessage[]) => void)[] = []
let toasts: ToastMessage[] = []

export function showToast(type: ToastMessage['type'], message: string) {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(7),
    type,
    message,
  }
  toasts = [...toasts, toast]
  toastListeners.forEach(listener => listener(toasts))
}

export function ToastContainer() {
  const [localToasts, setLocalToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    toastListeners.push(setLocalToasts)
    return () => {
      toastListeners = toastListeners.filter(l => l !== setLocalToasts)
    }
  }, [])

  const handleClose = (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    toastListeners.forEach(listener => listener(toasts))
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {localToasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  )
}
