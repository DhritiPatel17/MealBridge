import React, { useState, useEffect } from 'react';
import { UserProfile } from '../auth/AuthPortal';
import { donationStore, DonationRecord } from '../../services/donationStore';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  FileText,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Check,
  Filter,
  Users,
  Package,
  Award,
  Phone,
  Mail,
  MapPin,
  Truck,
  Flame,
  Snowflake,
  Activity,
  Heart,
  Search,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: UserProfile | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'ngos' | 'donations' | 'reports'>('ngos');
  const [ngoFilter, setNgoFilter] = useState<'pending' | 'approved' | 'rejected' | 'blocked' | 'all'>('pending');
  const [donationFilter, setDonationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<{ name: string; url: string } | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load all users & donations
  const loadData = () => {
    // Load local storage DB users
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
    
    // Ensure demo NGO and Donor are included if not present
    const demoNgo: UserProfile = {
      id: 'demo_ngo_account',
      role: 'ngo',
      fullName: 'Anita Desai',
      email: 'ngo@mealbridge.org',
      phone: '+91 98112 34567',
      ngoName: 'Annapurna Seva Trust',
      regNumber: 'NGO/DL/2021/8842',
      fssaiNumber: '20019011000982',
      contactPerson: 'Anita Desai',
      address: 'Plot 14, Sevashram Road, Gotri, Vadodara, Gujarat - 390021',
      area: 'Gotri',
      capacity: '300 people/pickup',
      hasVehicle: true,
      canCarryHotFood: true,
      hasFridge: true,
      canReheatFood: true,
      whoWeServe: ['Orphanage', 'Old Age Home', 'Shelter', 'Community Kitchen'],
      regCertificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      isVerified: false,
      verificationStatus: 'pending',
    };

    const demoDonor: UserProfile = {
      id: 'demo_donor_taj',
      role: 'donor',
      fullName: 'Rakesh Sharma',
      email: 'donor@mealbridge.org',
      phone: '+91 98201 44921',
      businessName: 'Taj Caterers & Kitchen',
      businessType: 'caterer',
      fssaiNumber: '10019011000543',
      address: '42 Connaught Place, New Delhi',
      strikes: 0,
      isVerified: true,
      verificationStatus: 'approved',
    };

    let allUsers = [...localUsers];
    if (!allUsers.some((u) => u.email === demoNgo.email)) {
      allUsers.push(demoNgo);
    }
    if (!allUsers.some((u) => u.email === demoDonor.email)) {
      allUsers.push(demoDonor);
    }

    setUsers(allUsers);
    setDonations(donationStore.getDonations());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = donationStore.subscribe(() => {
      setDonations(donationStore.getDonations());
    });
    return () => unsubscribe();
  }, []);

  const triggerSuccessMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Guard: Admin Check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-6 text-center space-y-4 my-10 bg-rose-50 border-2 border-rose-200 rounded-3xl max-w-md mx-auto">
        <Ban className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-900">Access Denied / केवल एडमिन प्रवेश</h2>
        <p className="text-xs text-rose-700">
          This portal is restricted exclusively to system administrators. Please sign in as an admin to view verification requests.
        </p>
      </div>
    );
  }

  // Action Handlers
  const handleUpdateNgoStatus = async (ngoId: string, email: string, status: 'approved' | 'rejected' | 'blocked') => {
    const isVerified = status === 'approved';
    const isBlocked = status === 'blocked';

    // 1. Update local storage DB users
    const updatedUsers = users.map((u) => {
      if (u.id === ngoId || u.email === email) {
        return {
          ...u,
          isVerified,
          verificationStatus: status,
          isBlocked,
        };
      }
      return u;
    });

    localStorage.setItem('mealbridge_db_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // If active logged-in user is updated, update active user too
    const activeUserRaw = localStorage.getItem('mealbridge_active_user');
    if (activeUserRaw) {
      const activeUser = JSON.parse(activeUserRaw);
      if (activeUser.id === ngoId || activeUser.email === email) {
        activeUser.isVerified = isVerified;
        activeUser.verificationStatus = status;
        activeUser.isBlocked = isBlocked;
        localStorage.setItem('mealbridge_active_user', JSON.stringify(activeUser));
      }
    }

    // 2. Sync to Supabase
    try {
      await supabase
        .from('mealbridge_users')
        .update({
          profile_data: updatedUsers.find((u) => u.id === ngoId || u.email === email),
        })
        .eq('email', email);
    } catch (err) {
      console.warn('Supabase status update fallback:', err);
    }

    const label = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Blocked';
    triggerSuccessMsg(`NGO status updated to ${label} successfully.`);
  };

  const handleBlockDonor = async (donorId: string, email: string, block: boolean) => {
    const updatedUsers = users.map((u) => {
      if (u.id === donorId || u.email === email) {
        return {
          ...u,
          isBlocked: block,
        };
      }
      return u;
    });

    localStorage.setItem('mealbridge_db_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    triggerSuccessMsg(block ? 'Donor account blocked.' : 'Donor account unblocked.');
  };

  const handleResetStrikes = (donorId: string, email: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === donorId || u.email === email) {
        return {
          ...u,
          strikes: 0,
        };
      }
      return u;
    });

    localStorage.setItem('mealbridge_db_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    triggerSuccessMsg('Donor strikes reset to 0.');
  };

  // Filtered Lists
  const ngosList = users.filter((u) => u.role === 'ngo');
  const pendingNgos = ngosList.filter((u) => u.verificationStatus === 'pending' || u.isVerified === false);
  const approvedNgos = ngosList.filter((u) => u.isVerified === true || u.verificationStatus === 'approved');
  const rejectedNgos = ngosList.filter((u) => u.verificationStatus === 'rejected');
  const blockedNgos = ngosList.filter((u) => u.isBlocked === true || u.verificationStatus === 'blocked');

  const filteredNgos = ngosList.filter((u) => {
    if (ngoFilter === 'pending') return u.verificationStatus === 'pending' || u.isVerified === false;
    if (ngoFilter === 'approved') return u.isVerified === true || u.verificationStatus === 'approved';
    if (ngoFilter === 'rejected') return u.verificationStatus === 'rejected';
    if (ngoFilter === 'blocked') return u.isBlocked === true || u.verificationStatus === 'blocked';
    return true;
  }).filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.ngoName || '').toLowerCase().includes(q) ||
      (u.contactPerson || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.area || '').toLowerCase().includes(q)
    );
  });

  const donorsList = users.filter((u) => u.role === 'donor');

  const filteredDonations = donations.filter((d) => {
    if (donationFilter === 'all') return true;
    if (donationFilter === 'open') return ['waiting', 'accepted', 'picked_up'].includes(d.status);
    if (donationFilter === 'delivered') return d.status === 'delivered';
    if (donationFilter === 'cancelled') return ['cancelled', 'not_accepted', 'expired'].includes(d.status);
    return d.status === donationFilter;
  });

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-[#112A46] text-white rounded-3xl p-5 shadow-xl border border-[#ACC8E5]/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDFD96] text-[#112A46] flex items-center justify-center font-extrabold shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">Admin Operations Hub</h1>
              <p className="text-[11px] text-stone-300 font-normal">MealBridge Verification &amp; Control Portal</p>
            </div>
          </div>
          <span className="bg-[#FDFD96] text-[#112A46] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            SYSTEM ADMIN
          </span>
        </div>

        {/* System Metric Cards */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="block text-base font-extrabold text-[#FDFD96]">{pendingNgos.length}</span>
            <span className="text-[10px] text-stone-300 font-medium">Pending NGOs</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="block text-base font-extrabold text-white">{approvedNgos.length}</span>
            <span className="text-[10px] text-stone-300 font-medium">Active NGOs</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="block text-base font-extrabold text-white">{donations.length}</span>
            <span className="text-[10px] text-stone-300 font-medium">Donations</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="block text-base font-extrabold text-white">{donorsList.length}</span>
            <span className="text-[10px] text-stone-300 font-medium">Donors</span>
          </div>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ngos')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ngos'
              ? 'bg-[#112A46] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building2 size={15} />
          <span>NGOs ({ngosList.length})</span>
          {pendingNgos.length > 0 && (
            <span className="bg-[#FDFD96] text-[#112A46] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {pendingNgos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'donations'
              ? 'bg-[#112A46] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Package size={15} />
          <span>Donations ({donations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#112A46] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <AlertTriangle size={15} />
          <span>Donors &amp; Strikes</span>
        </button>
      </div>

      {/* TAB 1: NGO APPROVALS & REGISTRATION DETAILS */}
      {activeTab === 'ngos' && (
        <div className="space-y-4">
          {/* Sub Filters & Search */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setNgoFilter('pending')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  ngoFilter === 'pending'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                <span>Pending Review</span>
                <span className="bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingNgos.length}
                </span>
              </button>

              <button
                onClick={() => setNgoFilter('approved')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  ngoFilter === 'approved'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                <span>Approved ({approvedNgos.length})</span>
              </button>

              <button
                onClick={() => setNgoFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  ngoFilter === 'rejected'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                <span>Rejected ({rejectedNgos.length})</span>
              </button>

              <button
                onClick={() => setNgoFilter('all')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  ngoFilter === 'all'
                    ? 'bg-[#112A46] text-white border-[#112A46]'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                <span>All ({ngosList.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search NGO name, contact, phone or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#112A46]"
              />
            </div>
          </div>

          {/* NGO List Cards */}
          {filteredNgos.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs font-medium space-y-1">
              <Building2 size={28} className="mx-auto text-stone-400" />
              <p className="font-bold text-stone-700">No NGOs match this filter.</p>
              <p>Try switching tabs or adjusting search terms.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredNgos.map((ngo) => {
                const isPending = ngo.verificationStatus === 'pending' || ngo.isVerified === false;
                const isApproved = ngo.isVerified === true || ngo.verificationStatus === 'approved';
                const isRejected = ngo.verificationStatus === 'rejected';
                const isBlocked = ngo.isBlocked === true;

                return (
                  <div
                    key={ngo.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3.5"
                  >
                    {/* NGO Header */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#112A46]">
                            {ngo.ngoName || ngo.fullName}
                          </h3>
                          <span className="text-xs text-stone-500 font-mono font-bold">
                            #{ngo.regNumber || 'NGO-REG'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin size={13} className="text-stone-400 shrink-0" />
                          <span>{ngo.address || ngo.area || 'Vadodara'}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isApproved && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} /> Approved / सत्यापित
                          </span>
                        )}
                        {isPending && !isRejected && !isBlocked && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <Clock size={12} /> Pending Approval
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                        {isBlocked && (
                          <span className="bg-stone-800 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Ban size={12} /> Blocked Account
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key NGO Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">Contact Person</span>
                        <span className="font-bold text-stone-800 flex items-center gap-1">
                          <Users size={12} className="text-stone-500" />
                          {ngo.contactPerson || ngo.fullName}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">Phone</span>
                        <span className="font-bold text-stone-800 flex items-center gap-1 font-mono">
                          <Phone size={12} className="text-stone-500" />
                          {ngo.phone}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">FSSAI Registration</span>
                        <span className="font-bold text-stone-800 font-mono">
                          {ngo.fssaiNumber || 'FSSAI-UNVERIFIED'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">Pickup Capacity</span>
                        <span className="font-bold text-[#112A46]">
                          {ngo.capacity || '100+ people/pickup'}
                        </span>
                      </div>
                    </div>

                    {/* Infrastructure & Logistics Capabilities */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                        Logistics &amp; Infrastructure Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            ngo.hasVehicle
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                          }`}
                        >
                          <Truck size={12} /> Vehicle Pickup: {ngo.hasVehicle ? 'Yes' : 'No'}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            ngo.canCarryHotFood
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                          }`}
                        >
                          <Flame size={12} /> Carry Hot Food: {ngo.canCarryHotFood ? 'Yes' : 'No'}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            ngo.hasFridge
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                          }`}
                        >
                          <Snowflake size={12} /> Has Refrigerator: {ngo.hasFridge ? 'Yes' : 'No'}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            ngo.canReheatFood
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                          }`}
                        >
                          <Flame size={12} /> Reheat Setup: {ngo.canReheatFood ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    {/* Who We Serve Chips */}
                    {ngo.whoWeServe && ngo.whoWeServe.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                          Who They Serve
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ngo.whoWeServe.map((chip, idx) => (
                            <span
                              key={idx}
                              className="bg-[#112A46]/10 text-[#112A46] border border-[#112A46]/20 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Registration Certificate Link */}
                    <div className="pt-1">
                      {ngo.regCertificateUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCertificate({
                              name: ngo.ngoName || ngo.fullName,
                              url: ngo.regCertificateUrl!,
                            })
                          }
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <FileText size={14} className="text-blue-700" />
                          <span>View Uploaded Registration Certificate / प्रमाण पत्र देखें</span>
                          <ExternalLink size={12} />
                        </button>
                      ) : (
                        <div className="p-2 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                          <FileText size={14} />
                          <span>Standard Certificate Upload Verified (Sample Document)</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-2">
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleUpdateNgoStatus(ngo.id, ngo.email, 'approved')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          <span>Approve / मंज़ूर करें</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => handleUpdateNgoStatus(ngo.id, ngo.email, 'rejected')}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={15} />
                          <span>Reject / अस्वीकार करें</span>
                        </button>
                      )}

                      {!isBlocked ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateNgoStatus(ngo.id, ngo.email, 'blocked')}
                          className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Ban size={15} />
                          <span>Block NGO</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateNgoStatus(ngo.id, ngo.email, 'approved')}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Unblock</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DONATIONS LIST & FILTERS */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#112A46]">
              <Filter size={15} />
              <span>Status Filter:</span>
            </div>
            <select
              value={donationFilter}
              onChange={(e) => setDonationFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="all">All Donations ({donations.length})</option>
              <option value="open">Active Open Donations</option>
              <option value="waiting">Waiting for Acceptance</option>
              <option value="accepted">Accepted / In Transit</option>
              <option value="delivered">Delivered Successfully</option>
              <option value="cancelled">Cancelled / Expired</option>
            </select>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs font-medium">
              <Package size={28} className="mx-auto text-stone-400 mb-1" />
              <p className="font-bold text-stone-700">No donations found matching this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDonations.map((d) => (
                <div key={d.id} className="bg-white rounded-3xl p-4 border border-stone-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-[#112A46] bg-[#112A46]/10 px-2 py-0.5 rounded-md">
                        #{d.id}
                      </span>
                      <span className="text-xs font-bold text-stone-800">{d.category} ({d.servings} meals)</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        d.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'accepted' || d.status === 'picked_up'
                          ? 'bg-blue-100 text-blue-800'
                          : d.status === 'waiting'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    <div>
                      <span className="block text-[10px] text-stone-400 font-bold">Donor</span>
                      <p className="font-bold text-stone-800">{d.donorBusinessName || d.donorName}</p>
                      <p className="text-[11px] font-mono text-stone-600">{d.donorPhone}</p>
                    </div>

                    <div>
                      <span className="block text-[10px] text-stone-400 font-bold">Assigned NGO</span>
                      <p className="font-bold text-[#112A46]">{d.ngoName || 'Unassigned'}</p>
                      {d.ngoPhone && <p className="text-[11px] font-mono text-stone-600">{d.ngoPhone}</p>}
                    </div>
                  </div>

                  {d.deliveryProofPhoto && (
                    <div className="pt-1 flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={14} />
                      <span>Delivery Proof Photo Uploaded</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REPORTS & DONOR STRIKES */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-950">
            <h3 className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Abuse Prevention &amp; Donor Strikes</span>
            </h3>
            <p className="text-stone-700">
              Monitor donors for food quality reports or abuse. Donors are capped at 2 open active donations. You can reset strikes or block non-compliant donors.
            </p>
          </div>

          <div className="space-y-3">
            {donorsList.map((donor) => {
              const isBlocked = donor.isBlocked === true;
              const strikes = donor.strikes || 0;

              return (
                <div key={donor.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#112A46]">
                        {donor.businessName || donor.fullName}
                      </h3>
                      <p className="text-xs text-stone-600 font-medium capitalize">
                        Type: {donor.businessType || 'Donor Kitchen'}
                      </p>
                    </div>

                    {isBlocked ? (
                      <span className="bg-stone-800 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        Blocked
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        Active Donor
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Contact / Phone</span>
                      <p className="font-bold text-stone-800">{donor.fullName}</p>
                      <p className="font-mono font-semibold text-stone-600">{donor.phone}</p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">FSSAI License</span>
                      <p className="font-bold text-stone-800 font-mono">
                        {donor.fssaiNumber || 'Optional / Exempt'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-stone-700 flex items-center gap-1">
                      <span>Strikes / Warning Count:</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono font-extrabold ${strikes > 0 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'}`}>
                        {strikes}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleResetStrikes(donor.id, donor.email)}
                      className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Strikes</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex gap-2">
                    {!isBlocked ? (
                      <button
                        type="button"
                        onClick={() => handleBlockDonor(donor.id, donor.email, true)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Ban size={14} />
                        <span>Block Donor Account / ब्लॉक करें</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBlockDonor(donor.id, donor.email, false)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Unblock Donor Account</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="font-extrabold text-sm text-[#112A46]">
                Registration Certificate: {selectedCertificate.name}
              </h3>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 max-h-[60vh] flex items-center justify-center p-2">
              <img
                src={selectedCertificate.url}
                alt="Registration Certificate"
                className="w-full h-auto max-h-[50vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="bg-[#112A46] text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Close / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
