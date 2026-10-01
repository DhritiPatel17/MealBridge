import React, { useState, useEffect, useCallback } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { DonateView } from './components/DonateView';
import { AuthPortal, UserProfile } from './components/auth/AuthPortal';
import { MyDonationsView } from './components/donor/MyDonationsView';
import { NewRequestsView } from './components/ngo/NewRequestsView';
import { MyPickupsView } from './components/ngo/MyPickupsView';
import { RoleProfileView } from './components/profile/RoleProfileView';
import { CallModal } from './components/modals/CallModal';
import { LegalModal, LegalDocType } from './components/legal/LegalModal';
import { Footer } from './components/common/Footer';
import { donationStore, DonationRecord } from './services/donationStore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('mealbridge_active_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    return donationStore.getDonations();
  });

  // Determine initial tab: after login or on open, defaults to home
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Call modal state
  const [callModal, setCallModal] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
  });

  // Legal modal state
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    doc: LegalDocType;
  }>({
    isOpen: false,
    doc: 'terms',
  });

  const handleOpenLegal = (doc: LegalDocType) => {
    setLegalModal({ isOpen: true, doc });
  };

  // Subscribe to shared store changes (for real-time updates across tabs/roles)
  useEffect(() => {
    const unsubscribe = donationStore.subscribe(() => {
      setDonations(donationStore.getDonations());
    });
    const interval = setInterval(() => {
      setDonations(donationStore.getDonations());
    }, 1000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Route & URL guard logic: Home is shared by both roles
  const validateAndRedirectTab = useCallback(
    (targetTab: string, role: 'donor' | 'ngo'): TabType => {
      const donorAllowed: TabType[] = ['home', 'donate', 'my-donations', 'profile'];
      const ngoAllowed: TabType[] = ['home', 'new-requests', 'my-pickups', 'profile'];

      if (role === 'donor') {
        if (donorAllowed.includes(targetTab as TabType)) {
          return targetTab as TabType;
        }
        return 'home';
      } else {
        if (ngoAllowed.includes(targetTab as TabType)) {
          return targetTab as TabType;
        }
        return 'home';
      }
    },
    []
  );

  // Sync tab with URL hash and guard unauthorized access
  useEffect(() => {
    if (!currentUser) return;

    const syncHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validTab = validateAndRedirectTab(hash || currentTab, currentUser.role);
      if (validTab !== currentTab) {
        setCurrentTab(validTab);
      }
      if (window.location.hash !== `#${validTab}`) {
        window.location.hash = validTab;
      }
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [currentUser, currentTab, validateAndRedirectTab]);

  const handleTabChange = (tab: TabType) => {
    if (!currentUser) return;
    const safeTab = validateAndRedirectTab(tab, currentUser.role);
    setCurrentTab(safeTab);
    window.location.hash = safeTab;
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentTab('home');
    window.location.hash = 'home';
    if (user.role === 'ngo') {
      showToast(`Welcome! Logged in as NGO (${user.ngoName || user.fullName})`);
    } else {
      showToast(`Welcome! Logged in as Donor (${user.businessName || user.fullName})`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mealbridge_active_user');
    setCurrentUser(null);
    setCurrentTab('home');
    window.location.hash = '';
    showToast('Successfully logged out / सफलतापूर्वक लॉगआउट किया गया।');
  };

  // Donor Actions
  const handlePostSurplus = (newDetails: any) => {
    const created = donationStore.addDonation({
      donorId: currentUser?.id || 'usr_donor',
      donorBusinessName:
        newDetails.donorBusinessName ||
        currentUser?.businessName ||
        newDetails.donorName ||
        'Taj Caterers & Kitchen',
      donorName: newDetails.donorName || currentUser?.fullName || 'Taj Caterers',
      donorPhone: newDetails.donorPhone || currentUser?.phone || '+91 98201 44921',
      donorAddress: newDetails.donorAddress || currentUser?.address || 'Connaught Place, New Delhi',
      donorArea: newDetails.donorArea || 'Central Delhi',
      distanceKm: newDetails.distanceKm || 1.4,
      landmark: newDetails.landmark,
      donorNote: newDetails.donorNote,
      category: newDetails.category,
      perishability: newDetails.perishability,
      servings: newDetails.servings,
      netMassKg: newDetails.netMassKg,
      packaging: newDetails.packaging,
      packingTypes: newDetails.packingTypes,
      cookedAt: newDetails.cookedAt,
      safeUntil: newDetails.safeUntil,
      safeUntilTimestamp: newDetails.safeUntilTimestamp,
      pickupTime: newDetails.pickupTime,
      specialInstructions: newDetails.specialInstructions,
      foodStorage: newDetails.foodStorage,
    });

    setDonations(donationStore.getDonations());
    showToast(`Donation ${created.id} posted! Waiting for an NGO to accept.`);
    handleTabChange('my-donations');
  };

  const handleCancelDonation = (id: string) => {
    const success = donationStore.cancelDonation(id);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Donation request cancelled.');
    }
  };

  // NGO Actions
  const handleAcceptRequest = (id: string) => {
    const res = donationStore.acceptDonation(id, {
      id: currentUser?.id || 'usr_ngo',
      name: currentUser?.ngoName || currentUser?.fullName || 'NGO Partner',
      phone: currentUser?.phone || '',
      address: currentUser?.address,
      regNumber: currentUser?.regNumber,
      isVerified: currentUser?.isVerified || false,
    });

    setDonations(donationStore.getDonations());

    if (res.success) {
      showToast('Donation accepted! Order added to My Pickups.');
      handleTabChange('my-pickups');
    } else if (res.reason === 'already_taken') {
      showToast('Already taken by another NGO / किसी और NGO ने ले लिया');
    } else if (res.reason === 'expired') {
      showToast('This request has expired / यह अनुरोध समाप्त हो गया है');
    } else {
      showToast('Could not accept request. Please refresh.');
    }
  };

  const handleMarkPickedUp = (id: string) => {
    const success = donationStore.markPickedUp(id);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Order marked as Picked Up / ले लिया गया!');
    }
  };

  const handleMarkDelivered = (id: string) => {
    const success = donationStore.markDelivered(id);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Order marked as Delivered / वितरित कर दिया!');
    }
  };

  const handleUploadPhoto = (id: string, photoUrl: string) => {
    const success = donationStore.updateProofPhoto(id, photoUrl);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Delivery proof photo uploaded successfully!');
    }
  };

  const handleNgoDone = (id: string) => {
    const success = donationStore.markNgoDone(id);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Order completed! / कार्य पूरा हुआ!');
    }
  };

  const handleRateDonation = (id: string, stars: number, comment?: string) => {
    const success = donationStore.rateDonation(id, stars, comment);
    if (success) {
      setDonations(donationStore.getDonations());
      showToast('Rating submitted! / रेटिंग दर्ज की गई!');
    }
  };

  const handleOpenCall = (name: string, phone: string) => {
    setCallModal({
      isOpen: true,
      name,
      phone,
    });
  };

  // Filtered lists for Donor and NGO views
  const isDonor = currentUser?.role === 'donor';
  const isNgo = currentUser?.role === 'ngo';

  // For Donor: show their own requests (or all if demo session)
  const donorDonations = donations.filter(
    (d) => !currentUser || d.donorId === currentUser.id || d.donorName === currentUser.fullName || isDonor
  );

  // For NGO:
  // 1. New requests awaiting NGO acceptance (status === 'waiting')
  const newRequests = donations.filter((d) => d.status === 'waiting');
  // 2. Pickups accepted by NGOs (accepted, picked_up, delivered)
  const myPickups = donations.filter(
    (d) => d.status === 'accepted' || d.status === 'picked_up' || d.status === 'delivered'
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FDFD96] relative w-full bg-stone-50/30 text-black">
      {/* Full-screen Fixed Page Gradient Layer behind all content */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: 'var(--page-gradient)' }}
        aria-hidden="true"
      />

      {/* Authentication Gate: If not logged in, show AuthPortal */}
      {!currentUser && (
        <AuthPortal
          onLoginSuccess={handleLoginSuccess}
          onOpenLegal={handleOpenLegal}
        />
      )}

      {/* Main App Shell */}
      <div className="w-full min-h-screen relative flex flex-col bg-transparent">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onOpenVolunteer={() => {}}
          onOpenProfile={() => handleTabChange('profile')}
          userRole={currentUser?.role}
          onLogout={currentUser ? handleLogout : undefined}
          pendingRequestsCount={newRequests.length}
          activePickupsCount={myPickups.filter((p) => p.status === 'accepted' || p.status === 'picked_up').length}
          myDonationsCount={donorDonations.filter((d) => d.status === 'waiting' || d.status === 'accepted').length}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[#112A46] text-white text-xs font-bold px-4 py-3 rounded-[12px] border border-[#ACC8E5] flex items-center justify-between shadow-lg">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#ACC8E5] hover:text-white ml-2 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area: STRICTLY ROLE-BASED & Max 1200px centered */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 sm:pb-10">
          {/* Shared Home Page for both roles */}
          {currentTab === 'home' && currentUser && (
            <HomeView
              currentUser={currentUser}
              donations={donations}
              onNavigate={handleTabChange}
            />
          )}

          {/* DONOR SPECIFIC VIEWS */}
          {isDonor && (
            <>
              {currentTab === 'donate' && (
                <DonateView
                  onPostSurplus={handlePostSurplus}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'my-donations' && (
                <MyDonationsView
                  donations={donorDonations}
                  onCancelDonation={handleCancelDonation}
                  onGoToDonate={() => handleTabChange('donate')}
                  onRateDonation={handleRateDonation}
                  onCallNgo={(name, phone) => handleOpenCall(name, phone)}
                />
              )}

              {currentTab === 'profile' && (
                <RoleProfileView
                  user={currentUser}
                  onLogout={handleLogout}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
                />
              )}
            </>
          )}

          {/* NGO SPECIFIC VIEWS */}
          {isNgo && (
            <>
              {currentTab === 'new-requests' && (
                <NewRequestsView
                  requests={newRequests}
                  currentUser={currentUser}
                  onAcceptRequest={handleAcceptRequest}
                  onCallDonor={(name, phone) => handleOpenCall(name, phone)}
                />
              )}

              {currentTab === 'my-pickups' && (
                <MyPickupsView
                  pickups={myPickups}
                  currentUser={currentUser}
                  onMarkPickedUp={handleMarkPickedUp}
                  onMarkDelivered={handleMarkDelivered}
                  onUploadPhoto={handleUploadPhoto}
                  onNgoDone={handleNgoDone}
                  onCallDonor={(name, phone) => handleOpenCall(name, phone)}
                  onGoToProfile={() => handleTabChange('profile')}
                />
              )}

              {currentTab === 'profile' && (
                <RoleProfileView
                  user={currentUser}
                  onLogout={handleLogout}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
                />
              )}
            </>
          )}

          {/* Footer with Legal Links */}
          <Footer onOpenLegal={handleOpenLegal} />
        </main>

        {/* Role-Based Bottom Navigation */}
        {currentUser && (
          <BottomNav
            role={currentUser.role}
            activeTab={currentTab}
            onTabChange={handleTabChange}
            pendingRequestsCount={newRequests.length}
            activePickupsCount={myPickups.filter((p) => p.status === 'accepted' || p.status === 'picked_up').length}
            myDonationsCount={donorDonations.filter((d) => d.status === 'waiting' || d.status === 'accepted').length}
          />
        )}

        {/* Calling Modal */}
        <CallModal
          isOpen={callModal.isOpen}
          contactName={callModal.name}
          contactPhone={callModal.phone}
          onClose={() => setCallModal({ isOpen: false, name: '', phone: '' })}
        />

        {/* Legal & Privacy Modal */}
        <LegalModal
          isOpen={legalModal.isOpen}
          initialTab={legalModal.doc}
          onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        />
      </div>
    </div>
  );
}
