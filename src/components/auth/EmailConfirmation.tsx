import { Mail } from 'lucide-react';

interface EmailConfirmationProps {
  email: string;
  type: 'signup' | 'reset';
  onBack: () => void;
}

export function EmailConfirmation({ email, type, onBack }: EmailConfirmationProps) {
  const title = type === 'signup' ? 'Check your email' : 'Reset link sent';
  const message =
    type === 'signup'
      ? `We've sent a confirmation link to ${email}. Please check your email and click the link to activate your account.`
      : `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`;

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> The email may take a few minutes to arrive. Don't forget to check your spam folder.
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
      >
        Back to sign in
      </button>

      {type === 'signup' && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Already confirmed?{' '}
          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in now
          </button>
        </p>
      )}
    </div>
  );
}
