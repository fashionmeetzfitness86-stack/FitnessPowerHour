import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';

/**
 * AuthCallback – handles Supabase email confirmation redirects.
 *
 * Supabase redirects here after the user clicks the confirmation link in their inbox.
 * With PKCE flow, the URL contains a `?code=...` parameter that we exchange for a session.
 * With implicit flow (legacy), tokens arrive in the URL hash.
 *
 * After successful confirmation the user is redirected to the login modal
 * with a `?confirmed=true` query parameter so the Membership component
 * can display a "Email confirmed!" banner.
 */

type CallbackStatus = 'processing' | 'success' | 'error' | 'expired';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // 1. Check for PKCE code in search params
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      // Supabase may include type=recovery in hash for password-reset flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const tokenType = hashParams.get('type') || searchParams.get('type');

      // Handle explicit error from Supabase redirect
      if (errorParam) {
        const msg = errorDescription || errorParam;
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('otp')) {
          setStatus('expired');
          setErrorMessage('Your confirmation link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setErrorMessage(msg);
        }
        return;
      }

      // 2. PKCE flow – exchange authorization code for session
      if (code) {
        const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
            setStatus('expired');
            setErrorMessage('Your confirmation link has expired or is invalid. Please request a new one.');
          } else {
            setStatus('error');
            setErrorMessage(error.message);
          }
          return;
        }

        // Detect if this code exchange was for a password reset (recovery)
        // Supabase sets amr claim to 'email_otp' with type 'recovery', or we can check token_type
        const isRecovery = tokenType === 'recovery' ||
          (exchangeData?.session?.user?.recovery_sent_at && !exchangeData?.session?.user?.email_confirmed_at === false);

        if (isRecovery || tokenType === 'recovery') {
          // Don't sign out — keep the session so /reset-password can call updateUser
          navigate('/reset-password', { replace: true });
          return;
        }

        // Email confirmation flow
        setStatus('success');
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/membership?confirmed=true', { replace: true });
        }, 2500);
        return;
      }

      // 3. Implicit flow (legacy fallback) — tokens in URL hash
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // If type=recovery, route directly to /reset-password
        if (tokenType === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) {
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }
          // Keep session alive for password reset form
          navigate('/reset-password', { replace: true });
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }

        setStatus('success');
        await supabase.auth.signOut();

        setTimeout(() => {
          navigate('/membership?confirmed=true', { replace: true });
        }, 2500);
        return;
      }

      // 4. No code or tokens found — Supabase might auto-detect session via detectSessionInUrl
      // Wait briefly, then check session status
      await new Promise(resolve => setTimeout(resolve, 1500));
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('success');
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/membership?confirmed=true', { replace: true });
        }, 2500);
      } else {
        setStatus('error');
        setErrorMessage('No confirmation data found. The link may have been used already.');
      }

    } catch (err: any) {
      console.error('Auth callback error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'An unexpected error occurred during email verification.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md card-gradient p-16 text-center space-y-10 rounded-[3rem] border border-white/10 shadow-2xl"
      >
        {/* Processing State */}
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="w-24 h-24 mx-auto relative">
              <Loader2 size={64} className="text-brand-teal animate-spin mx-auto" />
              {/* Pulsing ring */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-brand-teal/20 animate-ping" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Verifying <span className="text-brand-teal">Email</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">
                Authenticating your confirmation link...
              </p>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
              className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(45,212,191,0.3)]"
            >
              <Check size={48} className="text-black" />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Email <span className="text-brand-teal">Confirmed</span>
              </h2>
              <p className="text-sm text-white/50 uppercase tracking-widest">
                Your account has been verified successfully.
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">
                Redirecting you to login...
              </p>
            </div>
            {/* Progress bar animation */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
                className="h-full bg-brand-teal rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="w-24 h-24 bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto border border-brand-coral/30">
              <AlertTriangle size={48} className="text-brand-coral" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Verification <span className="text-brand-coral">Failed</span>
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/membership?mode=login', { replace: true })}
                className="btn-primary w-full py-5 text-[10px] uppercase tracking-[0.4em] font-black"
              >
                Go to Login
              </button>
              <button
                onClick={() => {
                  setStatus('processing');
                  setErrorMessage('');
                  handleCallback();
                }}
                className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors font-bold"
              >
                <RefreshCw size={14} /> Retry Verification
              </button>
            </div>
          </motion.div>
        )}

        {/* Expired Link State */}
        {status === 'expired' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle size={48} className="text-amber-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Link <span className="text-amber-500">Expired</span>
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest max-w-xs mx-auto">
                Go to login and click "Resend Confirmation" to receive a new verification email.
              </p>
            </div>
            <button
              onClick={() => navigate('/membership?mode=login', { replace: true })}
              className="btn-primary w-full py-5 text-[10px] uppercase tracking-[0.4em] font-black"
            >
              Go to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
