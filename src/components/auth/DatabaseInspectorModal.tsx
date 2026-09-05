import { useState } from 'react';
import { useAuth, type User } from '@/context/AuthContext';
import { Database, X, Check, RefreshCw, UserCheck, Shield, Mail, Calendar, Key } from 'lucide-react';

export function DatabaseInspectorModal() {
  const { isDbModalOpen, setIsDbModalOpen, availableUsers, refreshUsers, quickLogin, user: currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  if (!isDbModalOpen) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUsers();
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-[hsl(var(--foreground))]">Database Users Assessment</h2>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Live records stored in <code className="rounded bg-[hsl(var(--muted))] px-1 py-0.5 font-mono-app text-[10px]">data/db.json</code> ({availableUsers.length} users found)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
              title="Refresh database records"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsDbModalOpen(false)}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl border border-[hsl(var(--sidebar-primary)/.35)] bg-[hsl(var(--sidebar-primary)/.1)] p-3 text-[12px] text-[hsl(var(--foreground))]">
            <div className="flex items-center gap-2 font-semibold">
              <Key className="h-4 w-4 text-[hsl(var(--primary))]" /> Testing Access Mode Active
            </div>
            <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              All accounts below have full test access enabled with standard testing password <code className="font-mono-app font-bold text-[hsl(var(--primary))]">password123</code>. Click any user below to instantly switch sessions and verify role permissions.
            </p>
          </div>

          <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
            {availableUsers.map((item: User) => {
              const isActive = currentUser?.email.toLowerCase() === item.email.toLowerCase();
              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors ${
                    isActive ? 'bg-[hsl(var(--primary)/.06)]' : 'hover:bg-[hsl(var(--muted)/.5)]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary)/.14)] font-mono-app text-[12px] font-bold text-[hsl(var(--primary))]">
                      {item.avatar || item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[hsl(var(--foreground))] truncate">{item.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 font-mono-app text-[9px] font-bold uppercase text-[hsl(var(--primary-foreground))]">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                        {item.provider === 'google' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.15)] px-2 py-0.5 font-mono-app text-[9px] font-medium text-[hsl(var(--accent-foreground))]">
                            Google Auth
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {item.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Role: <strong className="text-[hsl(var(--foreground))] capitalize">{item.role}</strong>
                        </span>
                        {item.createdAt && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        quickLogin(item);
                        setIsDbModalOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                        isActive
                          ? 'border border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]'
                          : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110 shadow-sm'
                      }`}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isActive ? 'Current session' : 'Switch to user'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] px-6 py-3 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span>Security status: Standard testing mode</span>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="rounded-lg bg-[hsl(var(--card))] px-3 py-1.5 font-medium border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
