// Simple toast notification system
// Can be replaced with a library like react-hot-toast later

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const DEFAULT_DURATION = 3000;

function createToastElement(message: string, type: ToastType): HTMLDivElement {
  const toast = document.createElement('div');
  toast.className = `fixed z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100`;

  // Type-specific styles
  const typeStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-orange-600',
  };

  toast.classList.add(typeStyles[type]);
  toast.textContent = message;

  return toast;
}

function showToast(message: string, type: ToastType, options: ToastOptions = {}) {
  const { duration = DEFAULT_DURATION, position = 'top-right' } = options;

  // Create toast element
  const toast = createToastElement(message, type);

  // Position styles
  const positions = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  toast.className += ` ${positions[position]}`;

  // Add to DOM
  document.body.appendChild(toast);

  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-1rem)';

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) =>
    showToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) =>
    showToast(message, 'info', options),
  warning: (message: string, options?: ToastOptions) =>
    showToast(message, 'warning', options),
};
