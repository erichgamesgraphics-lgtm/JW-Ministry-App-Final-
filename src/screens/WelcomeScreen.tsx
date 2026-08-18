import React from 'react';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useMinistry } from '../context/MinistryContext.tsx';
import { JWMinistryLogo } from '../components/JWMinistryLogo.tsx';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const { signInWithGoogle, signInWithApple, continueAsGuest, isAuthenticating } = useMinistry();

  const handleGoogle = () => {
    signInWithGoogle(() => onContinue());
  };

  const handleApple = () => {
    signInWithApple(() => onContinue());
  };

  const handleGuest = () => {
    continueAsGuest();
    onContinue();
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-[#0B1120] dark:via-[#0E1729] dark:to-[#131D31] px-5 py-8 sm:px-8">
      {/* Top Header & Emblem */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center pt-6 text-center">
        <JWMinistryLogo size={104} className="rounded-3xl shadow-xl" />

        <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          JW Ministry App
        </h1>
        
        <p className="mt-2 text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
          Personal assistant for Jehovah's Witnesses to organize and track preaching activity, return visits, Bible studies, and schedules.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 grid w-full grid-cols-1 gap-2.5 text-left">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#131D31]/80 p-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Track hours, return visits, Bible studies, & placements
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#131D31]/80 p-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Live ministry stopwatch & schedule organizer
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#131D31]/80 p-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Instant monthly reports, CSV export, & offline privacy
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Auth Section */}
      <div className="mx-auto w-full max-w-md pb-6 pt-8">
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Welcome to Service
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to synchronize across devices or continue offline
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={isAuthenticating}
            className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 font-semibold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-sm">
              {isAuthenticating ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>

          {/* Apple Sign In */}
          <button
            onClick={handleApple}
            disabled={isAuthenticating}
            className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 font-semibold shadow-xs hover:bg-black dark:hover:bg-slate-100 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.63-.78 1.06-1.85.94-2.93-.93.04-2.03.62-2.69 1.4-.58.67-.99 1.76-.88 2.81 1.03.08 2.06-.52 2.63-1.28z" />
            </svg>
            <span className="text-sm">
              {isAuthenticating ? 'Connecting...' : 'Continue with Apple'}
            </span>
          </button>

          {/* Guest Mode */}
          <button
            onClick={handleGuest}
            disabled={isAuthenticating}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 transition-colors"
          >
            <span>Continue as Guest (Local Offline Mode)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="h-3.5 w-3.5" />
          <span>Your spiritual ministry records remain private on your device</span>
        </div>
      </div>
    </div>
  );
};
