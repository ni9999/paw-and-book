import { useState } from 'react';
import { useAuth, type User } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  Database,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function UserAccountMenu({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const { user, logout, setIsDbModalOpen, availableUsers, quickLogin } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = user.avatar || user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isGoogle = user.provider === 'google';

  const trigger =
    variant === 'header' ? (
      <button
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[hsl(var(--muted))] transition-colors"
        aria-label="User profile menu"
        data-testid="button-header-user-menu"
      >
        <div className="relative grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--primary)/.14)] font-mono-app text-[10px] font-bold text-[hsl(var(--primary))]">
          {initials}
          {isGoogle && (
            <span className="absolute -bottom-0.5 -right-0.5 grid h-3 w-3 place-items-center rounded-full bg-[hsl(var(--accent))] text-[7px] text-[hsl(var(--accent-foreground))] font-bold">
              G
            </span>
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[12px] font-semibold text-[hsl(var(--foreground))] leading-none">
            {user.name}
          </span>
          <span className="text-[9px] font-mono-app text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">
            {user.role.replace('_', ' ')}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
      </button>
    ) : (
      <button
        className="flex w-full items-center gap-3 rounded-xl p-1 text-left hover:bg-[hsl(var(--sidebar-foreground)/.08)] transition-colors"
        aria-label="User sidebar profile menu"
        data-testid="button-sidebar-user-menu"
      >
        <div className="relative grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--sidebar-primary)/.2)] font-mono-app text-[11px] font-bold text-[hsl(var(--sidebar-primary))] shrink-0">
          {initials}
          {isGoogle && (
            <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[hsl(var(--accent))] text-[7px] text-[hsl(var(--accent-foreground))] font-bold">
              G
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-[hsl(var(--sidebar-foreground))]">
            {user.name}
          </div>
          <div className="truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.5)] capitalize">
            {user.role.replace('_', ' ')}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-[hsl(var(--sidebar-foreground)/.4)] shrink-0" />
      </button>
    );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={variant === 'sidebar' ? 'start' : 'end'} className="w-64 p-2">
        {/* User Card Label */}
        <div className="p-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[hsl(var(--foreground))]">{user.name}</span>
            {isGoogle ? (
              <span className="rounded bg-[hsl(var(--accent)/.15)] px-1.5 py-0.5 font-mono-app text-[9px] font-medium text-[hsl(var(--accent-foreground))]">
                Google
              </span>
            ) : (
              <span className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono-app text-[9px] font-medium text-[hsl(var(--muted-foreground))]">
                Password
              </span>
            )}
          </div>
          <div className="font-mono-app text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
            {user.email}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[hsl(var(--primary))] font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="capitalize">{user.role.replace('_', ' ')} privileges</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Database assessment trigger */}
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            setIsDbModalOpen(true);
          }}
          className="cursor-pointer gap-2 py-2 text-[12px]"
          data-testid="menu-item-assess-db"
        >
          <Database className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span>Assess Database Users</span>
          <span className="ml-auto rounded bg-[hsl(var(--primary)/.1)] px-1.5 py-0.5 font-mono-app text-[9px] font-bold text-[hsl(var(--primary))]">
            {availableUsers.length}
          </span>
        </DropdownMenuItem>

        {/* Switch Account Sub-list for rapid testing */}
        {availableUsers.length > 1 && (
          <>
            <DropdownMenuLabel className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Quick Switch Role (Testing)
            </DropdownMenuLabel>
            {availableUsers
              .filter((u: User) => u.email.toLowerCase() !== user.email.toLowerCase())
              .slice(0, 3)
              .map((otherUser: User) => (
                <DropdownMenuItem
                  key={otherUser.id}
                  onClick={() => {
                    quickLogin(otherUser);
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2 py-1.5 text-[11px]"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  <span className="truncate">{otherUser.name}</span>
                  <span className="ml-auto font-mono-app text-[9px] text-[hsl(var(--muted-foreground))] capitalize">
                    {otherUser.role.replace('_', ' ')}
                  </span>
                </DropdownMenuItem>
              ))}
          </>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            logout();
          }}
          className="cursor-pointer gap-2 py-2 text-[12px] text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
          data-testid="menu-item-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
