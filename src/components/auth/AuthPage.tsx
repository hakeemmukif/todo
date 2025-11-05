import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { EmailConfirmation } from './EmailConfirmation';
import { CheckCircle } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'email-confirmation';

export function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationType, setConfirmationType] = useState<'signup' | 'reset'>('signup');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignUpSuccess = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationType('signup');
    setCurrentView('email-confirmation');
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationType('reset');
    setCurrentView('email-confirmation');
  };

  const handleResetPasswordSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentView('login');
    }, 3000);
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const renderView = () => {
    if (showSuccess) {
      return (
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password updated</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );

      case 'signup':
        return (
          <SignUpForm
            onSwitchToLogin={handleBackToLogin}
            onSignUpSuccess={handleSignUpSuccess}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={handleBackToLogin}
            onSuccess={handleForgotPasswordSuccess}
          />
        );

      case 'reset-password':
        return <ResetPasswordForm onSuccess={handleResetPasswordSuccess} />;

      case 'email-confirmation':
        return (
          <EmailConfirmation
            email={confirmationEmail}
            type={confirmationType}
            onBack={handleBackToLogin}
          />
        );

      default:
        return null;
    }
  };

  // Check URL for password reset hash
  const params = new URLSearchParams(window.location.hash.substring(1));
  const isResetPassword = params.get('type') === 'recovery';

  // Auto-switch to reset password view if hash is present
  if (isResetPassword && currentView !== 'reset-password') {
    setCurrentView('reset-password');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Task Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay organized, stay productive
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {renderView()}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Daily Task Tracker. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
