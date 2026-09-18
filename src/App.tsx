import React, { useState, useEffect } from 'react';
import { TabType, DonationOrder, ImpactStats } from './types';
import { initialOrder, initialStats } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { DonateView } from './components/DonateView';
import { ClaimView } from './components/ClaimView';
import { TrackingView } from './components/TrackingView';
import { ImpactView } from './components/ImpactView';
import { AuthPortal, UserProfile } from './components/auth/AuthPortal';

// Modals
import { CallModal } from './components/modals/CallModal';
import { UploadProofModal } from './components/modals/UploadProofModal';
import { TemplateModal } from './components/modals/TemplateModal';
import { VolunteerModal } from './components/modals/VolunteerModal';
import { SafetyWindowModal } from './components/modals/SafetyWindowModal';
import { TaxReceiptModal } from './components/modals/TaxReceiptModal';
import { ProfileModal } from './components/modals/ProfileModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mealbridge_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [order, setOrder] = useState<DonationOrder>(initialOrder);
  const [stats, setStats] = useState<ImpactStats>(initialStats);
  const [claimCount, setClaimCount] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [callModal, setCallModal] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
  });

  const [uploadProofModal, setUploadProofModal] = useState<{
    isOpen: boolean;
    title: string;
    type: 'handover' | 'food_detail' | 'delivery';
  }>({
    isOpen: false,
    title: '',
    type: 'handover',
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isTaxReceiptOpen, setIsTaxReceiptOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'donor') {
      setCurrentTab('donate');
      showToast(`Welcome Donor! Logged in as ${user.fullName} (${user.businessName || 'Establishment'}).`);
    } else if (user.role === 'ngo') {
      setCurrentTab('claim');
      showToast(`Welcome NGO Partner! Logged in as ${user.fullName} (${user.ngoName || 'Receiver'}).`);
    } else {
      setCurrentTab('home');
      showToast(`Welcome Volunteer! Logged in as ${user.fullName} (${user.locality || 'Rider Grid'}).`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mealbridge_active_user');
    setCurrentUser(null);
    showToast('Successfully logged out.');
  };

  // Handlers
  const handleOpenCall = (name: string, phone: string) => {
    setCallModal({
      isOpen: true,
      name,
      phone,
    });
  };

  const handlePostSurplus = (newDetails: Partial<DonationOrder>) => {
    setOrder((prev) => ({
      ...prev,
      ...newDetails,
      status: 'reported',
      currentStep: 2,
      stepPercentage: 40,
    }));
    setStats((prev) => ({
      ...prev,
      mealsSaved: prev.mealsSaved + (newDetails.servings || 85),
    }));
    showToast('Surplus broadcasted to 6 verified NGOs within 8 km! अन्न सफलतापूर्वक पोस्ट किया गया।');
    setTimeout(() => {
      setCurrentTab('claim');
    }, 1200);
  };

  const handleAcceptDonation = () => {
    setOrder((prev) => ({
      ...prev,
      status: 'in_transit',
      currentStep: 4,
      stepPercentage: 80,
    }));
    setClaimCount(0);
    showToast('Donation accepted! Van 03 dispatched for immediate pickup.');
    setTimeout(() => {
      setCurrentTab('tracking');
    }, 800);
  };

  const handlePassDonation = () => {
    showToast('Batch forwarded to next available shelter on live grid.');
  };

  const handleAdvanceStep = (step: number) => {
    const percentage = Math.round((step / 5) * 100);
    setOrder((prev) => ({
      ...prev,
      currentStep: step,
      stepPercentage: percentage,
      status: step === 5 ? 'delivered' : 'in_transit',
    }));
    if (step === 5) {
      showToast('Delivery completed! 85 meals successfully nourished shelter residents.');
    }
  };

  const handleUploadHandoverPhoto = () => {
    setUploadProofModal({
      isOpen: true,
      title: 'Handover Photo Verification',
      type: 'handover',
    });
  };

  const handleConfirmPortions = () => {
    setOrder((prev) => ({
      ...prev,
      handoverChecklist: {
        ...prev.handoverChecklist,
        portionsConfirmed: true,
      },
    }));
    showToast('Portion count verified: 85 / 85 plates loaded.');
  };

  const handleSubmitRating = (stars: number, feedback: string) => {
    setOrder((prev) => ({
      ...prev,
      rating: {
        stars,
        feedback,
        submitted: true,
      },
    }));
    showToast(`Thank you! ${stars}★ rating submitted to Roti Bank Relief.`);
  };

  const handleProofUploaded = (filename: string, photoUrl: string) => {
    setOrder((prev) => ({
      ...prev,
      photoUrl,
      photoFilename: filename,
      handoverChecklist: {
        ...prev.handoverChecklist,
        photoUploaded: true,
      },
    }));
    showToast('Tamper inspection photo verified via AI geo-tagging.');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-stone-900 flex justify-center selection:bg-amber-200">
      {/* Mandatory Authentication Gate if user is not logged in */}
      {!currentUser && (
        <AuthPortal onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Splash Screen */}
      {showSplash && currentUser && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#132238] flex flex-col items-center justify-center p-6 text-white cursor-pointer select-none"
        >
          <div className="flex flex-col items-center space-y-6 max-w-xs text-center">
            <div className="p-2 flex items-center justify-center">
              <img
                src="/assets/mealbridge-logo.png"
                alt="MealBridge अन्नसेतु Logo"
                className="w-32 h-auto object-contain drop-shadow-lg"
                loading="eager"
              />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black tracking-tight text-white">
                MEALBRIDGE
              </h1>
              <p className="text-sm font-bold text-stone-200">
                अन्नसेतु महा-अभियान
              </p>
              <p className="text-[11px] text-stone-400 uppercase tracking-widest pt-1">
                National Surplus Food Network
              </p>
            </div>
            <div className="w-24 h-1 bg-white/15 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>
            <span className="text-[10px] text-stone-400 tracking-wider">Tap to enter dashboard</span>
          </div>
        </div>
      )}

      {/* Container simulating mobile frame */}
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen relative flex flex-col shadow-2xl border-x border-stone-200/80">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenVolunteer={() => setIsVolunteerModalOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Interactive Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-[#132238] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-stone-300 hover:text-white ml-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-3 pb-20">
          {currentTab === 'home' && (
            <HomeView
              stats={stats}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onOpenVolunteer={() => setIsVolunteerModalOpen(true)}
              onOpenRescueHotline={() => handleOpenCall('Toll-Free Rescue Standby', '1800-6325-7388')}
            />
          )}

          {currentTab === 'donate' && (
            <DonateView
              onPostSurplus={handlePostSurplus}
              onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
              onChangePickupLocation={() =>
                showToast('Location confirmed: Royal Palace Banquet & Canteen, MG Road')
              }
              onChangeSafetyWindow={() => setIsSafetyModalOpen(true)}
              onRetakePhoto={() =>
                setUploadProofModal({
                  isOpen: true,
                  title: 'Food Visual Verification',
                  type: 'food_detail',
                })
              }
            />
          )}

          {currentTab === 'claim' && (
            <ClaimView
              onAcceptDonation={handleAcceptDonation}
              onPassDonation={handlePassDonation}
              onCallDonor={(name, phone) => handleOpenCall(name, phone)}
              onUploadDeliveryProof={() =>
                setUploadProofModal({
                  isOpen: true,
                  title: 'Upload Proof & Verify Delivery',
                  type: 'delivery',
                })
              }
            />
          )}

          {currentTab === 'tracking' && (
            <TrackingView
              order={order}
              onCallRider={(name, phone) => handleOpenCall(name, phone)}
              onUploadHandoverPhoto={handleUploadHandoverPhoto}
              onConfirmPortions={handleConfirmPortions}
              onSubmitRating={handleSubmitRating}
              onAdvanceTimelineStep={handleAdvanceStep}
            />
          )}

          {currentTab === 'impact' && (
            <ImpactView
              stats={stats}
              onDownload80G={() => setIsTaxReceiptOpen(true)}
            />
          )}
        </main>

        {/* Sticky Bottom Navigation */}
        <BottomNav
          activeTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          claimCount={claimCount}
        />

        {/* Interactive Modals */}
        <CallModal
          isOpen={callModal.isOpen}
          contactName={callModal.name}
          contactPhone={callModal.phone}
          onClose={() => setCallModal({ isOpen: false, name: '', phone: '' })}
        />

        <UploadProofModal
          isOpen={uploadProofModal.isOpen}
          title={uploadProofModal.title}
          onClose={() => setUploadProofModal({ isOpen: false, title: '', type: 'handover' })}
          onSuccess={handleProofUploaded}
        />

        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={(tpl) => {
            setOrder((prev) => ({
              ...prev,
              title: tpl.title,
              category: tpl.category,
              perishability: tpl.perishability,
              servings: tpl.servings,
              packaging: tpl.packaging,
              cookedAt: tpl.cookedAt,
              safeUntil: tpl.safeUntil,
              specialInstructions: tpl.instructions,
              photoUrl: tpl.photoUrl,
              photoFilename: tpl.photoFilename,
            }));
            showToast(`Template loaded: ${tpl.title}`);
          }}
        />

        <VolunteerModal
          isOpen={isVolunteerModalOpen}
          onClose={() => setIsVolunteerModalOpen(false)}
          onAcceptRun={() => {
            showToast('Assigned to Run #MB-9403! Switched to live dispatch.');
            setCurrentTab('tracking');
          }}
        />

        <SafetyWindowModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          onSave={(windowStr, ambientTemp) => {
            setOrder((prev) => ({
              ...prev,
              safeUntil: windowStr,
              ambientTemp,
            }));
            showToast(`AI window updated: ${windowStr} at ${ambientTemp}`);
          }}
        />

        <TaxReceiptModal
          isOpen={isTaxReceiptOpen}
          onClose={() => setIsTaxReceiptOpen(false)}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
