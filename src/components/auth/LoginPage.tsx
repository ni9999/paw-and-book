import { useState } from 'react';
import { useAuth, type User } from '@/context/AuthContext';
import {
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login, loginWithGoogle, register, quickLogin, availableUsers, isLoading, setIsDbModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('rina@example.com');
  const [password, setPassword] = useState('password123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('staff');
  const [regPassword, setRegPassword] = useState('password123');

  // Google custom dialog state
  const [customGooglePrompt, setCustomGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('alhamramzrn@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Alham Ramzrn');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(regName, regEmail, regRole, regPassword);
  };

  const handleGoogleQuick = async () => {
    await loginWithGoogle('alhamramzrn@gmail.com', 'Alham Ramzrn');
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithGoogle(googleEmailInput, googleNameInput);
    setCustomGooglePrompt(false);
  };

  return (
    <div className="noise min-h-screen flex flex-col justify-center items-center bg-[hsl(var(--background))] px-4 py-8">
      {/* Top Brand Banner */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar))] shadow-[0_4px_0_hsl(var(--sidebar-primary)/.25)]">
          <BookOpen className="h-6 w-6" strokeWidth={2.5} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[hsl(var(--accent))]" />
        </div>
        <h1 className="font-display text-[32px] md:text-[38px] leading-tight tracking-[-.03em] text-[hsl(var(--foreground))]">
          Paw<span className="text-[hsl(var(--primary))]">&</span>Book
        </h1>
        <p className="mt-1 text-[13px] text-[hsl(var(--muted-foreground))]">
          Pet Care Branch Management & Operations Console
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm">
        {/* Testing Mode Pill Notice */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[hsl(var(--sidebar-primary)/.4)] bg-[hsl(var(--sidebar-primary)/.12)] p-3 text-[11px] text-[hsl(var(--foreground))]">
          <Sparkles className="h-4 w-4 shrink-0 text-[hsl(var(--primary))] mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-[hsl(var(--primary))]">Testing Mode Enabled: </span>
            Quick logins and standard password (<code className="font-mono-app font-bold text-[hsl(var(--primary))]">password123</code>) are configured for fast software assessment.
          </div>
        </div>

        {/* Google Authentication Section */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleQuick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-[13px] font-semibold text-[hsl(var(--foreground))] shadow-xs hover:border-[hsl(var(--primary)/.5)] hover:bg-[hsl(var(--muted)/.6)] transition-all active:scale-[0.99] disabled:opacity-60"
            data-testid="button-google-login"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
            <span className="ml-auto rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono-app text-[9px] font-medium text-[hsl(var(--muted-foreground))]">
              1-Click
            </span>
          </button>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setCustomGooglePrompt(!customGooglePrompt)}
              className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
            >
              {customGooglePrompt ? 'Hide custom Google account' : 'Use different Google email address?'}
            </button>
          </div>

          {customGooglePrompt && (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)] p-3 animate-in fade-in">
              <div className="text-[11px] font-semibold text-[hsl(var(--foreground))]">Google Account Details</div>
              <input
                type="email"
                required
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="youremail@gmail.com"
                className="field text-[12px]"
              />
              <input
                type="text"
                required
                value={googleNameInput}
                onChange={(e) => setGoogleNameInput(e.target.value)}
                placeholder="Your Display Name"
                className="field text-[12px]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-[11px] font-bold text-[hsl(var(--primary-foreground))] hover:brightness-110"
              >
                Sign In With Custom Google Account
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
          <span className="font-mono-app text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            or standard login
          </span>
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        </div>

        {/* Tab Selector */}
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-[hsl(var(--muted))] p-1 text-[12px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`rounded-lg py-1.5 transition-all ${
              activeTab === 'signin'
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`rounded-lg py-1.5 transition-all ${
              activeTab === 'register'
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            Register User
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-[hsl(var(--foreground))]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pawandbook.com"
                  className="field pl-9"
                  data-testid="input-login-email"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[11px] font-bold text-[hsl(var(--foreground))]">
                  Password
                </label>
                <span className="font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">
                  test: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field pl-9"
                  data-testid="input-login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-[13px] font-bold text-[hsl(var(--primary-foreground))] shadow-[0_2px_0_hsl(var(--primary)/.25)] hover:brightness-110 active:translate-y-px transition-all disabled:opacity-60"
              data-testid="button-submit-login"
            >
              <span>{isLoading ? 'Authenticating…' : 'Sign In to Console'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-[hsl(var(--foreground))]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Taylor Reed"
                  className="field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[hsl(var(--foreground))]">
                Branch Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="taylor@pawandbook.com"
                  className="field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[hsl(var(--foreground))]">
                Assigned Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="field pl-9"
                >
                  <option value="owner">Branch Owner</option>
                  <option value="groomer">Lead Groomer</option>
                  <option value="walker">Pet Care Walker</option>
                  <option value="front_desk">Front Desk & Reception</option>
                  <option value="staff">General Staff</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[hsl(var(--foreground))]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="password123"
                  className="field pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-[13px] font-bold text-[hsl(var(--primary-foreground))] shadow-[0_2px_0_hsl(var(--primary)/.25)] hover:brightness-110 active:translate-y-px transition-all disabled:opacity-60"
            >
              <span>{isLoading ? 'Registering…' : 'Register & Save to Database'}</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* Quick Test Accounts Grid (for easy testing & database assessment) */}
      <div className="mt-8 w-full max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono-app text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            <Database className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            <span>1-Click Test Accounts from Database</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDbModalOpen(true)}
            className="flex items-center gap-1 font-mono-app text-[10px] font-bold text-[hsl(var(--primary))] hover:underline"
          >
            Assess Database ({availableUsers.length})
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableUsers.slice(0, 6).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => quickLogin(item)}
              className="flex flex-col items-start rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-left hover:border-[hsl(var(--primary)/.6)] hover:bg-[hsl(var(--muted)/.4)] transition-all shadow-2xs"
            >
              <div className="flex w-full items-center justify-between">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-[hsl(var(--primary)/.14)] font-mono-app text-[10px] font-bold text-[hsl(var(--primary))]">
                  {item.avatar || item.name.slice(0, 2)}
                </span>
                <span className="font-mono-app text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {item.role.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-2 truncate text-[12px] font-bold text-[hsl(var(--foreground))] w-full">
                {item.name}
              </div>
              <div className="truncate font-mono-app text-[9px] text-[hsl(var(--muted-foreground))] w-full">
                {item.email}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
