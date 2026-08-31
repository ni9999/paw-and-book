import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  DollarSign,
  FileText,
  Filter,
  Heart,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  PawPrint,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getGetCalendarQueryKey,
  getGetCustomersQueryKey,
  getGetDashboardQueryKey,
  getGetInventoryQueryKey,
  getGetJobsQueryKey,
  getGetReportsQueryKey,
  getGetServicesQueryKey,
  getGetStaffQueryKey,
  useCompleteAttention,
  useCreatePurchaseOrder,
  useGetCalendar,
  useGetCustomers,
  useGetDashboard,
  useGetInventory,
  useGetJobs,
  useGetReports,
  useGetServices,
  useGetStaff,
  useUpdateJobStatus,
} from '@workspace/api-client-react';
import type {
  Appointment,
  AttentionItem,
  Customer,
  Dashboard,
  InventoryItem,
  Job,
  JobStatusInputStatus,
  JobsBoard,
  Reports,
  Service,
  StaffMember,
  TimelineBlock,
  Utilization,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Link, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Icon = LucideIcon;

const navItems: Array<{ label: string; href: string; icon: Icon; end?: boolean }> = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, end: true },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Jobs', href: '/jobs', icon: ClipboardList },
  { label: 'Customers', href: '/customers', icon: UsersRound },
  { label: 'Retail', href: '/retail', icon: ShoppingBag },
  { label: 'Staff', href: '/staff', icon: UserRound },
  { label: 'Services', href: '/services', icon: PawPrint },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

const serviceTone: Record<string, string> = {
  walk: 'tone-pine',
  groom: 'tone-coral',
  board: 'tone-amber',
  retail: 'tone-lilac',
};

function Logo() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-logo">
      <div className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar)] shadow-[0_4px_0_hsl(var(--sidebar-primary)/.25)]">
        <BookOpen className="h-[18px] w-[18px]" strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
      </div>
      <div>
        <div className="font-display text-[18px] leading-none tracking-[-.03em] text-[hsl(var(--sidebar-foreground))]">Paw<span className="text-[hsl(var(--sidebar-primary))]">&</span>Book</div>
        <div className="mt-1 font-mono-app text-[8px] uppercase tracking-[.19em] text-[hsl(var(--sidebar-foreground)/.5)]">Owner console</div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();
  const pageName = navItems.find((item) => item.href === location)?.label ?? 'Overview';
  return (
    <div className="noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[242px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-200 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between"><Logo /><button onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-[hsl(var(--sidebar-foreground)/.65)] md:hidden" aria-label="Close menu" data-testid="button-close-menu"><X className="h-5 w-5" /></button></div>
        <div className="mb-3 px-3 font-mono-app text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.38)]">Riverside branch</div>
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ label, href, icon: NavIcon, end }) => {
            const active = end ? location === href : location.startsWith(href);
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-accent)/.7)] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-nav-${label.toLowerCase()}`}>
              <NavIcon className={`h-[17px] w-[17px] ${active ? 'stroke-[2.5px]' : ''}`} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />}
            </Link>;
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-[hsl(var(--sidebar-foreground)/.11)] bg-[hsl(var(--sidebar-foreground)/.05)] p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-[hsl(var(--sidebar-primary))]"><Sparkles className="h-3.5 w-3.5" /> Today at a glance</div>
            <p className="text-[12px] leading-5 text-[hsl(var(--sidebar-foreground)/.62)]">The Riverside team has a full, good day ahead.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-[hsl(var(--sidebar-foreground)/.1)] pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--sidebar-primary)/.18)] font-mono-app text-[11px] font-medium text-[hsl(var(--sidebar-primary))]">RK</div>
            <div className="min-w-0"><div className="truncate text-[12px] font-semibold">Rina K.</div><div className="truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.45)]">Branch owner</div></div>
            <button className="ml-auto text-[hsl(var(--sidebar-foreground)/.4)]" aria-label="Open account menu" data-testid="button-account-menu"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-[hsl(var(--sidebar)/.45)] md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" data-testid="button-navigation-overlay" />}
      <div className="md:pl-[242px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur-md md:px-9">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-[hsl(var(--muted))] md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu className="h-5 w-5" /></button><div className="text-[12px] text-[hsl(var(--muted-foreground))]"><span className="hidden sm:inline">Riverside / </span><span className="font-semibold text-[hsl(var(--foreground))]">{pageName}</span></div></div>
          <div className="flex items-center gap-2.5"><button onClick={() => toast({ title: 'You are all caught up', description: 'No new branch messages.' })} className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" aria-label="View notifications" data-testid="button-notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /></button><div className="hidden h-5 w-px bg-[hsl(var(--border))] sm:block" /><button onClick={() => toast({ title: 'Rina K.', description: 'Branch owner · Riverside' })} className="hidden items-center gap-2 sm:flex"><div className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--primary)/.1)] font-mono-app text-[10px] font-medium text-[hsl(var(--primary))]">RK</div><span className="text-[12px] font-semibold">Rina</span><ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" /></button></div>
        </header>
        <main className="shell-grid min-h-[calc(100dvh-70px)] px-5 py-7 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action, actionTestId }: { eyebrow: string; title: string; description?: string; action?: ReactNode; actionTestId?: string }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 font-mono-app text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />{eyebrow}</div><h1 className="font-display text-[35px] leading-[1.02] tracking-[-.045em] text-[hsl(var(--foreground))] md:text-[42px]">{title}</h1>{description && <p className="mt-2 text-[13px] text-[hsl(var(--muted-foreground))]">{description}</p>}</div>{action && <div data-testid={actionTestId}>{action}</div>}</div>;
}

function Button({ children, onClick, variant = 'primary', icon: ButtonIcon, testId, type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'outline' | 'danger'; icon?: Icon; testId: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px] font-bold transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variant === 'primary' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_0_hsl(var(--primary)/.25)] hover:brightness-110' : variant === 'danger' ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.16)]' : variant === 'outline' ? 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/.4)] hover:bg-[hsl(var(--muted))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}>{ButtonIcon && <ButtonIcon className="h-4 w-4" />}{children}</button>;
}

function Card({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) {
  return <section className={`rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[0_1px_0_hsl(var(--foreground)/.015)] ${className}`} data-testid={testId}>{children}</section>;
}

function SectionHead({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-[14px] font-bold tracking-[-.01em]">{title}</h2>{detail && <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{detail}</p>}</div>{action}</div>;
}

function Initials({ value, tone = 'pine' }: { value: string; tone?: string }) {
  return <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] font-mono-app text-[10px] font-medium ${tone === 'coral' ? 'bg-[hsl(var(--accent)/.15)] text-[hsl(var(--accent-foreground))]' : tone === 'amber' ? 'bg-[hsl(var(--sidebar-primary)/.23)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary)/.11)] text-[hsl(var(--primary))]'}`}>{value}</div>;
}

function Status({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' | 'neutral' | 'coral' }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono-app text-[9px] font-medium uppercase tracking-[.06em] ${tone === 'green' ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : tone === 'amber' ? 'bg-[hsl(var(--sidebar-primary)/.2)] text-[hsl(var(--primary))]' : tone === 'red' ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : tone === 'coral' ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

function DataState({ loading, error, empty, onRetry, children }: { loading: boolean; error: boolean; empty: boolean; onRetry: () => void; children: ReactNode }) {
  if (loading) return <div className="space-y-4" data-testid="state-loading"><div className="h-28 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-52 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /></div>;
  if (error) return <Card className="p-10 text-center" testId="state-error"><CircleAlert className="mx-auto mb-3 h-7 w-7 text-[hsl(var(--destructive))]" /><h3 className="text-[14px] font-bold">Could not load this view</h3><p className="mx-auto mt-1 max-w-sm text-[12px] text-[hsl(var(--muted-foreground))]">The console could not reach the branch records. Try again in a moment.</p><Button onClick={onRetry} variant="outline" icon={RefreshCw} testId="button-retry">Try again</Button></Card>;
  if (empty) return <Card className="p-10 text-center" testId="state-empty"><div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--muted))]"><PawPrint className="h-5 w-5 text-[hsl(var(--muted-foreground))]" /></div><h3 className="text-[14px] font-bold">Nothing here yet</h3><p className="mt-1 text-[12px] text-[hsl(var(--muted-foreground))]">New branch activity will appear in this space.</p></Card>;
  return <>{children}</>;
}

function KpiCard({ label, value, detail, tone, index }: { label: string; value: string; detail: string; tone: string; index: number }) {
  const up = tone === 'up';
  const down = tone === 'down';
  return <Card className={`animate-in stagger-${Math.min(index + 1, 4)} relative overflow-hidden p-4`} testId={`card-kpi-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-start justify-between"><span className="font-mono-app text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{label}</span><div className={`grid h-6 w-6 place-items-center rounded-md ${up ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : down ? 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{up ? <ArrowUpRight className="h-3.5 w-3.5" /> : down ? <ArrowDownRight className="h-3.5 w-3.5" /> : <span className="h-1 w-3 rounded-full bg-current" />}</div></div><div className="mt-3 font-display text-[27px] leading-none tracking-[-.04em]" data-testid={`text-kpi-value-${index}`}>{value}</div><div className={`mt-2 text-[11px] ${up ? 'text-[hsl(var(--primary))]' : down ? 'text-[hsl(var(--accent-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{detail}</div><div className={`absolute -bottom-7 -right-4 h-16 w-16 rounded-full opacity-30 ${up ? 'bg-[hsl(var(--primary)/.14)]' : 'bg-[hsl(var(--accent)/.1)]'}`} /></Card>;
}

function DashboardPage() {
  const { data, isLoading, isError, refetch } = useGetDashboard();
  const [showBooking, setShowBooking] = useState(false);
  return <PageFrame><PageHeader eyebrow="Monday · 09 October 2023" title="Good morning, Rina." description="Here is the shape of your Riverside branch today." action={<Button onClick={() => setShowBooking(true)} icon={Plus} testId="button-new-booking">New booking</Button>} actionTestId="header-action-new-booking" /><DataState loading={isLoading} error={isError} empty={!data} onRetry={refetch}>{data && <DashboardContent data={data} />}</DataState>{showBooking && <BookingPanel onClose={() => setShowBooking(false)} />}</PageFrame>;
}

function DashboardContent({ data }: { data: Dashboard }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const completeAttention = useCompleteAttention();
  const [completed, setCompleted] = useState<string[]>([]);
  const visibleAttention = data.attention.filter((item) => !completed.includes(item.id));
  const handleComplete = (item: AttentionItem) => completeAttention.mutate({ id: item.id }, { onSuccess: () => { setCompleted((current) => [...current, item.id]); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); toast({ title: 'Attention cleared', description: item.title }); }, onError: () => toast({ title: 'Could not clear item', variant: 'destructive' }) });
  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.kpis.map((kpi, i) => <KpiCard key={kpi.label} {...kpi} index={i} />)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
      <Card className="animate-in p-5 md:p-6" testId="card-today-timeline"><SectionHead title="Today in motion" detail="Monday · 09 October" action={<Status tone="green">Live day</Status>} /><div className="relative overflow-x-auto pb-1"><div className="min-w-[620px]"><div className="mb-3 ml-[55px] grid grid-cols-7 font-mono-app text-[9px] text-[hsl(var(--muted-foreground))]"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span></div><div className="relative h-[190px]"><div className="absolute bottom-0 left-[55px] right-0 top-0 grid grid-cols-7">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="border-l border-dashed border-[hsl(var(--border)/.8)]" />)}</div>{data.timeline.map((block: TimelineBlock) => <TimelineBlockView key={block.id} block={block} />)}</div></div></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[hsl(var(--border)/.7)] pt-4">{[['walk', 'Walks'], ['groom', 'Grooming'], ['board', 'Daycare'], ['retail', 'Retail']].map(([tone, label]) => <div key={tone} className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span className={`h-2 w-2 rounded-sm ${tone === 'walk' ? 'bg-[hsl(var(--primary))]' : tone === 'groom' ? 'bg-[hsl(var(--accent))]' : tone === 'board' ? 'bg-[hsl(var(--sidebar-primary))]' : 'bg-[#9b87a9]'}`} />{label}</div>)}</div></Card>
      <Card className="animate-in stagger-1 p-5 md:p-6" testId="card-attention"><SectionHead title="Needs your attention" detail={`${visibleAttention.length} open ${visibleAttention.length === 1 ? 'item' : 'items'}`} action={<CircleAlert className="h-4 w-4 text-[hsl(var(--accent))]" />} /><div className="space-y-2">{visibleAttention.length ? visibleAttention.map((item) => <AttentionRow key={item.id} item={item} onComplete={() => handleComplete(item)} />) : <div className="rounded-xl bg-[hsl(var(--primary)/.07)] p-4 text-center text-[12px] text-[hsl(var(--primary))]"><Check className="mx-auto mb-2 h-5 w-5" />All clear for now.</div>}</div></Card>
    </div>
    <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
      <Card className="p-5 md:p-6" testId="card-revenue"><SectionHead title="Revenue pulse" detail="Last 7 days" action={<Link href="/reports" className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--primary))]" data-testid="link-revenue-report">Full report <ChevronRight className="h-3.5 w-3.5" /></Link>} /><div className="flex h-[152px] items-end gap-2 pt-4">{data.revenue.map((bar) => <div key={bar.label} className="group flex flex-1 flex-col items-center gap-2" data-testid={`bar-revenue-${bar.label}`}><div className={`relative w-full rounded-t-[5px] transition-all group-hover:opacity-80 ${bar.peak ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary)/.22)]'}`} style={{ height: `${Math.max(bar.value, 8)}%` }}><span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-mono-app text-[9px] opacity-0 transition-opacity group-hover:opacity-100">{bar.value}</span></div><span className="font-mono-app text-[9px] text-[hsl(var(--muted-foreground))]">{bar.label}</span></div>)}</div></Card>
      <Card className="p-5 md:p-6" testId="card-utilization"><SectionHead title="Capacity & care" detail="Where the team is spending time" action={<Settings2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />} /><div className="grid gap-5 sm:grid-cols-3">{data.utilization.map((item) => <UtilizationItem key={item.label} item={item} />)}</div><div className="mt-5 flex items-center gap-2 rounded-lg bg-[hsl(var(--muted)/.7)] px-3 py-2.5 text-[11px] text-[hsl(var(--muted-foreground))]"><TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> Utilization is tracking <strong className="text-[hsl(var(--foreground))]">ahead of last Monday</strong></div></Card>
    </div>
  </div>;
}

function PageFrame({ children }: { children: ReactNode }) { return <div className="mx-auto max-w-[1440px]">{children}</div>; }
function TimelineBlockView({ block }: { block: TimelineBlock }) {
  const left = `${Math.max(0, ((block.start - 8) / 12) * 100)}%`;
  const width = `${Math.max(7, ((block.end - block.start) / 12) * 100)}%`;
  const top = block.type === 'retail' ? '126px' : block.type === 'board' ? '86px' : block.type === 'groom' ? '45px' : '5px';
  const tone = serviceTone[block.type] ?? 'tone-pine';
  return <div className={`absolute h-[29px] overflow-hidden rounded-md px-2.5 py-1.5 text-[10px] font-bold ${tone === 'tone-coral' ? 'bg-[hsl(var(--accent)/.2)] text-[hsl(var(--accent-foreground))]' : tone === 'tone-amber' ? 'bg-[hsl(var(--sidebar-primary)/.3)] text-[hsl(var(--primary))]' : tone === 'tone-lilac' ? 'bg-[#9b87a9]/20 text-[#6e587d]' : 'bg-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))]'}`} style={{ left, width, top }} data-testid={`timeline-block-${block.id}`}>{block.live && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />}{block.label}</div>;
}
function AttentionRow({ item, onComplete }: { item: AttentionItem; onComplete: () => void }) {
  const color = item.tone === 'brick' ? 'text-[hsl(var(--destructive))]' : item.tone === 'amber' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--accent-foreground))]';
  return <div className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.45)]" data-testid={`attention-item-${item.id}`}><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] ${color}`}><CircleAlert className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-[11px] font-bold">{item.title}</div><div className="mt-0.5 truncate text-[10px] text-[hsl(var(--muted-foreground))]">{item.meta}</div></div><button onClick={onComplete} className="rounded-md px-2 py-1 text-[10px] font-bold text-[hsl(var(--primary))] opacity-0 transition-opacity hover:bg-[hsl(var(--primary)/.1)] group-hover:opacity-100" data-testid={`button-complete-attention-${item.id}`}>{item.action}</button></div>;
}
function UtilizationItem({ item }: { item: Utilization }) { return <div data-testid={`utilization-${item.label}`}><div className="flex items-end justify-between"><span className="text-[11px] text-[hsl(var(--muted-foreground))]">{item.label}</span><span className="font-display text-[24px]">{item.display}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${item.value}%` }} /></div></div>; }

function CalendarPage() {
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const params = useMemo(() => ({ search: search || undefined, service: service === 'all' ? undefined : service }), [search, service]);
  const query = useGetCalendar(params, { query: { queryKey: getGetCalendarQueryKey(params) } });
  const [showBooking, setShowBooking] = useState(false);
  return <PageFrame><PageHeader eyebrow="Schedule · Week 41" title="Calendar" description="A clear view of every pet in your care this week." action={<Button onClick={() => setShowBooking(true)} icon={Plus} testId="button-calendar-new-booking">New booking</Button>} /><div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pet, service or staff" className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-10 pr-3 text-[12px] outline-none ring-[hsl(var(--primary))] focus:ring-2" data-testid="input-calendar-search" /></div><div className="flex items-center gap-2 overflow-x-auto">{['all', 'walk', 'groom', 'board', 'retail'].map((item) => <button onClick={() => setService(item)} key={item} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold capitalize ${service === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`} data-testid={`button-calendar-filter-${item}`}>{item === 'all' ? 'All services' : item}</button>)}</div><Button onClick={() => setService('all')} variant="outline" icon={Filter} testId="button-calendar-filter">Clear filters</Button></div><DataState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={query.refetch}>{query.data && <CalendarGrid appointments={query.data} />}</DataState>{showBooking && <BookingPanel onClose={() => setShowBooking(false)} />}</PageFrame>;
}

function CalendarGrid({ appointments }: { appointments: Appointment[] }) {
  const days = ['Mon 09', 'Tue 10', 'Wed 11', 'Thu 12', 'Fri 13', 'Sat 14', 'Sun 15'];
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="grid gap-3 md:grid-cols-7" data-testid="calendar-grid">{days.map((day, index) => { const dayAppointments = appointments.filter((a) => a.day.toLowerCase().includes(day.slice(0, 3).toLowerCase()) || a.day.includes(day.slice(4))); return <Card key={day} className={`${index === 0 ? 'border-[hsl(var(--primary)/.35)]' : ''} min-h-[260px] overflow-hidden`} testId={`calendar-day-${index}`}><div className={`border-b px-3 py-3 ${index === 0 ? 'border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.05)]' : 'border-[hsl(var(--border))]'}`}><div className="font-mono-app text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{day.split(' ')[0]}</div><div className={`mt-0.5 font-display text-[22px] ${index === 0 ? 'text-[hsl(var(--primary))]' : ''}`}>{day.split(' ')[1]}</div></div><div className="space-y-2 p-2">{dayAppointments.length ? dayAppointments.map((appointment) => <button key={appointment.id} onClick={() => setSelected(selected === appointment.id ? null : appointment.id)} className={`w-full rounded-lg border-l-[3px] p-2 text-left transition-colors ${appointment.type === 'groom' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : appointment.type === 'board' ? 'border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary)/.1)]' : 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]'} hover:brightness-95`} data-testid={`appointment-${appointment.id}`}><div className="font-mono-app text-[9px] text-[hsl(var(--muted-foreground))]">{appointment.time}</div><div className="mt-1 truncate text-[11px] font-bold">{appointment.pet}</div><div className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{appointment.service}</div>{selected === appointment.id && <div className="mt-2 border-t border-current/10 pt-2 text-[10px] text-[hsl(var(--muted-foreground))]">{appointment.staff} · {appointment.type}</div>}</button>) : <div className="px-2 py-6 text-center text-[10px] text-[hsl(var(--muted-foreground)/.7)]">No bookings</div>}</div></Card>; })}</div>;
}
function BookingPanel({ onClose }: { onClose: () => void }) { const [saved, setSaved] = useState(false); return <div className="fixed inset-0 z-50 grid place-items-end bg-[hsl(var(--sidebar)/.35)] sm:place-items-center"><div className="w-full max-w-md rounded-t-2xl bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-2xl">{saved ? <div className="py-8 text-center"><div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Check className="h-5 w-5" /></div><h2 className="font-display text-[24px]">Booking noted</h2><p className="mt-2 text-[12px] text-[hsl(var(--muted-foreground))]">A new booking request has been staged for the team.</p><Button onClick={onClose} variant="outline" testId="button-close-booking-success">Close</Button></div> : <><div className="mb-5 flex items-start justify-between"><div><div className="font-mono-app text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">Quick add</div><h2 className="mt-1 font-display text-[26px]">New booking</h2></div><button onClick={onClose} className="rounded-md p-1 hover:bg-[hsl(var(--muted))]" aria-label="Close booking form" data-testid="button-close-booking"><X className="h-5 w-5" /></button></div><div className="space-y-3"><input placeholder="Pet name" className="field" data-testid="input-booking-pet" /><input placeholder="Service" className="field" data-testid="input-booking-service" /><input placeholder="Date and time" className="field" data-testid="input-booking-date" /></div><div className="mt-5 flex justify-end gap-2"><Button onClick={onClose} variant="quiet" testId="button-cancel-booking">Cancel</Button><Button onClick={() => setSaved(true)} testId="button-save-booking">Save booking</Button></div></>}</div></div>; }

function JobsPage() {
  const [service, setService] = useState('all');
  const params = useMemo(() => ({ service: service === 'all' ? undefined : service }), [service]);
  const query = useGetJobs(params, { query: { queryKey: getGetJobsQueryKey(params) } }); const { toast } = useToast();
  return <PageFrame><PageHeader eyebrow="Operations · Live board" title="Jobs board" description="Keep today moving with quick, calm decisions." action={<Button onClick={() => toast({ title: 'Board settings', description: 'Your live board is set to Riverside local time.' })} icon={SlidersHorizontal} variant="outline" testId="button-jobs-settings">Board settings</Button>} /><div className="mb-5 flex flex-wrap items-center gap-2">{['all', 'walk', 'groom', 'board', 'retail'].map((item) => <button key={item} onClick={() => setService(item)} className={`rounded-lg px-3.5 py-2 text-[11px] font-bold capitalize ${service === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`} data-testid={`button-jobs-service-${item}`}>{item === 'all' ? 'All jobs' : item}</button>)}</div><DataState loading={query.isLoading} error={query.isError} empty={!query.data || Object.values(query.data).every((list) => !list.length)} onRetry={query.refetch}>{query.data && <JobsBoardView board={query.data} />}</DataState></PageFrame>;
}
function JobsBoardView({ board }: { board: JobsBoard }) {
  const queryClient = useQueryClient(); const { toast } = useToast(); const updateStatus = useUpdateJobStatus();
  const columns: Array<{ label: string; key: keyof JobsBoard; tone: 'neutral' | 'amber' | 'green' | 'red'; next?: JobStatusInputStatus; action?: string }> = [{ label: 'Scheduled', key: 'scheduled', tone: 'neutral', next: 'in_progress', action: 'Start' }, { label: 'In progress', key: 'inProgress', tone: 'amber', next: 'completed', action: 'Complete' }, { label: 'Completed', key: 'completed', tone: 'green' }, { label: 'Needs attention', key: 'issues', tone: 'red', next: 'completed', action: 'Resolve' }];
  const move = (job: Job, next: JobStatusInputStatus) => updateStatus.mutate({ id: job.id, data: { status: next } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetJobsQueryKey() }); toast({ title: 'Job updated', description: `${job.pet} moved to ${next.replace('_', ' ')}` }); }, onError: () => toast({ title: 'Could not update job', variant: 'destructive' }) });
  return <div className="grid gap-4 xl:grid-cols-4" data-testid="jobs-board">{columns.map((column) => <Card key={column.key} className="min-h-[330px] bg-[hsl(var(--card)/.75)] p-3" testId={`jobs-column-${column.key}`}><div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${column.tone === 'red' ? 'bg-[hsl(var(--destructive))]' : column.tone === 'amber' ? 'bg-[hsl(var(--sidebar-primary))]' : column.tone === 'green' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'}`} /><h2 className="text-[12px] font-bold">{column.label}</h2><span className="font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">{board[column.key].length}</span></div><MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" /></div><div className="space-y-2">{board[column.key].map((job) => <JobCard key={job.id} job={job} action={column.action} next={column.next} onMove={move} />)}</div>{!board[column.key].length && <div className="mt-10 text-center text-[11px] text-[hsl(var(--muted-foreground))]">No jobs in this lane</div>}</Card>)}</div>;
}
function JobCard({ job, action, next, onMove }: { job: Job; action?: string; next?: JobStatusInputStatus; onMove: (job: Job, next: JobStatusInputStatus) => void }) { return <div className={`rounded-xl border bg-[hsl(var(--card))] p-3 shadow-[0_2px_0_hsl(var(--foreground)/.025)] ${job.issue ? 'border-[hsl(var(--destructive)/.35)]' : 'border-[hsl(var(--border))]'}`} data-testid={`job-card-${job.id}`}><div className="flex items-start justify-between"><div className="font-mono-app text-[10px] text-[hsl(var(--primary))]">{job.time}</div>{job.issue && <CircleAlert className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />}</div><div className="mt-2 text-[13px] font-bold">{job.pet}</div><div className="mt-0.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{job.detail}</div><div className="mt-3 flex items-center gap-2 border-t border-[hsl(var(--border)/.7)] pt-2.5"><Initials value={job.staff.split(' ').map((part) => part[0]).join('').slice(0, 2)} /><span className="flex-1 truncate text-[10px] text-[hsl(var(--muted-foreground))]">{job.staff}</span>{action && next && <button onClick={() => onMove(job, next)} className="rounded-md bg-[hsl(var(--primary)/.1)] px-2 py-1.5 text-[10px] font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.17)]" data-testid={`button-job-${action.toLowerCase()}-${job.id}`}>{action}</button>}</div></div>; }

function CustomersPage() {
  const [search, setSearch] = useState(''); const [segment, setSegment] = useState('all');
  const params = useMemo(() => ({ search: search || undefined, segment: segment === 'all' ? undefined : segment }), [search, segment]);
  const query = useGetCustomers(params, { query: { queryKey: getGetCustomersQueryKey(params) } }); const { toast } = useToast();
  return <PageFrame><PageHeader eyebrow="Relationships · 164 active" title="Customers" description="Know the people behind every happy tail." action={<Button onClick={() => toast({ title: 'Add customer', description: 'Customer intake is ready for the next branch session.' })} icon={Plus} testId="button-new-customer">Add customer</Button>} /><Card className="overflow-hidden" testId="card-customers"><div className="flex flex-col gap-3 border-b border-[hsl(var(--border))] p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, pet or note" className="field pl-10" data-testid="input-customer-search" /></div><div className="flex gap-1.5 overflow-x-auto">{['all', 'loyal', 'new', 'at risk'].map((item) => <button key={item} onClick={() => setSegment(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold capitalize ${segment === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`} data-testid={`button-customer-segment-${item.replace(' ', '-')}`}>{item === 'all' ? 'Everyone' : item}</button>)}</div></div><DataState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={query.refetch}>{query.data && <CustomerTable customers={query.data} />}</DataState></Card></PageFrame>;
}
function CustomerTable({ customers }: { customers: Customer[] }) { const { toast } = useToast(); return <div className="divide-y divide-[hsl(var(--border)/.7)]">{customers.map((customer) => <div key={customer.id} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[hsl(var(--muted)/.45)] md:px-5" data-testid={`customer-row-${customer.id}`}><Initials value={customer.initials} tone={customer.segment.toLowerCase().includes('new') ? 'coral' : 'pine'} /><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold">{customer.name}</div><div className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{customer.pet} · {customer.detail}</div></div><div className="hidden w-28 text-[11px] text-[hsl(var(--muted-foreground))] sm:block">{customer.segment}</div><div className="w-24 text-right font-mono-app text-[11px] font-medium">{customer.lifetimeValue}</div><button onClick={() => toast({ title: customer.name, description: `${customer.pet} · ${customer.detail}` })} className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))]" aria-label={`Open ${customer.name}`} data-testid={`button-open-customer-${customer.id}`}><ChevronRight className="h-4 w-4" /></button></div>)}</div>; }

function RetailPage() {
  const query = useGetInventory({ query: { queryKey: getGetInventoryQueryKey() } }); const [showOrder, setShowOrder] = useState(false);
  return <PageFrame><PageHeader eyebrow="Retail · Stock room" title="Retail" description="Keep the shelves ready for the next good recommendation." action={<Button onClick={() => setShowOrder(true)} icon={Plus} testId="button-create-purchase-order">Create purchase order</Button>} /><DataState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={query.refetch}>{query.data && <InventoryTable items={query.data} />}</DataState>{showOrder && <PurchaseOrderPanel items={query.data ?? []} onClose={() => setShowOrder(false)} />}</PageFrame>;
}
function InventoryTable({ items }: { items: InventoryItem[] }) { return <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><Card className="overflow-hidden" testId="card-inventory"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5"><SectionHead title="On the shelf" detail={`${items.length} tracked items`} action={<Tag className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />} /></div><div className="divide-y divide-[hsl(var(--border)/.7)]">{items.map((item) => { const low = item.stock <= item.reorderAt; return <div key={item.sku} className="flex items-center gap-3 px-5 py-3.5" data-testid={`inventory-row-${item.sku}`}><div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--muted))]"><Package className="h-4 w-4 text-[hsl(var(--primary))]" /></div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold">{item.item}</div><div className="font-mono-app text-[9px] text-[hsl(var(--muted-foreground))]">{item.sku} · {item.category}</div></div><div className="hidden w-24 sm:block"><div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className={`h-full rounded-full ${low ? 'bg-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary))]'}`} style={{ width: `${Math.min(100, item.stock / Math.max(item.reorderAt * 2, 1) * 100)}%` }} /></div></div><div className="w-24 text-right">{low ? <Status tone="red">Reorder · {item.stock}</Status> : <div className="font-mono-app text-[11px]">{item.stock} <span className="text-[9px] text-[hsl(var(--muted-foreground))]">units</span></div>}</div></div>; })}</div></Card><Card className="p-5" testId="card-retail-mix"><SectionHead title="Sales mix" detail="Share of retail revenue" /><div className="space-y-4">{items.slice(0, 5).map((item, index) => <div key={item.sku} data-testid={`retail-mix-${item.sku}`}><div className="mb-1.5 flex justify-between text-[11px]"><span>{item.item}</span><span className="font-mono-app text-[10px]">{item.salesShare}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className={`h-full rounded-full ${index % 2 ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} style={{ width: `${item.salesShare}%` }} /></div></div>)}</div><div className="mt-5 rounded-xl bg-[hsl(var(--muted)/.7)] p-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"><DollarSign className="mb-1 h-4 w-4 text-[hsl(var(--primary))]" />Ask the team to mention the top two items at check-out this week.</div></Card></div>; }
function PurchaseOrderPanel({ items, onClose }: { items: InventoryItem[]; onClose: () => void }) { const queryClient = useQueryClient(); const { toast } = useToast(); const create = useCreatePurchaseOrder(); const [sku, setSku] = useState(items[0]?.sku ?? ''); const [quantity, setQuantity] = useState('12'); const submit = () => create.mutate({ data: { sku, quantity: Number(quantity) } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() }); toast({ title: 'Purchase order created', description: `${quantity} units added to the order queue.` }); onClose(); }, onError: () => toast({ title: 'Could not create purchase order', variant: 'destructive' }) }); return <div className="fixed inset-0 z-50 grid place-items-end bg-[hsl(var(--sidebar)/.35)] sm:place-items-center"><div className="w-full max-w-md rounded-t-2xl bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-2xl"><div className="mb-5 flex items-start justify-between"><div><div className="font-mono-app text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">Retail ops</div><h2 className="mt-1 font-display text-[26px]">Create purchase order</h2></div><button onClick={onClose} aria-label="Close purchase order" data-testid="button-close-purchase-order"><X className="h-5 w-5" /></button></div><label className="mb-1 block text-[11px] font-bold">Item<select value={sku} onChange={(e) => setSku(e.target.value)} className="field mt-1" data-testid="select-purchase-item">{items.map((item) => <option value={item.sku} key={item.sku}>{item.item} · {item.sku}</option>)}</select></label><label className="mt-3 block text-[11px] font-bold">Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="field mt-1" data-testid="input-purchase-quantity" /></label><div className="mt-5 flex justify-end gap-2"><Button onClick={onClose} variant="quiet" testId="button-cancel-purchase-order">Cancel</Button><Button onClick={submit} disabled={create.isPending || Number(quantity) < 1} testId="button-submit-purchase-order">{create.isPending ? 'Creating…' : 'Create order'}</Button></div></div></div>; }

function StaffPage() {
  const query = useGetStaff({ query: { queryKey: getGetStaffQueryKey() } }); const { toast } = useToast();
  return <PageFrame><PageHeader eyebrow="Team · Riverside" title="Staff performance" description="A quick read on workload, quality and care." action={<Button onClick={() => toast({ title: 'Add team member', description: 'Invite flow is ready for the next branch session.' })} icon={Plus} variant="outline" testId="button-add-staff">Add team member</Button>} /><DataState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={query.refetch}>{query.data && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((member, index) => <StaffCard key={member.id} member={member} index={index} />)}</div>}</DataState></PageFrame>;
}
function StaffCard({ member, index }: { member: StaffMember; index: number }) { const { toast } = useToast(); return <Card className="animate-in p-5" testId={`staff-card-${member.id}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><Initials value={member.initials} tone={index % 3 === 1 ? 'coral' : index % 3 === 2 ? 'amber' : 'pine'} /><div><div className="text-[13px] font-bold">{member.name}</div><div className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{member.role}</div></div></div><button onClick={() => toast({ title: member.name, description: `${member.jobs} jobs · ${member.rating} care rating` })} aria-label={`More options for ${member.name}`} data-testid={`button-staff-options-${member.id}`}><MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" /></button></div><div className="mt-6 grid grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-4"><div><div className="font-display text-[23px]">{member.jobs}</div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">jobs this week</div></div><div><div className="flex items-center gap-1 font-display text-[23px]">{member.rating}<Star className="h-3.5 w-3.5 fill-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]" /></div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">care rating</div></div><div><div className={`font-display text-[23px] ${member.incidents ? 'text-[hsl(var(--accent-foreground))]' : ''}`}>{member.incidents}</div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">incidents</div></div></div><div className="mt-4 flex items-center gap-2 text-[10px] text-[hsl(var(--primary))]"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, member.rating / 5 * 100)}%` }} /></div><span>{member.rating >= 4.8 ? 'Standout care' : 'On track'}</span></div></Card>; }

function ServicesPage() {
  const query = useGetServices({ query: { queryKey: getGetServicesQueryKey() } }); const [modifiers, setModifiers] = useState<Record<string, string>>({}); const [saved, setSaved] = useState<string[]>([]); const { toast } = useToast();
  return <PageFrame><PageHeader eyebrow="Catalog · Pricing" title="Services" description="Keep the menu easy to understand and easy to run." action={<Button onClick={() => toast({ title: 'Add service', description: 'New catalog services can be added from branch settings.' })} icon={Plus} testId="button-add-service">Add service</Button>} /><DataState loading={query.isLoading} error={query.isError} empty={!query.data?.length} onRetry={query.refetch}>{query.data && <div className="grid gap-4 lg:grid-cols-2">{query.data.map((service, index) => <ServiceCard key={service.id} service={service} index={index} modifier={modifiers[service.id] ?? service.modifier} onModifierChange={(value) => setModifiers((current) => ({ ...current, [service.id]: value }))} onSave={() => setSaved((current) => current.includes(service.id) ? current : [...current, service.id])} isSaved={saved.includes(service.id)} />)}</div>}</DataState></PageFrame>;
}
function ServiceCard({ service, index, modifier, onModifierChange, onSave, isSaved }: { service: Service; index: number; modifier: string; onModifierChange: (value: string) => void; onSave: () => void; isSaved: boolean }) { return <Card className="animate-in flex flex-col p-5 md:p-6" testId={`service-card-${service.id}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${index % 2 ? 'bg-[hsl(var(--accent)/.13)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}><PawPrint className="h-5 w-5" /></div><div><h2 className="text-[14px] font-bold">{service.name}</h2><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{service.detail}</p></div></div><div className="font-display text-[24px]">{service.price}</div></div><div className="mt-6 flex items-end gap-3 border-t border-[hsl(var(--border))] pt-4"><label className="flex-1 text-[10px] font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">Pricing modifier<input value={modifier} onChange={(e) => onModifierChange(e.target.value)} className="field mt-1.5 font-mono-app text-[11px]" data-testid={`input-service-modifier-${service.id}`} /></label><Button onClick={onSave} variant={isSaved ? 'quiet' : 'outline'} icon={isSaved ? Check : SlidersHorizontal} testId={`button-save-service-${service.id}`}>{isSaved ? 'Applied' : 'Apply'}</Button></div></Card>; }

function ReportsPage() {
  const query = useGetReports({ query: { queryKey: getGetReportsQueryKey() } }); const { toast } = useToast();
  return <PageFrame><PageHeader eyebrow="Insights · October" title="Reports" description="Patterns worth noticing before the week gets away." action={<Button onClick={() => toast({ title: 'Report ready', description: 'Your Riverside report is prepared for download.' })} icon={FileText} variant="outline" testId="button-export-report">Export report</Button>} /><DataState loading={query.isLoading} error={query.isError} empty={!query.data} onRetry={query.refetch}>{query.data && <ReportsContent reports={query.data} />}</DataState></PageFrame>;
}
function ReportsContent({ reports }: { reports: Reports }) { const max = Math.max(...reports.revenueByService.map((bar) => bar.value), 1); return <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><Card className="p-5 md:p-6" testId="card-report-revenue"><SectionHead title="Revenue by service" detail="October to date" action={<Status tone="green">On plan</Status>} /><div className="space-y-5">{reports.revenueByService.map((bar, index) => <div key={bar.label} data-testid={`report-service-${bar.label}`}><div className="mb-2 flex items-center justify-between text-[11px]"><span className="font-semibold">{bar.label}</span><span className="font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">${bar.value.toLocaleString()}</span></div><div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className={`h-full rounded-full ${index === 0 ? 'bg-[hsl(var(--primary))]' : index === 1 ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--sidebar-primary))]'}`} style={{ width: `${bar.value / max * 100}%` }} /></div></div>)}</div><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[hsl(var(--primary)/.07)] p-3"><div className="text-[10px] text-[hsl(var(--muted-foreground))]">Total service revenue</div><div className="mt-1 font-display text-[24px]">${reports.revenueByService.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</div></div><div className="rounded-xl bg-[hsl(var(--muted))] p-3"><div className="text-[10px] text-[hsl(var(--muted-foreground))]">Best day</div><div className="mt-1 font-display text-[24px]">Friday</div></div></div></Card><Card className="p-5 md:p-6" testId="card-report-quality"><SectionHead title="Quality & care" detail="The measures that matter at pick-up" action={<Heart className="h-4 w-4 text-[hsl(var(--accent))]" />} /><div className="space-y-6">{reports.quality.map((item) => <div key={item.label} data-testid={`report-quality-${item.label}`}><div className="mb-2 flex items-end justify-between"><span className="text-[12px] font-semibold">{item.label}</span><span className="font-display text-[25px]">{item.display}</span></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${item.value}%` }} /></div><div className="mt-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">{item.value >= 90 ? 'Holding steady above branch target' : 'A little room to improve this week'}</div></div>)}</div><div className="mt-8 flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] p-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--sidebar-primary)/.22)]"><Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" /></div><div><div className="text-[11px] font-bold">A small win to share</div><p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">Riverside care ratings have stayed above 4.7 for three weeks running.</p></div></div></Card></div>; }

function Router() { const [location] = useLocation(); return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={DashboardPage} /><Route path="/calendar" component={CalendarPage} /><Route path="/jobs" component={JobsPage} /><Route path="/customers" component={CustomersPage} /><Route path="/retail" component={RetailPage} /><Route path="/staff" component={StaffPage} /><Route path="/services" component={ServicesPage} /><Route path="/reports" component={ReportsPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>; }

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;