import React from 'react';
import { X, User, ShieldCheck, Award, MapPin, Phone, LogOut, Mail, Building2, Heart, Truck } from 'lucide-react';
import { UserProfile } from '../auth/AuthPortal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-stone-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <User size={18} className="text-stone-800" />
            <span>Supabase User Profile &amp; Role</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <img src="/assets/mealbridge-logo.png" alt="MealBridge Logo" className="w-10 h-10 object-contain" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-stone-900 truncate">
                {user?.fullName || 'MealBridge User'}
              </h3>
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                user?.role === 'donor' ? 'bg-emerald-100 text-emerald-800' :
                user?.role === 'ngo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'donor' && 'Food Donor'}
                {user?.role === 'ngo' && 'NGO / Receiver'}
                {user?.role === 'volunteer' && 'Volunteer / Rider'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
            <span className="text-stone-500 font-medium flex items-center gap-1.5"><Mail size={13} /> Email:</span>
            <span className="font-semibold text-stone-800 truncate max-w-[180px]">{user?.email || 'user@mealbridge.org'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
            <span className="text-stone-500 font-medium flex items-center gap-1.5"><Phone size={13} /> Phone:</span>
            <span className="font-semibold text-stone-800">{user?.phone || '+91 98765 43210'}</span>
          </div>

          {user?.role === 'donor' && (
            <>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium flex items-center gap-1.5"><Building2 size={13} /> Business:</span>
                <span className="font-semibold text-stone-800">{user.businessName || 'Canteen'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium">FSSAI Licence:</span>
                <span className="font-semibold text-stone-800">{user.fssaiNumber || 'Verified FSSAI'}</span>
              </div>
            </>
          )}

          {user?.role === 'ngo' && (
            <>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium flex items-center gap-1.5"><Heart size={13} /> Organization:</span>
                <span className="font-semibold text-stone-800">{user.ngoName || 'Relief Foundation'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium">Daily Capacity:</span>
                <span className="font-semibold text-stone-800">{user.capacity || '200 people'}</span>
              </div>
            </>
          )}

          {user?.role === 'volunteer' && (
            <>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium flex items-center gap-1.5"><Truck size={13} /> Locality:</span>
                <span className="font-semibold text-stone-800">{user.locality || 'Sector 14'}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium">Transport Mode:</span>
                <span className="font-semibold text-stone-800">{user.transportMode || 'Bike'}</span>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout / Switch User</span>
          </button>
          <button
            onClick={onClose}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
