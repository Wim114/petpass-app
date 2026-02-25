import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/auth/reset-password', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-slate-600 mt-4">Processing authentication...</p>
      </div>
    </div>
  );
}
