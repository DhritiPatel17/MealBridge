import React, { useState } from 'react';
import { UserProfile } from '../auth/AuthPortal';
import { donationStore } from '../../services/donationStore';
import { LocationPicker } from '../common/LocationPicker';
import { supabase } from '../../lib/supabase';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit2,
  Check,
  LogOut,
  Star,
  ShieldCheck,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface RoleProfileViewProps {
  user: UserProfile | null;
  onLogout: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const RoleProfileView: React.FC<RoleProfileViewProps> = ({
  user,
  onLogout,
  onUpdateUser,
}) => {
  if (!user) return null;

  const isDonor = user.role === 'donor';
  const isNgo = user.role === 'ngo';

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(user.address || '');
  const [mapLatitude, setMapLatitude] = useState<number | null>(user.latitude || null);
  const [mapLongitude, setMapLongitude] = useState<number | null>(user.longitude || null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1. Remove from active user local storage
      localStorage.removeItem('mealbridge_active_user');

      // 2. Remove from db_users local storage
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      const filtered = existingUsers.filter((u: any) => u.id !== user.id && u.email !== user.email);
      localStorage.setItem('mealbridge_db_users', JSON.stringify(filtered));

      // 3. Attempt deletion from Supabase
      try {
        await supabase.from('mealbridge_users').delete().eq('email', user.email);
        await supabase.from('profiles').delete().eq('id', user.id);
      } catch (err) {
        console.warn('Supabase profile deletion skipped/failed:', err);
      }
    } catch (e) {
      console.error('Account deletion error:', e);
    } finally {
      setIsDeleting(false);
      onLogout();
    }
  };

  const hasCoordinates = typeof user.latitude === 'number' && typeof user.longitude === 'number';
  const hasAddress = Boolean(user.address && user.address.trim().length > 0);
  
  // Format coordinate-based Google Maps Directions URL
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${user.latitude},${user.longitude}`
    : hasAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(user.address!)}`
    : null;

  const ratingStats = isNgo ? donationStore.getNgoRatingStats(user.id, user.ngoName) : null;

  const handleSaveAddress = async () => {
    if (!addressInput.trim()) {
      setSaveError('Please enter a valid address. / कृपया पता दर्ज करें।');
      return;
    }
    if (mapLatitude === null || mapLongitude === null) {
      setSaveError('A map location pin is required. Please tap on the map or use your current location. / कृपया मैप पर पिन लगाएं।');
      return;
    }

    setSaveError(null);
    const updated: UserProfile = {
      ...user,
      address: addressInput.trim(),
      latitude: mapLatitude,
      longitude: mapLongitude,
    };

    try {
      localStorage.setItem('mealbridge_active_user', JSON.stringify(updated));
      
      // Update in local DB users list
      const existingUsers = JSON.parse(localStorage.getItem('mealbridge_db_users') || '[]');
      const updatedUsers = existingUsers.map((u: UserProfile) => (u.id === user.id ? updated : u));
      localStorage.setItem('mealbridge_db_users', JSON.stringify(updatedUsers));
    } catch {}

    // Save lat and lng in Supabase
    try {
      await supabase.from('mealbridge_users').upsert([
        {
          id: user.id,
          email: user.email,
          role: user.role,
          latitude: mapLatitude,
          longitude: mapLongitude,
          address: addressInput.trim(),
          profile_data: updated,
        },
      ]);
    } catch (err) {
      console.warn('Supabase profile coordinate sync skipped/failed:', err);
    }

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditingAddress(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-20">
      {/* Left Column: Top Header & Account Details */}
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black">
            Account Details / खाता विवरण
          </span>
          <div className="flex items-center gap-1.5">
            {user.isVerified && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck size={12} />
                Verified Partner
              </span>
            )}
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[12px] uppercase tracking-wider bg-[#ACC8E5] text-black border border-[#112A46]/20">
              {isDonor ? 'Food Donor / अन्नदाता' : 'NGO Partner / पंजीकृत एनजीओ'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-[14px] bg-[#ACC8E5] border border-[#112A46]/20 flex items-center justify-center text-[#112A46] shrink-0">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-black tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-xs text-stone-600 font-normal">
              {isDonor
                ? user.businessName || 'Food Donor Establishment'
                : user.ngoName || 'Relief & Food Rescue NGO'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Details Section */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-3.5 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <div>
          <h2 className="text-sm font-bold text-[#112A46]">
            {isDonor ? 'Donor Profile Details / दाता विवरण' : 'NGO Hub Details / एनजीओ केंद्र विवरण'}
          </h2>
          <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
        </div>

        <div className="space-y-2.5 text-xs text-black">
          {/* Email */}
          <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-black">
              <Mail size={14} className="text-black" />
              <span>Email:</span>
            </span>
            <span className="font-normal text-black truncate max-w-[200px]">{user.email}</span>
          </div>

          {/* Phone */}
          <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-black">
              <Phone size={14} className="text-black" />
              <span>Phone:</span>
            </span>
            <span className="font-normal text-black">{user.phone}</span>
          </div>

          {/* NGO SPECIFIC DETAILS */}
          {isNgo && (
            <>
              {user.ngoName && (
                <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
                  <span className="font-bold text-black">NGO Name:</span>
                  <span className="font-normal text-black">{user.ngoName}</span>
                </div>
              )}

              {user.regNumber && (
                <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
                  <span className="font-bold text-black">Registration Number:</span>
                  <span className="font-normal text-black">{user.regNumber}</span>
                </div>
              )}

              {/* NGO Rating Stats */}
              <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-black">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>Donor Ratings / दानदाता रेटिंग:</span>
                  </span>
                  {ratingStats && ratingStats.average !== null && (
                    <span className="font-bold text-xs bg-[#FDFD96] text-[#112A46] px-2 py-0.5 rounded-[10px] border border-[#E3E36B]">
                      {ratingStats.average} / 5.0
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-700">
                  {ratingStats && ratingStats.average !== null ? (
                    <span>Average rating: {ratingStats.average} out of 5 ({ratingStats.count} review{ratingStats.count > 1 ? 's' : ''})</span>
                  ) : ratingStats && ratingStats.count > 0 ? (
                    <span>{ratingStats.count} rating{ratingStats.count > 1 ? 's' : ''} received (Average score visible after 3 or more ratings)</span>
                  ) : (
                    <span>No ratings received yet / अभी कोई रेटिंग नहीं मिली है</span>
                  )}
                </p>
              </div>

              {/* Requirement 3: Our address / हमारा पता - starts empty, NGO fills it once, Maps button only when address exists */}
              <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-black">
                    <MapPin size={14} className="text-black" />
                    <span>Our address / हमारा पता:</span>
                  </span>

                  {/* Show Google Maps button ONLY when an address exists */}
                  {hasAddress && mapUrl && !isEditingAddress && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-[#112A46] text-[#112A46] text-[11px] font-bold px-2 py-0.5 rounded-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Google Maps</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/70 uppercase tracking-wide">
                        Hub Address / केंद्र का पूरा पता:
                      </label>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Enter hub address / केंद्र का पता दर्ज करें"
                        className="w-full bg-white border border-[#112A46] text-black text-xs p-2.5 rounded-[12px] focus:outline-none"
                      />
                    </div>

                    <LocationPicker
                      latitude={mapLatitude}
                      longitude={mapLongitude}
                      onChange={(lat, lng) => {
                        setMapLatitude(lat);
                        setMapLongitude(lng);
                        setSaveError(null);
                      }}
                      required={true}
                      hasError={Boolean(saveError && (mapLatitude === null || mapLongitude === null))}
                    />

                    {saveError && (
                      <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{saveError}</span>
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveAddress}
                        className="bg-[#112A46] text-white text-xs font-bold px-3.5 py-2 rounded-[12px] flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-xs"
                      >
                        <Check size={13} />
                        <span>Save Address / पता सहेजें</span>
                      </button>
                      <button
                        onClick={() => {
                          setAddressInput(user.address || '');
                          setMapLatitude(user.latitude || null);
                          setMapLongitude(user.longitude || null);
                          setSaveError(null);
                          setIsEditingAddress(false);
                        }}
                        className="bg-white border border-[#112A46] text-[#112A46] text-xs font-bold px-3.5 py-2 rounded-[12px] cursor-pointer hover:bg-stone-50"
                      >
                        Cancel / रद्द करें
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-black">
                          {hasAddress
                            ? user.address
                            : 'No address set yet. Tap Edit to enter your hub address.'}
                        </p>
                        {hasCoordinates && (
                          <p className="text-[10px] text-stone-600 font-medium mt-0.5">
                            Coordinates: {user.latitude?.toFixed(4)}, {user.longitude?.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setAddressInput(user.address || '');
                          setMapLatitude(user.latitude || null);
                          setMapLongitude(user.longitude || null);
                          setSaveError(null);
                          setIsEditingAddress(true);
                        }}
                        className="bg-white border border-[#112A46] text-[#112A46] text-[11px] font-bold px-2.5 py-1 rounded-[12px] flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Edit2 size={11} />
                        <span>{hasAddress ? 'Edit / बदलें' : 'Add Address / पता जोड़ें'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* DONOR SPECIFIC DETAILS */}
          {isDonor && (
            <>
              {user.businessName && (
                <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
                  <span className="font-bold text-black">Business:</span>
                  <span className="font-normal text-black">{user.businessName}</span>
                </div>
              )}

              {user.address && (
                <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2 text-black">
                      <MapPin size={14} className="text-black" />
                      <span>Pickup Address:</span>
                    </span>
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#112A46] bg-white border border-[#112A46] px-2 py-0.5 rounded-[12px] flex items-center gap-1"
                      >
                        <span>Maps</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="font-normal text-black">{user.address}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

      {/* Right Column: Session Actions & Privacy / Data Deletion */}
      <div className="space-y-4">
        {/* Logout Action */}
        <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-2 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <div>
          <h2 className="text-sm font-bold text-[#112A46]">Session / सत्र</h2>
          <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
        </div>
        <p className="text-xs text-black font-normal pt-1">
          Sign out of this session. To access another account or role, log back in with your credentials.
        </p>

        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-2 bg-white hover:bg-[#ACC8E5]/10 text-[#112A46] font-bold text-xs py-3 px-4 rounded-[12px] transition-colors flex items-center justify-center gap-2 border border-[#112A46] cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout / लॉगआउट</span>
          </button>
        ) : (
          <div className="mt-2 p-3.5 bg-[#FAF9DE] border border-[#D9D975] rounded-[12px] space-y-2.5 text-center">
            <p className="text-xs font-bold text-black">
              Are you sure you want to log out? / क्या आप वाकई लॉगआउट करना चाहते हैं?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onLogout()}
                className="flex-1 bg-[#112A46] hover:bg-[#0c1e33] text-white font-bold text-xs py-2.5 px-3 rounded-[12px] transition-colors cursor-pointer text-center shadow-[0_4px_12px_rgba(17,42,70,0.2)]"
              >
                Yes, Logout / हाँ, लॉगआउट करें
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white border border-[#112A46] text-[#112A46] font-bold text-xs py-2.5 px-3 rounded-[12px] hover:bg-black/5 transition-colors cursor-pointer text-center"
              >
                Cancel / रद्द करें
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Deletion & Privacy Control */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-[16px] p-5 space-y-2.5 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
            <Trash2 size={15} className="text-rose-600" />
            <span>Privacy &amp; Data Deletion / डेटा हटाएं</span>
          </h2>
          <div className="w-10 h-1 bg-rose-300 rounded-full mt-1.5" />
        </div>
        <p className="text-xs text-rose-800 font-normal">
          Permanently delete your account, saved details, and associated records from MealBridge. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full mt-2 bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs py-3 px-4 rounded-[12px] transition-colors flex items-center justify-center gap-2 border border-rose-300 cursor-pointer shadow-2xs"
          >
            <Trash2 size={15} />
            <span>Delete my account and data / मेरा अकाउंट और डेटा हटाएं</span>
          </button>
        ) : (
          <div className="mt-2 p-3.5 bg-white border border-rose-300 rounded-[12px] space-y-3 text-center shadow-xs">
            <p className="text-xs font-bold text-rose-900 leading-snug">
              Are you sure you want to permanently delete your account and all data? / क्या आप वाकई अपना अकाउंट और पूरा डेटा हमेशा के लिए हटाना चाहते हैं?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-3 rounded-[12px] transition-colors cursor-pointer text-center shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete All Data / हाँ, डेटा हटाएं'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 px-3 rounded-[12px] hover:bg-stone-200 transition-colors cursor-pointer text-center"
              >
                Cancel / रद्द करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
