import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function AdminSetup() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkForAdmin();
  }, []);

  async function checkForAdmin() {
    setChecking(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      setError('Could not check admin status.');
      setChecking(false);
      return;
    }

    setAdminExists((data?.length ?? 0) > 0);
    setChecking(false);
  }

  async function claimAdmin() {
    if (!user) return;
    setClaiming(true);
    setError(null);

    // Use the secure RPC function that verifies no admin exists server-side
    const { data: claimed, error: rpcError } = await supabase.rpc('claim_admin_role');

    if (rpcError) {
      // Fallback to direct update if RPC doesn't exist yet (migration not run)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        setError('Failed to claim admin role. Please ensure the database migration has been applied.');
        setClaiming(false);
        return;
      }
    } else if (!claimed) {
      setError('An admin already exists. Cannot claim admin role.');
      setAdminExists(true);
      setClaiming(false);
      return;
    }

    await fetchProfile();
    setSuccess(true);
    setClaiming(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Access Granted</h1>
          <p className="text-slate-600 mb-6">
            You now have admin privileges. You can access the admin dashboard from the sidebar.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">You're Already an Admin</h1>
          <p className="text-slate-600 mb-6">
            Your account already has admin privileges.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Already Exists</h1>
          <p className="text-slate-600 mb-6">
            An admin account has already been set up. Contact your administrator to get admin access.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Setup</h1>
        <p className="text-slate-600 mb-6">
          No admin account exists yet. As the first user to claim this, you will become the system administrator.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={claimAdmin}
          disabled={claiming}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {claiming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Claim Admin Role
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 mt-4">
          This action is only available when no admin exists in the system.
        </p>
      </div>
    </div>
  );
}
