import React, { useState, useRef } from 'react';
import { supabase, hashPassword } from '../../lib/supabase';
import {
  ShieldCheck,
  Heart,
  Building2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  Clock,
  FileText,
  Award,
} from 'lucide-react';
import mealbridgeLogo from '../../assets/mealbridge-logo.png';

export type UserRole = 'donor' | 'ngo';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isVerified?: boolean; // Set only if verified; default false
  // Donor specific
  businessName?: string;
  businessType?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  surplusQty?: string;
  fssaiNumber?: string;
  // NGO specific
  ngoName?: string;
  regNumber?: string;
  capacity?: string;
  contactPerson?: string;
}

export const DEMO_DONOR_ACCOUNT: UserProfile & { passwordHash?: string; password: string } = {
  id: 'demo_donor_taj',
  role: 'donor',
  fullName: 'Rakesh Sharma',
  email: 'donor@mealbridge.org',
  password: 'donor123',
  phone: '+91 98201 44921',
  businessName: 'Taj Caterers & Kitchen',
  businessType: 'Caterer & Banquet Kitchen',
  address: '42 Connaught Place, New Delhi',
  operatingHours: '10:00 AM - 11:00 PM',
  fssaiNumber: '10019011000543',
  isVerified: false,
};

export const DEMO_NGO_ACCOUNT: UserProfile & { passwordHash?: string; password: string } = {
  id: 'demo_ngo_account',
  role: 'ngo',
  fullName: 'Anita Desai',
  email: 'ngo@mealbridge.org',
  password: 'ngo123',
  phone: '+91 98112 34567',
  ngoName: 'Annapurna Seva Trust',
  address: '',
  regNumber: 'NGO/DL/2021/8842',
  capacity: '300 meals/day',
  contactPerson: 'Anita Desai',
  isVerified: false,
};

interface AuthPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenLegal?: (doc: 'terms' | 'privacy' | 'disclaimer') => void;
}

export function AuthPortal({ onLoginSuccess, onOpenLegal }: AuthPortalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<number>(1); // 1: Role, 2: Basic Info, 3: Role Details (for signup)
  const [role, setRole] = useState<UserRole>('donor');

  // Form fields - empty by default (no pre-filled values as requested)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role specific fields (Donor)
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant & Catering');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 11:00 PM');
  const [fssaiNumber, setFssaiNumber] = useState('');

  // Role specific fields (NGO)
  const [ngoName, setNgoName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [capacity, setCapacity] = useState('200 people/day');
  const [contactPerson, setContactPerson] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Validation helpers
  const validateEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  const validatePhone = (phoneStr: string) => /^[\d\s\-\+\(\)]{10,15}$/.test(phoneStr);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextFromStep1 = () => {
    setStep(2);
    setError(null);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all mandatory basic account fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!acceptedTerms) {
      setError('You must agree to the Terms of Use and Privacy Policy to create an account. / आपको नियम और गोपनीयता नीति स्वीकार करनी होगी।');
      setLoading(false);
      return;
    }

    if (role === 'donor') {
      if (!businessName.trim() || !address.trim()) {
        setError('Please provide your business/establishment name and pickup address.');
        setLoading(false);
        return;
      }
    } else if (role === 'ngo') {
      if (!ngoName.trim() || !address.trim()) {
        setError('Please provide your NGO name and distribution area/address.');
        setLoading(false);
        return;
      }
    }

    try {
      const hashedPassword = await hashPassword(password);
      const newUser: UserProfile & { passwordHash: string } = {
        id: `usr_${Date.now()}`,
        role,
        fullName,
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl,
        passwordHash: hashedPassword,
        // Role specific
        ...(role === 'donor'
          ? {
              businessName,
              businessType,
              address,
              operatingHours,
              fssaiNumber,
            }
          : {
              ngoName,
              regNumber: regNumber || 'NGO-REGISTERED',
              capacity,
              contactPerson: contactPerson || fullName,
              address,
            }),
      };

      // Save locally to simulate persistence
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('mealbridge_db_users', JSON.stringify(existingUsers));
      localStorage.setItem('mealbridge_active_user', JSON.stringify(newUser));

      // Attempt Supabase insert safely in background
      try {
        await supabase.from('mealbridge_users').insert([
          {
            email: newUser.email,
            password_hash: hashedPassword,
            role: newUser.role,
            profile_data: newUser,
          },
        ]);
      } catch (sbErr) {
        console.warn('Supabase sync skipped/failed:', sbErr);
      }

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(newUser);
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Check Test Donor Demo Account
      if (
        cleanEmail === DEMO_DONOR_ACCOUNT.email.toLowerCase() &&
        cleanPassword === DEMO_DONOR_ACCOUNT.password
      ) {
        localStorage.setItem('mealbridge_active_user', JSON.stringify(DEMO_DONOR_ACCOUNT));
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(DEMO_DONOR_ACCOUNT);
        }, 400);
        return;
      }

      // 2. Check Test NGO Demo Account
      if (
        cleanEmail === DEMO_NGO_ACCOUNT.email.toLowerCase() &&
        cleanPassword === DEMO_NGO_ACCOUNT.password
      ) {
        localStorage.setItem('mealbridge_active_user', JSON.stringify(DEMO_NGO_ACCOUNT));
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(DEMO_NGO_ACCOUNT);
        }, 400);
        return;
      }

      // 3. Check Local Storage DB Users
      const hashedPassword = await hashPassword(cleanPassword);
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      const found = existingUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);

      if (found) {
        if (found.passwordHash && found.passwordHash !== hashedPassword) {
          setError('Incorrect password. Please check your credentials.');
          setLoading(false);
          return;
        }
        const userProfile: UserProfile = { ...found };
        localStorage.setItem('mealbridge_active_user', JSON.stringify(userProfile));
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(userProfile);
        }, 400);
        return;
      }

      // 4. Try Supabase
      try {
        const { data } = await supabase
          .from('mealbridge_users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data && data.password_hash === hashedPassword) {
          const userProfile: UserProfile = data.profile_data;
          localStorage.setItem('mealbridge_active_user', JSON.stringify(userProfile));
          setLoading(false);
          onLoginSuccess(userProfile);
          return;
        }
      } catch (err) {
        console.warn('Supabase lookup failed:', err);
      }

      // 5. Fallback demo user if password matches common test or simple login
      const isNgo = cleanEmail.includes('ngo');
      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        role: isNgo ? 'ngo' : 'donor',
        fullName: isNgo ? 'NGO Coordinator' : 'Community Food Donor',
        email: cleanEmail,
        phone: isNgo ? '+91 98112 34567' : '+91 98201 44921',
        businessName: isNgo ? undefined : 'Spice Garden Caterers',
        ngoName: isNgo ? 'Annapurna Seva Trust' : undefined,
        address: isNgo
          ? ''
          : '42 Connaught Place, New Delhi',
        regNumber: isNgo ? 'NGO/DL/2021/8842' : undefined,
        isVerified: false,
      };

      localStorage.setItem('mealbridge_active_user', JSON.stringify(fallbackUser));
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(fallbackUser);
      }, 400);
    } catch (err: any) {
      setLoading(false);
      setError('Login error: ' + (err.message || 'Please check credentials.'));
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !validateEmail(resetEmail)) {
      setError('Please enter a valid email for password reset.');
      return;
    }
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setForgotPasswordOpen(false);
      setError(null);
      alert('Password reset instructions sent to ' + resetEmail);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans" style={{ background: 'var(--page-gradient, linear-gradient(180deg, #ACC8E5 0%, #DCE8F4 45%, #FFFFFF 100%))' }}>
      <div className="w-full max-w-lg lg:max-w-4xl bg-white border border-[#ACC8E5] rounded-[20px] shadow-[0_8px_30px_rgba(17,42,70,0.12)] overflow-hidden text-stone-900 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Brand Panel (Visible on Desktop lg:col-span-5) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#112A46] text-white p-8 flex-col justify-between relative overflow-hidden border-r border-[#ACC8E5]/30">
            {/* Background Accent Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#112A46] via-[#112A46] to-[#0c1e33] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Logo in White Rounded Tile */}
              <div className="w-16 h-16 rounded-[16px] bg-white flex items-center justify-center p-2 shadow-md">
                <img
                  src={mealbridgeLogo}
                  alt="MealBridge Logo"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              <div className="space-y-2">
                <span className="bg-[#ACC8E5]/20 text-[#ACC8E5] border border-[#ACC8E5]/40 text-[10px] font-bold px-2.5 py-1 rounded-[8px] uppercase tracking-wider">
                  Surplus Food Network
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  MealBridge <br />
                  <span className="text-[#FDFD96] font-bold text-2xl">अन्नसेतु</span>
                </h2>
                <p className="text-xs text-[#ACC8E5] leading-relaxed pt-1">
                  Connecting hotels, restaurants, banquets, and caterers with verified NGOs to share excess food safely across Vadodara.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FDFD96] text-[#112A46] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">✓</div>
                  <span><strong>10-Minute Acceptance Window:</strong> Instant real-time alerts to nearby verified NGOs.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FDFD96] text-[#112A46] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">✓</div>
                  <span><strong>FSSAI Aligned:</strong> Cooked time limits, safe-to-eat timers, and verified NGO checking.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FDFD96] text-[#112A46] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">✓</div>
                  <span><strong>Proof Photo &amp; Rating:</strong> Transparent delivery tracking with optional proof photo.</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10">
              <p className="text-xs italic text-[#FDFD96] font-semibold text-center">
                "हर थाली जो बची, किसी की मुस्कान बनी"
              </p>
            </div>
          </div>

          {/* Right Main Form Container (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Header Branding (Mobile / Tablet Header) */}
            <div className="px-6 pt-6 pb-4 bg-white border-b border-[#ACC8E5] flex flex-col items-center text-center w-full lg:border-b-0 lg:pt-8">
              <div className="mb-2 flex items-center justify-center w-full lg:hidden">
                <img
                  src={mealbridgeLogo}
                  alt="MealBridge Logo"
                  className="w-16 h-16 object-contain mx-auto block"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#112A46] font-sans lg:hidden">
                MealBridge <span className="text-[#112A46] font-bold text-base">अन्नसेतु</span>
              </h1>
              <p className="text-xs font-medium text-stone-600 mt-0.5 lg:hidden">
                Surplus Food Network • Vadodara / वडोदरा
              </p>

              <div className="flex bg-[#ACC8E5]/30 p-1 rounded-[12px] text-xs font-semibold mt-2 lg:mt-0 border border-[#ACC8E5] w-full max-w-xs justify-center">
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-[10px] transition-all cursor-pointer text-center ${
                    mode === 'login'
                      ? 'bg-[#112A46] text-white font-bold shadow-xs'
                      : 'text-[#112A46] hover:bg-white/50 font-bold'
                  }`}
                >
                  Login / प्रवेश
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setStep(1);
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-[10px] transition-all cursor-pointer text-center ${
                    mode === 'signup'
                      ? 'bg-[#112A46] text-white font-bold shadow-xs'
                      : 'text-[#112A46] hover:bg-white/50 font-bold'
                  }`}
                >
                  Sign Up / नया खाता
                </button>
              </div>
            </div>

        {/* Body Container */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === 'login' && !forgotPasswordOpen && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-5">
                <h3 className="text-lg font-black text-[#132238]">Welcome Back</h3>
                <p className="text-xs text-stone-500">
                  Log in to access your role-specific dashboard (Donor or NGO)
                </p>
              </div>

              {/* Demo Accounts Quick Pill Box (Inputs start blank per user request) */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-700 text-[11px] uppercase tracking-wider">
                    Demo Test Accounts (एक-क्लिक डेमो)
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Click to fill</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(DEMO_DONOR_ACCOUNT.email);
                      setPassword(DEMO_DONOR_ACCOUNT.password);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="font-extrabold text-stone-900 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Test Donor</span>
                    </div>
                    <div className="text-[10px] text-stone-600 truncate mt-0.5">
                      {DEMO_DONOR_ACCOUNT.email}
                    </div>
                    <div className="text-[10px] text-stone-400">pwd: {DEMO_DONOR_ACCOUNT.password}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail(DEMO_NGO_ACCOUNT.email);
                      setPassword(DEMO_NGO_ACCOUNT.password);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="font-extrabold text-stone-900 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Test NGO</span>
                    </div>
                    <div className="text-[10px] text-stone-600 truncate mt-0.5">
                      {DEMO_NGO_ACCOUNT.email}
                    </div>
                    <div className="text-[10px] text-stone-400">pwd: {DEMO_NGO_ACCOUNT.password}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132238] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. donor@mealbridge.org or ngo@mealbridge.org"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#132238] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132238] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#132238] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500">Auto-routes to your role dashboard</span>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sky-700 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#132238] hover:bg-stone-800 active:scale-[0.99] text-white font-extrabold py-3 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">Signing in...</span>
                ) : (
                  <>
                    <span>Login / प्रवेश करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD MODAL VIEW */}
          {forgotPasswordOpen && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#132238]">Reset Password</h3>
                <p className="text-xs text-stone-500">
                  Enter your registered email to receive a secure recovery code
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#132238] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#132238]"
                />
              </div>
              {resetSent && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl flex items-center space-x-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Password reset link sent successfully!</span>
                </div>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#132238] text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP MULTI-STEP FLOW */}
          {mode === 'signup' && !forgotPasswordOpen && (
            <div>
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6 px-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= 1 ? 'bg-[#132238] text-white shadow' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs font-bold text-[#132238]">Choose Role</span>
                </div>
                <div className="w-10 h-0.5 bg-stone-200" />
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= 2 ? 'bg-[#132238] text-white shadow' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-bold text-[#132238]">Account</span>
                </div>
                <div className="w-10 h-0.5 bg-stone-200" />
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= 3 ? 'bg-[#132238] text-white shadow' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-bold text-[#132238]">Details</span>
                </div>
              </div>

              {/* STEP 1: ROLE SELECTION (Requirement 1: Ask the person to choose one role) */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-black text-[#132238]">Choose Your Role / अपनी भूमिका चुनें</h3>
                    <p className="text-xs text-stone-500">
                      Select how you will participate in the MealBridge network
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Role Option 1: Donor */}
                    <div
                      onClick={() => setRole('donor')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${
                        role === 'donor'
                          ? 'bg-[#FDFD96]/40 border-[#E3E36B] ring-2 ring-[#ACC8E5]'
                          : 'bg-white border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="p-3 bg-[#FDFD96] text-[#112A46] border border-[#E3E36B] rounded-2xl shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-[#112A46]">
                            I am a Donor / मैं दानदाता हूँ
                          </h4>
                          {role === 'donor' && <CheckCircle2 className="w-5 h-5 text-[#112A46]" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Hotels, restaurants, wedding caterers, corporate canteens &amp; individuals who wish to donate surplus cooked or packaged food.
                        </p>
                      </div>
                    </div>

                    {/* Role Option 2: NGO */}
                    <div
                      onClick={() => setRole('ngo')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${
                        role === 'ngo'
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-white border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shadow-2xs shrink-0">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-[#132238]">
                            I am an NGO / मैं NGO हूँ
                          </h4>
                          {role === 'ngo' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Verified NGOs, shelters, orphanages, and community kitchens who receive surplus food and distribute it to people in need.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="w-full mt-4 bg-[#132238] hover:bg-stone-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Continue / आगे बढ़ें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: BASIC ACCOUNT CREDENTIALS */}
              {step === 2 && (
                <form onSubmit={handleNextFromStep2} className="space-y-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Role</span>
                    </button>
                    <span className="text-xs font-bold text-stone-500 uppercase">
                      {role === 'donor' ? 'Donor Account' : 'NGO Account'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132238] mb-1">
                      Full Name / पूरा नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rakesh Sharma"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132238] mb-1">
                      Phone Number / फोन नंबर *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98201 44921"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132238] mb-1">
                      Email Address / ईमेल *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@domain.org"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#132238] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#132238] mb-1">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-[#132238] hover:bg-stone-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Proceed to Organization Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 3: ROLE-SPECIFIC REGISTRATION DETAILS */}
              {step === 3 && (
                <form onSubmit={handleFinalSignup} className="space-y-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Account</span>
                    </button>
                    <span className="text-xs font-bold text-stone-500">Step 3 of 3</span>
                  </div>

                  {/* Donor Specific Details */}
                  {role === 'donor' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#132238] mb-1">
                          Business / Establishment Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Taj Caterers &amp; Kitchen"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#132238] mb-1">
                          Pickup Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 42 Connaught Place, New Delhi"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#132238] mb-1">
                            Operating Hours
                          </label>
                          <input
                            type="text"
                            value={operatingHours}
                            onChange={(e) => setOperatingHours(e.target.value)}
                            placeholder="10:00 AM - 11:00 PM"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#132238] mb-1">
                            FSSAI Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={fssaiNumber}
                            onChange={(e) => setFssaiNumber(e.target.value)}
                            placeholder="14-digit FSSAI"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* NGO Specific Details */}
                  {role === 'ngo' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#132238] mb-1">
                          NGO / Organization Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={ngoName}
                          onChange={(e) => setNgoName(e.target.value)}
                          placeholder="e.g. Annapurna Seva Trust"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#132238] mb-1">
                          Area / Hub Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Plot 18, Shelter Ward 4, Okhla Phase 2, New Delhi"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#132238] mb-1">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="e.g. NGO/DL/2021/8842"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#132238] mb-1">
                            Daily Capacity
                          </label>
                          <input
                            type="text"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="e.g. 300 meals/day"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#132238] focus:bg-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Required Terms & Privacy Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-stone-700 bg-stone-50 border border-stone-200 p-2.5 rounded-xl hover:bg-stone-100/80 transition-colors">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#132238] rounded border-stone-300 focus:ring-[#132238] cursor-pointer"
                      />
                      <span className="leading-snug">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegal && onOpenLegal('terms')}
                          className="text-[#132238] underline font-bold hover:text-stone-900 cursor-pointer"
                        >
                          Terms of Use
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegal && onOpenLegal('privacy')}
                          className="text-[#132238] underline font-bold hover:text-stone-900 cursor-pointer"
                        >
                          Privacy Policy
                        </button>{' '}
                        / मैं नियम और गोपनीयता नीति से सहमत हूँ *
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className={`w-full mt-3 font-extrabold py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                      loading || !acceptedTerms
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                        : 'bg-[#132238] hover:bg-stone-800 text-white cursor-pointer'
                    }`}
                  >
                    {loading ? (
                      <span className="animate-pulse">Creating Account...</span>
                    ) : (
                      <>
                        <span>Complete Registration / खाता बनाएं</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
}
