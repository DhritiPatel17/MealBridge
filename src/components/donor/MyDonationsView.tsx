import React, { useState } from 'react';
import { DonationRecord } from '../../services/donationStore';
import { ThankYouModal } from '../modals/ThankYouModal';
import { LiveOrderTracking } from './LiveOrderTracking';
import {
  Clock,
  Check,
  AlertCircle,
  Phone,
  Building2,
  MapPin,
  Utensils,
  Package,
  Calendar,
  Star,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface MyDonationsViewProps {
  donations: DonationRecord[];
  onCancelDonation: (id: string) => void;
  onGoToDonate: () => void;
  onRateDonation: (id: string, stars: number, comment?: string) => void;
  onCallNgo?: (name: string, phone: string) => void;
}

export const MyDonationsView: React.FC<MyDonationsViewProps> = ({
  donations,
  onCancelDonation,
  onGoToDonate,
  onRateDonation,
  onCallNgo,
}) => {
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Rating form state per donation ID
  const [ratingStates, setRatingStates] = useState<
    Record<string, { stars: number; comment: string }>
  >({});

  const handleSetStars = (id: string, stars: number) => {
    setRatingStates((prev) => ({
      ...prev,
      [id]: {
        stars,
        comment: prev[id]?.comment || '',
      },
    }));
  };

  const handleSetComment = (id: string, comment: string) => {
    setRatingStates((prev) => ({
      ...prev,
      [id]: {
        stars: prev[id]?.stars || 0,
        comment: comment.slice(0, 200),
      },
    }));
  };

  const handleSubmitRating = (id: string) => {
    const current = ratingStates[id];
    if (!current || current.stars === 0) return;

    onRateDonation(id, current.stars, current.comment);

    // Show popup once per order
    const hasSeen = localStorage.getItem(`mealbridge_donor_thanked_${id}`);
    if (!hasSeen) {
      localStorage.setItem(`mealbridge_donor_thanked_${id}`, 'true');
      setShowThankYouModal(true);
    }
  };

  // Active donations: waiting, accepted, on_the_way_pickup, reached_donor, picked_up, on_the_way_delivery, or delivered without rating
  const activeDonations = donations.filter(
    (d) => d.status !== 'cancelled' && !d.rating
  );

  // Completed donations: delivered and has rating
  const completedDonations = donations.filter(
    (d) => Boolean(d.rating) || (d.status === 'delivered' && Boolean(d.rating))
  );

  // If a tracking session is active, show the full LiveOrderTracking screen
  if (selectedTrackingId) {
    return (
      <LiveOrderTracking
        donationId={selectedTrackingId}
        onBack={() => setSelectedTrackingId(null)}
        onCallNgo={onCallNgo}
        onRateDonation={onRateDonation}
      />
    );
  }

  const getStatusBadge = (status: DonationRecord['status']) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="bg-[#ACC8E5]/30 text-[#112A46] border border-[#ACC8E5] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#112A46] animate-pulse" />
            Waiting for NGO / प्रतीक्षा में
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-[#ACC8E5] text-[#112A46] border border-[#112A46]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Accepted / स्वीकृत
          </span>
        );
      case 'on_the_way_pickup':
        return (
          <span className="bg-[#FDFD96] text-[#112A46] border border-[#D9D975] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            On Way / रास्ते में
          </span>
        );
      case 'reached_donor':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Reached / पहुंचे
          </span>
        );
      case 'picked_up':
        return (
          <span className="bg-[#FDFD96] text-[#112A46] border border-[#E3E36B] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Picked up / उठा लिया गया
          </span>
        );
      case 'on_the_way_delivery':
        return (
          <span className="bg-[#ACC8E5] text-[#112A46] border border-[#112A46]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            Delivering / वितरण जारी
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Check size={11} />
            Delivered / वितरित
          </span>
        );
      case 'not_accepted':
        return (
          <span className="bg-stone-200 text-stone-800 border border-stone-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Not Accepted / स्वीकार नहीं हुआ
          </span>
        );
      case 'expired':
        return (
          <span className="bg-stone-200 text-stone-800 border border-stone-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Expired / समय समाप्त
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-stone-200 text-stone-700 border border-stone-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Cancelled / रद्द कर दिया
          </span>
        );
    }
  };

  const renderTimeline = (item: DonationRecord) => {
    const { status } = item;

    if (status === 'not_accepted') {
      return (
        <div className="bg-stone-100 border border-stone-200 rounded-[12px] p-3 text-xs text-stone-700 flex items-start gap-2">
          <AlertCircle size={15} className="text-stone-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">No NGO accepted in time. Please try again.</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              किसी NGO ने समय पर स्वीकार नहीं किया। कृपया दोबारा कोशिश करें।
            </p>
          </div>
        </div>
      );
    }

    if (status === 'expired') {
      return (
        <div className="bg-stone-100 border border-stone-200 rounded-[12px] p-3 text-xs text-stone-700 flex items-start gap-2">
          <AlertCircle size={15} className="text-stone-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Food safe time is over.</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              भोजन का सुरक्षित समय समाप्त हो गया है।
            </p>
          </div>
        </div>
      );
    }

    if (status === 'cancelled') {
      return (
        <div className="bg-stone-100 border border-stone-200 rounded-[12px] p-3 text-xs text-stone-600 flex items-center gap-2">
          <AlertCircle size={15} className="text-stone-500 shrink-0" />
          <span>This donation was cancelled. / यह अनुरोध रद्द कर दिया गया था।</span>
        </div>
      );
    }

    const stepOrder = [
      'accepted',
      'on_the_way_pickup',
      'reached_donor',
      'picked_up',
      'on_the_way_delivery',
      'delivered',
    ];
    const currentIdx = stepOrder.indexOf(status);

    const steps = [
      { key: 'accepted', title: 'Accepted', time: item.acceptedAt },
      { key: 'on_the_way_pickup', title: 'On Way', time: item.onTheWayPickupAt },
      { key: 'reached_donor', title: 'Reached', time: item.reachedDonorAt },
      { key: 'picked_up', title: 'Picked Up', time: item.pickedUpAt },
      { key: 'on_the_way_delivery', title: 'Delivering', time: item.onTheWayDeliveryAt },
      { key: 'delivered', title: 'Delivered', time: item.deliveredAt },
    ];

    return (
      <div className="bg-white border border-[#ACC8E5] rounded-[12px] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black">
            Order Status / स्थिति
          </span>
          {status !== 'waiting' && (
            <button
              onClick={() => setSelectedTrackingId(item.id)}
              className="text-[11px] font-bold text-[#112A46] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Navigation size={12} />
              <span>Full Map / पूरा मैप</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-center text-xs">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx || (idx === currentIdx && status === 'delivered');
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step.key}
                className={`p-1.5 rounded-[8px] border flex flex-col items-center justify-between min-h-[56px] ${
                  isCurrent
                    ? 'bg-[#FDFD96] border-[#D9D975] text-[#112A46] font-bold'
                    : isCompleted
                    ? 'bg-[#ACC8E5]/30 border-[#ACC8E5] text-[#112A46]'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mb-0.5 border ${
                    isCompleted
                      ? 'bg-white border-[#112A46]/20 text-[#112A46]'
                      : isCurrent
                      ? 'bg-white border-[#112A46] text-[#112A46]'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check size={10} className="font-black text-[#112A46]" /> : idx + 1}
                </div>
                <span className="text-[9.5px] font-bold leading-tight truncate w-full">{step.title}</span>
                <span className="text-[8px] text-stone-600 font-normal truncate w-full mt-0.5">
                  {step.time || '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
        type="donor"
      />

      {/* Header Panel */}
      <div className="bg-[#112A46] rounded-[16px] p-5 text-white flex items-center justify-between gap-4 border border-[#ACC8E5]/40 shadow-[0_4px_14px_rgba(17,42,70,0.12)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ACC8E5] block">
            DONOR DASHBOARD / दानदाता डैशबोर्ड
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
            My Donations / मेरे दान
          </h1>
          <p className="text-xs text-[#ACC8E5] mt-0.5">
            Track your surplus food donations from post to verified community delivery.
          </p>
        </div>
        <button
          onClick={onGoToDonate}
          className="bg-[#FDFD96] hover:bg-[#f5f585] text-[#112A46] font-bold text-xs px-3.5 py-2 rounded-[10px] transition-colors shrink-0 cursor-pointer border border-[#E3E36B]"
        >
          + Donate
        </button>
      </div>

      {/* Donations List or Empty State */}
      {donations.length === 0 ? (
        <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-8 text-center space-y-4 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Utensils size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 text-base">
              No requests right now / अभी कोई अनुरोध नहीं है
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              You haven't posted any surplus food donations yet. When you post meals, they will appear here in real-time.
            </p>
          </div>
          <button
            onClick={onGoToDonate}
            className="bg-[#112A46] hover:bg-[#0c1e33] text-white font-bold text-xs px-5 py-3 rounded-[12px] transition-colors cursor-pointer shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
          >
            Post Food Surplus / अन्न दान करें
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Donations */}
          {activeDonations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#112A46]">
                Active Donation Requests / सक्रिय दान ({activeDonations.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {activeDonations.map((item) => {
                  const currentRating = ratingStates[item.id] || { stars: 0, comment: '' };
                  const isAccepted = ['accepted', 'on_the_way_pickup', 'reached_donor', 'picked_up', 'on_the_way_delivery', 'delivered'].includes(item.status);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-4 transition-all h-full flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Header: ID, Date, Category Badge & Status */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#ACC8E5] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">{item.id}</span>
                              <span className="text-[10px] bg-[#ACC8E5]/30 text-[#112A46] px-2 py-0.5 rounded-[10px] font-bold border border-[#ACC8E5]">
                                {item.category === 'pure-veg'
                                  ? 'Pure Veg / शाकाहारी'
                                  : item.category === 'non-veg'
                                  ? 'Non-Veg / मांसाहारी'
                                  : 'Mixed / मिश्रित'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(item.createdAt).toLocaleDateString([], {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>{getStatusBadge(item.status)}</div>
                        </div>

                        {/* Primary Food Overview */}
                        <div className="flex items-center justify-between bg-white rounded-[12px] p-3 border border-[#ACC8E5]">
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-stone-900">
                              {item.servings} Servings ({item.netMassKg} kg)
                            </div>
                            <div className="text-xs text-stone-600 flex items-center gap-1">
                              <Package size={12} className="text-stone-400" />
                              <span className="capitalize">{item.perishability} food</span>
                              <span>•</span>
                              <span>{item.packaging}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-stone-400 font-bold uppercase">Safe Until</div>
                            <div className="text-xs font-bold text-stone-800">{item.safeUntil}</div>
                          </div>
                        </div>

                        {/* Status Stepper Progression */}
                        {renderTimeline(item)}

                        {/* NGO Information Box & Live Tracking Button (Visible when accepted) */}
                        {isAccepted && (
                          <div className="bg-[#FAF9DE] border border-[#D9D975] rounded-[12px] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[#112A46] font-bold text-xs">
                                <Building2 size={15} className="text-[#112A46]" />
                                <span>Accepted NGO Partner / एनजीओ</span>
                              </div>
                              {item.isNgoVerified && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[10px] border border-emerald-300 flex items-center gap-1">
                                  <ShieldCheck size={11} />
                                  Verified Partner
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-sm font-bold text-stone-900">
                                  {item.ngoName || 'NGO Partner'}
                                </div>
                                {item.ngoPhone && (
                                  <div className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                                    <Phone size={12} className="text-stone-400" />
                                    <span>{item.ngoPhone}</span>
                                  </div>
                                )}
                              </div>

                              {item.ngoPhone && (
                                <button
                                  onClick={() => {
                                    if (onCallNgo) {
                                      onCallNgo(item.ngoName || 'NGO Partner', item.ngoPhone || '');
                                    } else {
                                      window.location.href = `tel:${item.ngoPhone}`;
                                    }
                                  }}
                                  className="bg-[#112A46] text-white p-2 rounded-[10px] hover:bg-[#0c1e33] transition-colors shrink-0 cursor-pointer"
                                  title="Call NGO"
                                >
                                  <Phone size={13} />
                                </button>
                              )}
                            </div>

                            {/* Prominent Track Order Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedTrackingId(item.id)}
                              className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-xs py-3 px-4 rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <Navigation size={14} className="text-[#FDFD96]" />
                              <span>Track Order Live / लाइव ट्रैक करें</span>
                            </button>
                          </div>
                        )}

                        {/* Delivery Confirmation & Rating Form (When Delivered & Not Yet Rated) */}
                        {item.status === 'delivered' && !item.rating && (
                          <div className="bg-white border-2 border-[#112A46] rounded-[12px] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#112A46]">
                                Delivery Confirmation / वितरण पुष्टि
                              </span>
                              {item.deliveredAt && (
                                <span className="text-[10px] text-stone-500 font-bold">
                                  {item.deliveredAt}
                                </span>
                              )}
                            </div>

                            {/* Delivery Photo */}
                            {item.deliveryProofPhoto ? (
                              <img
                                src={item.deliveryProofPhoto}
                                alt="Delivery Proof"
                                className="w-full h-36 object-cover rounded-[10px] border border-[#ACC8E5]"
                              />
                            ) : (
                              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-[10px] text-[11px] text-stone-600 text-center">
                                Photo proof uploaded by NGO partner.
                              </div>
                            )}

                            {/* Rating Form */}
                            <div className="pt-2 border-t border-[#ACC8E5] space-y-2">
                              <label className="block text-xs font-bold text-[#112A46]">
                                Rate {item.ngoName || 'the NGO'}:
                              </label>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleSetStars(item.id, star)}
                                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      size={22}
                                      className={
                                        star <= currentRating.stars
                                          ? 'text-amber-500 fill-amber-500'
                                          : 'text-stone-300'
                                      }
                                    />
                                  </button>
                                ))}
                              </div>

                              <input
                                type="text"
                                value={currentRating.comment}
                                onChange={(e) => handleSetComment(item.id, e.target.value)}
                                placeholder="Write a short thank you note..."
                                className="w-full bg-stone-50 border border-stone-200 rounded-[8px] p-2 text-xs text-black"
                              />

                              <button
                                onClick={() => handleSubmitRating(item.id)}
                                disabled={currentRating.stars === 0}
                                className={`w-full text-xs font-bold py-2.5 rounded-[10px] transition-all cursor-pointer ${
                                  currentRating.stars > 0
                                    ? 'bg-[#112A46] text-white hover:bg-[#0c1e33]'
                                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                }`}
                              >
                                Submit Rating / रेटिंग सबमिट करें
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cancel Button (only when status is waiting) */}
                      {item.status === 'waiting' && (
                        <div className="pt-3 border-t border-[#ACC8E5]">
                          {confirmCancelId === item.id ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-rose-700 font-bold">Confirm cancel?</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onCancelDonation(item.id)}
                                  className="text-xs font-bold bg-rose-600 text-white px-3 py-1 rounded-[8px] cursor-pointer"
                                >
                                  Yes, Cancel
                                </button>
                                <button
                                  onClick={() => setConfirmCancelId(null)}
                                  className="text-xs font-bold bg-stone-200 text-stone-700 px-3 py-1 rounded-[8px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCancelId(item.id)}
                              className="text-xs font-bold text-stone-500 hover:text-rose-600 cursor-pointer"
                            >
                              Cancel Donation Request / अनुरोध रद्द करें
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Donations */}
          {completedDonations.length > 0 && (
            <div className="pt-4 space-y-3">
              <div>
                <h2 className="text-sm font-bold text-[#112A46]">
                  Past Completed Donations / पूर्व दान ({completedDonations.length})
                </h2>
                <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDonations.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)] flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#ACC8E5] pb-2.5">
                      <div>
                        <div className="text-sm font-bold text-stone-900">{item.id}</div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.deliveredAt ? `Delivered at ${item.deliveredAt}` : 'Delivered'}
                        </p>
                      </div>
                      <span className="bg-[#ACC8E5] text-[#112A46] text-[11px] font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 space-y-1">
                      <div>
                        <span className="font-bold">Quantity: </span>
                        <span>{item.servings} Servings ({item.netMassKg} kg)</span>
                      </div>
                      <div>
                        <span className="font-bold">Distributed by: </span>
                        <span>{item.ngoName || 'NGO Partner'}</span>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1 pt-1 text-amber-500">
                          <Star size={14} className="fill-amber-500" />
                          <span className="font-bold text-stone-800">{item.rating.stars} / 5 Stars</span>
                        </div>
                      )}
                    </div>

                    {item.deliveryProofPhoto && (
                      <div className="pt-2 border-t border-[#ACC8E5]">
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                          Delivery Proof Photo:
                        </span>
                        <img
                          src={item.deliveryProofPhoto}
                          alt="Delivery Proof"
                          className="w-full h-32 object-cover rounded-[10px] border border-[#ACC8E5]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
