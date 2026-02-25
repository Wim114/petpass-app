import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, ChevronLeft, ChevronRight, Mail, Globe, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';

interface WaitlistEntry {
  id: string;
  email: string;
  district: string | null;
  language: string | null;
  source: string | null;
  created_at: string;
}

const PAGE_SIZE = 15;

export default function WaitlistManager() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ['admin-waitlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        (e.email ?? '').toLowerCase().includes(q) ||
        (e.district ?? '').toLowerCase().includes(q) ||
        (e.language ?? '').toLowerCase().includes(q) ||
        (e.source ?? '').toLowerCase().includes(q)
    );
  }, [entries, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ['Email', 'District', 'Language', 'Source', 'Signed Up'];
    const rows = filtered.map((e) => [
      e.email,
      e.district ?? '',
      e.language ?? '',
      e.source ?? '',
      e.created_at ? format(new Date(e.created_at), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `petpass-waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Waitlist</h2>
          <p className="mt-1 text-sm text-slate-500">
            {entries.length} {entries.length === 1 ? 'person' : 'people'} on the waitlist
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search email, district, source..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    District
                  </div>
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Language
                  </div>
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">Source</th>
                <th className="px-5 py-3 font-medium text-slate-500">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                      Loading waitlist...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    {search ? 'No entries match your search.' : 'No waitlist entries yet.'}
                  </td>
                </tr>
              ) : (
                paginated.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">{entry.email}</td>
                    <td className="px-5 py-3 text-slate-600">{entry.district || '-'}</td>
                    <td className="px-5 py-3">
                      {entry.language ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {entry.language.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {entry.source ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {entry.source}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {entry.created_at
                        ? format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm')
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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
