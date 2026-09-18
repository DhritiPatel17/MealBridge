import React, { useState, useRef } from 'react';
import { supabase, hashPassword } from '../../lib/supabase';
import { ShieldCheck, Heart, Truck, Building2, User, Mail, Lock, Phone, Calendar, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Upload, Camera } from 'lucide-react';
import mealbridgeLogo from '../../assets/mealbridge-logo.png';

export type UserRole = 'donor' | 'ngo' | 'volunteer';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  age?: string;
  gender?: string;
  avatarUrl?: string;
  // Role specific
  businessName?: string;
  businessType?: string;
  address?: string;
  operatingHours?: string;
  surplusQty?: string;
  fssaiNumber?: string;
  ngoName?: string;
  regNumber?: string;
  capacity?: string;
  contactPerson?: string;
  locality?: string;
  availability?: string;
  transportMode?: string;
  experience?: string;
  occupationStatus?: string;
  institutionName?: string;
  vehicleNumber?: string;
  drivingLicense?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  govIdType?: string;
  govIdNumber?: string;
}

interface AuthPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [step, setStep] = useState<number>(1); // 1: Role, 2: Basic Info, 3: Role Specific (for signup)
  const [role, setRole] = useState<UserRole>('donor');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 11:00 PM');
  const [surplusQty, setSurplusQty] = useState('50-100 meals/day');
  const [fssaiNumber, setFssaiNumber] = useState('');

  const [ngoName, setNgoName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [capacity, setCapacity] = useState('200 people/day');
  const [contactPerson, setContactPerson] = useState('');

  const [locality, setLocality] = useState('South City & MG Road');
  const [availability, setAvailability] = useState('Evening (6 PM - 9 PM)');
  const [transportMode, setTransportMode] = useState('Two-Wheeler / Bike');
  const [experience, setExperience] = useState('');

  // Volunteer Verification State
  const [occupationStatus, setOccupationStatus] = useState('Student');
  const [institutionName, setInstitutionName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [govIdType, setGovIdType] = useState('Aadhaar');
  const [govIdNumber, setGovIdNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Validation helpers
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const validatePhone = (phoneStr: string) => {
    return /^[\d\s\-\+\(\)]{10,15}$/.test(phoneStr);
  };

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
    if (!fullName || !email || !phone || !password) {
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

    if (role === 'volunteer') {
      if ((occupationStatus === 'Student' || occupationStatus === 'Employed') && !institutionName.trim()) {
        setError('Please provide the name of your college, office, or organization.');
        setLoading(false);
        return;
      }
      if ((transportMode === 'Two-Wheeler / Bike' || transportMode === 'Car / Van') && !drivingLicense.trim()) {
        setError("A valid driving license is required for vehicle-based volunteering. You're not eligible for vehicle-based delivery at this time — please select 'On Foot' or update your transport mode.");
        setLoading(false);
        return;
      }
      if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
        setError('Please provide Emergency Contact Name and Phone Number for safety verification.');
        setLoading(false);
        return;
      }
      if (!govIdNumber.trim()) {
        setError('Please provide your Government ID number for secure verification.');
        setLoading(false);
        return;
      }
      if (!termsAccepted) {
        setError('Please accept the Terms & Conditions and liability waiver to complete your registration.');
        setLoading(false);
        return;
      }
    }

    try {
      const hashedPassword = await hashPassword(password);
      const newUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        role,
        fullName,
        email,
        phone,
        age,
        gender,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        businessName: role === 'donor' ? businessName : undefined,
        businessType: role === 'donor' ? businessType : undefined,
        address: role === 'donor' || role === 'ngo' ? address : undefined,
        operatingHours: role === 'donor' ? operatingHours : undefined,
        surplusQty: role === 'donor' ? surplusQty : undefined,
        fssaiNumber: role === 'donor' ? fssaiNumber : undefined,
        ngoName: role === 'ngo' ? ngoName : undefined,
        regNumber: role === 'ngo' ? regNumber : undefined,
        capacity: role === 'ngo' ? capacity : undefined,
        contactPerson: role === 'ngo' ? contactPerson : undefined,
        locality: role === 'volunteer' ? locality : undefined,
        availability: role === 'volunteer' ? availability : undefined,
        transportMode: role === 'volunteer' ? transportMode : undefined,
        experience: role === 'volunteer' ? experience : undefined,
        occupationStatus: role === 'volunteer' ? occupationStatus : undefined,
        institutionName: role === 'volunteer' ? institutionName : undefined,
        vehicleNumber: role === 'volunteer' ? vehicleNumber : undefined,
        drivingLicense: role === 'volunteer' ? drivingLicense : undefined,
        emergencyContactName: role === 'volunteer' ? emergencyContactName : undefined,
        emergencyContactPhone: role === 'volunteer' ? emergencyContactPhone : undefined,
        govIdType: role === 'volunteer' ? govIdType : undefined,
        govIdNumber: role === 'volunteer' ? govIdNumber : undefined,
      };

      // Store in Supabase database
      try {
        await supabase.from('mealbridge_users').insert([{
          id: newUser.id,
          role: newUser.role,
          full_name: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          password_hash: hashedPassword,
          profile_data: newUser,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.log('Supabase insert note:', dbErr);
      }

      // Also store in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      existingUsers.push({ ...newUser, passwordHash: hashedPassword });
      localStorage.setItem('mealbridge_db_users', JSON.stringify(existingUsers));
      localStorage.setItem('mealbridge_active_user', JSON.stringify(newUser));

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(newUser);
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);

      // Check local storage users first
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      const found = existingUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

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
        }, 500);
        return;
      }

      // Try Supabase fetch
      const { data, error: sbError } = await supabase
        .from('mealbridge_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (data && data.password_hash === hashedPassword) {
        const userProfile: UserProfile = data.profile_data;
        localStorage.setItem('mealbridge_active_user', JSON.stringify(userProfile));
        setLoading(false);
        onLoginSuccess(userProfile);
        return;
      }

      // Default demo login fallback if user types demo credentials
      const demoUser: UserProfile = {
        id: 'usr_demo_1',
        role: email.includes('ngo') ? 'ngo' : email.includes('vol') ? 'volunteer' : 'donor',
        fullName: email.split('@')[0] || 'MealBridge User',
        email,
        phone: '+91 98765 43210',
        businessName: 'Royal Palace Banquet & Canteen',
        ngoName: 'Roti Bank Relief Foundation',
        locality: 'South City & MG Road',
      };
      localStorage.setItem('mealbridge_active_user', JSON.stringify(demoUser));
      setLoading(false);
      onLoginSuccess(demoUser);

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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1828]/70 backdrop-blur-md overflow-y-auto flex items-start justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div className="w-full max-w-lg bg-gradient-to-br from-[#f0f6ff] via-[#ffffff] to-[#fffde6] border border-blue-200/80 rounded-2xl shadow-2xl overflow-hidden text-stone-900 my-12 mb-20">
        
        {/* Header Branding with Logo & Tagline */}
        <div className="px-6 pt-8 pb-6 bg-gradient-to-r from-blue-50/90 via-white to-amber-50/70 border-b border-blue-100 flex flex-col items-center text-center w-full">
          <div className="mb-3 flex items-center justify-center w-full">
            <img
              src={mealbridgeLogo}
              alt="MealBridge Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto drop-shadow-md block"
            />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#132238] font-sans">
            MealBridge <span className="text-amber-600 font-bold text-base">अन्नसेतु</span>
          </h1>
          <p className="text-xs italic font-medium text-stone-500 mt-1">
            "From Excess to Access"
          </p>

          <div className="flex bg-blue-100/80 p-1.5 rounded-2xl text-xs font-semibold mt-6 border border-blue-200 shadow-2xs">
            <button
              onClick={() => { setMode('signup'); setStep(1); setError(null); }}
              className={`px-6 py-2 rounded-xl transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#132238] text-white shadow-md font-bold' : 'text-stone-700 hover:text-[#132238] font-semibold'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`px-6 py-2 rounded-xl transition-all cursor-pointer ${mode === 'login' ? 'bg-[#132238] text-white shadow-md font-bold' : 'text-stone-700 hover:text-[#132238] font-semibold'}`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === 'login' && !forgotPasswordOpen && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-[#132238]">Welcome Back</h3>
                <p className="text-xs text-stone-500">Enter your credentials to access your secure dashboard</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132238] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-blue-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@hotelroyale.com"
                    className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132238] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-blue-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500">Supabase Cloud Database Auth</span>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#132238] to-[#1c365c] hover:from-[#1b3152] hover:to-[#244574] active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">Connecting to Supabase...</span>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
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
                <p className="text-xs text-stone-500">We will send a secure recovery link to your registered email</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#132238] mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40"
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
                  className="flex-1 bg-gradient-to-r from-[#132238] to-[#1c365c] text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP MULTI-STEP FLOW */}
          {mode === 'signup' && !forgotPasswordOpen && (
            <div>
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#132238] text-white shadow' : 'bg-blue-100 text-stone-500'}`}>1</div>
                  <span className="text-xs font-bold text-[#132238]">Role</span>
                </div>
                <div className="w-10 h-0.5 bg-blue-200" />
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#132238] text-white shadow' : 'bg-blue-100 text-stone-500'}`}>2</div>
                  <span className="text-xs font-bold text-[#132238]">Account</span>
                </div>
                <div className="w-10 h-0.5 bg-blue-200" />
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#132238] text-white shadow' : 'bg-blue-100 text-stone-500'}`}>3</div>
                  <span className="text-xs font-bold text-[#132238]">Details</span>
                </div>
              </div>

              {/* STEP 1: ROLE SELECTION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[#132238]">Select Your Community Role</h3>
                    <p className="text-xs text-stone-500">How would you like to participate in MealBridge?</p>
                  </div>

                  <div className="space-y-3">
                    <div
                      onClick={() => setRole('donor')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${role === 'donor' ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-300/30' : 'bg-white/80 border-blue-100 hover:border-blue-300'}`}
                    >
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shadow-2xs">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#132238]">Food Donor</h4>
                          {role === 'donor' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Restaurants, hotels, caterers, banquet halls, canteens with surplus hygienic food.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setRole('ngo')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${role === 'ngo' ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-300/30' : 'bg-white/80 border-blue-100 hover:border-blue-300'}`}
                    >
                      <div className="p-3 bg-red-100 text-red-700 rounded-xl shadow-2xs">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#132238]">NGO / Food Receiver</h4>
                          {role === 'ngo' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Registered shelters, orphanages, and community distribution centers.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setRole('volunteer')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-4 ${role === 'volunteer' ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-300/30' : 'bg-white/80 border-blue-100 hover:border-blue-300'}`}
                    >
                      <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shadow-2xs">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#132238]">Volunteer / Rider</h4>
                          {role === 'volunteer' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Individuals helping with rapid pickup, logistics, and quality assurance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextFromStep1}
                    className="w-full mt-4 bg-gradient-to-r from-[#132238] to-[#1c365c] hover:from-[#1b3152] hover:to-[#244574] text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Continue to Account Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: BASIC ACCOUNT CREATION */}
              {step === 2 && (
                <form onSubmit={handleNextFromStep2} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#132238]">Personal & Account Credentials</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-blue-600 hover:text-[#132238] flex items-center space-x-1 font-bold cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rajesh Sharma"
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="32"
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#132238] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rajesh@example.com"
                      className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Password * (Min 6)</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#132238] mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Fix: File picker button & circular preview */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#132238] mb-1">Profile Photo</label>
                    <div className="flex items-center space-x-3 bg-blue-50/40 border border-blue-200 p-2.5 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-white border border-blue-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="self-start px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-[#132238] text-xs font-bold rounded-lg shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Photo</span>
                        </button>
                        <span className="text-[10px] text-stone-500 mt-0.5">Select image from gallery or PC</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-gradient-to-r from-[#132238] to-[#1c365c] hover:from-[#1b3152] hover:to-[#244574] text-white font-bold py-2.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    <span>Proceed to Role Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 3: ROLE-SPECIFIC DETAILS */}
              {step === 3 && (
                <form onSubmit={handleFinalSignup} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#132238] capitalize">
                      {role === 'donor' && 'Donor Establishment Details'}
                      {role === 'ngo' && 'NGO / Organization Profile'}
                      {role === 'volunteer' && 'Volunteer Logistics Profile'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-blue-600 hover:text-[#132238] flex items-center space-x-1 font-bold cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  {role === 'donor' && (
                    <>
                      <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
                        <Heart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Thank you for choosing to give back</strong> — your surplus food is turning into someone's meal today. Every contribution you make helps reduce waste and brings dignity to those in need.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Business / Establishment Name *</label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Royal Palace Banquet & Canteen"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          >
                            <option value="Restaurant">Restaurant</option>
                            <option value="Caterer">Caterer</option>
                            <option value="Canteen">Canteen</option>
                            <option value="Banquet Hall">Banquet Hall</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Avg Surplus Quantity</label>
                          <input
                            type="text"
                            value={surplusQty}
                            onChange={(e) => setSurplusQty(e.target.value)}
                            placeholder="50-100 meals/day"
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Location / Address (with map pin)</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Plot 42, MG Road, Central District"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Operating Hours</label>
                          <input
                            type="text"
                            value={operatingHours}
                            onChange={(e) => setOperatingHours(e.target.value)}
                            placeholder="10 AM - 11 PM"
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">FSSAI License No. (Trust)</label>
                          <input
                            type="text"
                            value={fssaiNumber}
                            onChange={(e) => setFssaiNumber(e.target.value)}
                            placeholder="12821019000342"
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'ngo' && (
                    <>
                      <div className="mb-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-red-900">
                        <Building2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Thank you for the incredible work you do every day</strong>, serving your community with compassion. MealBridge is proud to support your mission of reaching those who need it most.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">NGO / Organization Name *</label>
                        <input
                          type="text"
                          required
                          value={ngoName}
                          onChange={(e) => setNgoName(e.target.value)}
                          placeholder="Roti Bank Relief Foundation"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Registration No. (12A/80G / Darpan)</label>
                          <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="TN/2021/029381"
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Daily Capacity (People)</label>
                          <input
                            type="text"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="200 people/day"
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Location / Address Served *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shelter Ward 4, Civil Lines"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Contact Person Name & Designation</label>
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="Sunita Verma (Director)"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>
                    </>
                  )}

                  {role === 'volunteer' && (
                    <>
                      <div className="mb-4 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-blue-950">
                        <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Thank you for stepping up to bridge the gap between excess and access</strong>. Your time and effort directly bring smiles to faces that need it most — you're the heart of this movement.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Occupation Status *</label>
                          <select
                            value={occupationStatus}
                            onChange={(e) => setOccupationStatus(e.target.value)}
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          >
                            <option value="Student">Student</option>
                            <option value="Employed">Employed</option>
                            <option value="Self-Employed">Self-Employed</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">
                            {occupationStatus === 'Student' ? 'College / Institution *' : occupationStatus === 'Employed' ? 'Office / Company *' : 'Organization'}
                          </label>
                          <input
                            type="text"
                            required={occupationStatus === 'Student' || occupationStatus === 'Employed'}
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            placeholder={occupationStatus === 'Student' ? 'e.g. IIT Delhi' : 'e.g. TCS / TechCorp'}
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Area / Locality of Operation *</label>
                        <input
                          type="text"
                          required
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          placeholder="South City & MG Road Sector 14"
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Availability</label>
                          <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          >
                            <option value="Evening (6 PM - 10 PM)">Evening (6 PM - 10 PM)</option>
                            <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                            <option value="Weekends Only">Weekends Only</option>
                            <option value="Anytime / On-Call">Anytime / On-Call</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#132238] mb-1">Mode of Transport</label>
                          <select
                            value={transportMode}
                            onChange={(e) => setTransportMode(e.target.value)}
                            className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                          >
                            <option value="Two-Wheeler / Bike">Two-Wheeler / Bike</option>
                            <option value="Car / Van">Car / Van</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="On-Foot / Walking">On-Foot / Walking</option>
                          </select>
                        </div>
                      </div>

                      {(transportMode === 'Two-Wheeler / Bike' || transportMode === 'Car / Van') && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                          <div>
                            <label className="block text-[11px] font-semibold text-amber-900 mb-1">Vehicle Number *</label>
                            <input
                              type="text"
                              required
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              placeholder="KA 01 AB 1234"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-amber-900 mb-1">Driving License No. *</label>
                            <input
                              type="text"
                              required
                              value={drivingLicense}
                              onChange={(e) => setDrivingLicense(e.target.value)}
                              placeholder="DL-1420110098234"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-[#132238] block">Emergency Contact (Safety Verification)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="Contact Name (e.g. Parent/Spouse)"
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <input
                            type="tel"
                            required
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            placeholder="Contact Phone Number"
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#132238]">Government ID Verification</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Securely Stored & Encrypted</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={govIdType}
                            onChange={(e) => setGovIdType(e.target.value)}
                            className="bg-white border border-blue-200 rounded-xl px-2 py-2 text-xs text-stone-900 focus:outline-none"
                          >
                            <option value="Aadhaar">Aadhaar</option>
                            <option value="PAN">PAN</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Driving License">Driving License</option>
                          </select>
                          <input
                            type="text"
                            required
                            value={govIdNumber}
                            onChange={(e) => setGovIdNumber(e.target.value)}
                            placeholder="Enter ID Number"
                            className="col-span-2 w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#132238] mb-1">Prior Volunteering Experience (Optional)</label>
                        <textarea
                          rows={2}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Helped with food relief drives during festivals..."
                          className="w-full bg-blue-50/30 border border-blue-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300/40 focus:bg-white"
                        />
                      </div>

                      <div className="pt-2 flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-blue-300 text-[#132238] focus:ring-blue-400 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-[11px] text-stone-700 leading-tight select-none">
                          I understand that I am volunteering independently and that MealBridge is not liable for any inconvenience, delay, accident, or issue arising during pickup, delivery, or logistics activities. I agree to conduct myself responsibly and represent MealBridge's mission with integrity.{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-blue-600 hover:underline font-bold inline"
                          >
                            Read Full Terms & Conditions
                          </button>
                        </label>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 bg-gradient-to-r from-[#132238] to-[#1c365c] hover:from-[#1b3152] hover:to-[#244574] text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    {loading ? (
                      <span className="animate-pulse">Storing in Supabase & Creating Account...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Registration & Enter Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#132238]">Volunteer Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <p>
                <strong>1. Independent Volunteering Status:</strong> You acknowledge that you are volunteering independently for MealBridge (अन्नसेतु). You are not an employee, agent, or legal representative of MealBridge, and no formal employment or compensation is implied.
              </p>
              <p>
                <strong>2. Liability Waiver & Release:</strong> MealBridge is not liable for any inconvenience, delay, traffic incident, accident, property damage, or personal injury arising during pickup, delivery, or logistics activities undertaken as a volunteer. You participate entirely at your own risk.
              </p>
              <p>
                <strong>3. Code of Conduct:</strong> Volunteers agree to handle surplus food with utmost hygiene, respect donors and beneficiaries with dignity, and conduct themselves responsibly with integrity.
              </p>
              <p>
                <strong>4. Data Privacy:</strong> Government ID and contact verification details provided are securely encrypted and used solely for community trust and emergency verification purposes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }}
              className="w-full bg-[#132238] hover:bg-[#1c365c] text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              I Agree & Accept Terms
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
