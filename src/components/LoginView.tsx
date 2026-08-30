import { OnboardingSlides } from './OnboardingSlides';
import { SystemSettings } from '../types';

interface LoginViewProps {
  settings?: SystemSettings;
  onSaveProfile?: (ownerName: string, gymName: string) => Promise<void> | void;
  onLoginSuccess?: () => void;
  onSkip?: () => void;
}

export function LoginView({ settings, onSaveProfile, onLoginSuccess, onSkip }: LoginViewProps) {
  return (
    <div 
      id="login-view-wrapper"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-brand-bg relative overflow-hidden"
    >
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-200/25 rounded-full blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200/25 rounded-full blur-[100px] -z-10 animate-pulse duration-[12s]" />

      <OnboardingSlides 
        settings={settings}
        onSaveProfile={onSaveProfile}
        onLoginSuccess={onLoginSuccess}
        onComplete={() => onLoginSuccess?.()}
        onSkip={onSkip}
      />
    </div>
  );
}
