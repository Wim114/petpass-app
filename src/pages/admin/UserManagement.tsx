import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface AdminUserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  district: string | null;
  created_at: string;
  subscriptions: Array<{ plan: string; status: string }>;
}

const ROLES = ['member', 'admin', 'vetpro'] as const;
const PAGE_SIZE = 10;

function getDisplayName(user: AdminUserRow): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed';
}

function getActivePlan(user: AdminUserRow): string {
  const active = user.subscriptions?.find(
    (s) => s.status === 'active' || s.status === 'trialing'
  );
  return active?.plan ?? 'free';
}

const PLAN_STYLES: Record<string, string> = {
  vip: 'bg-amber-50 text-amber-700',
  care_plus: 'bg-emerald-50 text-emerald-700',
  basic: 'bg-slate-100 text-slate-600',
  free: 'bg-slate-50 text-slate-400',
};

const PLAN_LABELS: Record<string, string> = {
  vip: 'VIP',
  care_plus: 'Care+',
  basic: 'Basic',
  free: 'Free',
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: users = [], isLoading, error } = useQuery<AdminUserRow[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, district, created_at, subscriptions(plan, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as AdminUserRow[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpenDropdown(null);
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        getDisplayName(u).toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.district ?? '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} total users
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, district..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load users: {(error as Error).message}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 font-medium text-slate-500">Name</th>
                <th className="px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="px-5 py-3 font-medium text-slate-500">Role</th>
                <th className="px-5 py-3 font-medium text-slate-500">Plan</th>
                <th className="px-5 py-3 font-medium text-slate-500">District</th>
                <th className="px-5 py-3 font-medium text-slate-500">Joined</th>
                <th className="px-5 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginated.map((user) => {
                  const plan = getActivePlan(user);
                  return (
                    <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {getDisplayName(user)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{user.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700'
                              : user.role === 'vetpro'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {user.role || 'member'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_STYLES[plan] || PLAN_STYLES.free}`}>
                          {PLAN_LABELS[plan] || plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{user.district || '-'}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {user.created_at
                          ? format(new Date(user.created_at), 'dd MMM yyyy')
                          : '-'}
                      </td>
                      <td className="relative px-5 py-3">
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === user.id ? null : user.id)
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openDropdown === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-5 top-full z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                              <p className="px-3 py-1.5 text-xs font-medium text-slate-400">
                                Change Role
                              </p>
                              {ROLES.map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(user.id, role)}
                                  disabled={user.role === role}
                                  className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                                    user.role === role
                                      ? 'cursor-default bg-emerald-50 font-medium text-emerald-700'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
