import React, { useState } from 'react';
import { DonationRecord } from '../../services/donationStore';
import { ThankYouModal } from '../modals/ThankYouModal';
import {
  Clock,
  Check,
  AlertCircle,
  Phone,
  Building2,
  MapPin,
  Utensils,
  XCircle,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  CheckCircle2,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Rating form state per donation ID
  const [ratingStates, setRatingStates] = useState<
    Record<string, { stars: number; comment: string }>
  >({});

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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

  // Active donations: waiting, accepted, picked_up, or delivered without rating
  const activeDonations = donations.filter(
    (d) => d.status !== 'cancelled' && (!d.rating)
  );

  // Completed donations: delivered and has rating
  const completedDonations = donations.filter(
    (d) => Boolean(d.rating) || (d.status === 'delivered' && Boolean(d.rating))
  );

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
      case 'picked_up':
        return (
          <span className="bg-[#FDFD96] text-[#112A46] border border-[#E3E36B] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Picked up / ले लिया गया
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-[#ACC8E5] text-[#112A46] border border-[#112A46]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
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

    const stepOrder = ['waiting', 'accepted', 'picked_up', 'delivered'];
    const currentIdx = stepOrder.indexOf(status);

    const steps = [
      {
        key: 'waiting',
        title: 'Waiting for NGO',
        hindi: 'प्रतीक्षा',
        time: item.createdAt
          ? new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
          : '',
      },
      {
        key: 'accepted',
        title: 'Accepted',
        hindi: 'स्वीकृत',
        time: item.acceptedAt || '',
      },
      {
        key: 'picked_up',
        title: 'Picked up',
        hindi: 'उठा लिया',
        time: item.pickedUpAt || '',
      },
      {
        key: 'delivered',
        title: 'Delivered',
        hindi: 'वितरित',
        time: item.deliveredAt || '',
      },
    ];

    return (
      <div className="bg-white border border-[#ACC8E5] rounded-[12px] p-3.5 space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-black">
          Status Tracker / स्थिति ट्रैकर
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx || (idx === currentIdx && status === 'delivered');
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step.key}
                className={`p-2 rounded-[10px] border flex flex-col items-center justify-between ${
                  isCurrent
                    ? 'bg-[#FDFD96] border-[#D9D975] text-[#112A46] font-bold'
                    : isCompleted
                    ? 'bg-[#ACC8E5]/30 border-[#ACC8E5] text-[#112A46]'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 border ${
                    isCompleted
                      ? 'bg-white border-[#112A46]/20 text-[#112A46]'
                      : isCurrent
                      ? 'bg-white border-[#112A46] text-[#112A46]'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check size={11} className="font-black text-[#112A46]" /> : idx + 1}
                </div>
                <span className="text-[10px] font-bold leading-tight">{step.title}</span>
                <span className="text-[9px] text-stone-600 font-normal mt-0.5 truncate max-w-full">
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
            Track your surplus food donations from post to delivery.
          </p>
        </div>
        <button
          onClick={onGoToDonate}
          className="bg-[#FDFD96] hover:bg-[#f5f585] text-[#112A46] font-bold text-xs px-3.5 py-2 rounded-[10px] transition-colors shrink-0 cursor-pointer border border-[#E3E36B] shadow-none"
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
                  const isExpanded = expandedId === item.id;
                  const currentRating = ratingStates[item.id] || { stars: 0, comment: '' };

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-4 transition-all h-full flex flex-col justify-between"
                    >
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

                {/* NGO Information Box (Visible when accepted or picked up) */}
                {(item.status === 'accepted' || item.status === 'picked_up') && (
                  <div className="bg-white border border-[#ACC8E5] rounded-[12px] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#112A46] font-bold text-xs">
                        <Building2 size={15} className="text-[#112A46]" />
                        <span>Accepted NGO Partner / स्वीकारकर्ता एनजीओ</span>
                      </div>
                      {item.isNgoVerified && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[10px] border border-emerald-300 flex items-center gap-1">
                          <ShieldCheck size={11} />
                          Verified Partner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
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
                        <div className="text-[11px] text-stone-500 mt-1">
                          Pickup Status:{' '}
                          <span className="font-bold text-stone-800">
                            {item.status === 'accepted' && 'NGO is on the way for pickup'}
                            {item.status === 'picked_up' && 'Food picked up • In transit to distribution center'}
                          </span>
                        </div>
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
                          className="bg-[#112A46] text-white p-2.5 rounded-[12px] transition-colors shrink-0 cursor-pointer"
                          title="Call NGO"
                        >
                          <Phone size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------- DELIVERY CARD (When NGO marks Delivered & Not Yet Rated) ---------------- */}
                {item.status === 'delivered' && !item.rating && (
                  <div className="bg-white border-2 border-[#112A46] rounded-[12px] p-5 space-y-4">
                    {/* Header */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#112A46] block">
                        Delivery Confirmation / वितरण पुष्टि
                      </span>
                      <h3 className="text-sm font-bold text-[#112A46] mt-0.5">
                        Your food was delivered by {item.ngoName || 'NGO Partner'} /{' '}
                        {item.ngoName || 'NGO'} ने आपका खाना बाँट दिया
                      </h3>
                      {item.deliveredAt && (
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          Delivered at {item.deliveredAt}
                        </p>
                      )}
                    </div>

                    {/* Photo section: Real photo or "No photo shared" */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Delivery Photo:
                      </span>
                      {item.deliveryProofPhoto ? (
                        <img
                          src={item.deliveryProofPhoto}
                          alt="Delivery Proof"
                          className="w-full h-44 object-cover rounded-[12px] border border-[#ACC8E5]"
                        />
                      ) : (
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-[12px] text-xs text-stone-600 text-center font-normal">
                          No photo shared by the NGO / NGO ने कोई फोटो नहीं डाली
                        </div>
                      )}
                    </div>

                    {/* Rating Section (1 to 5 stars, required) */}
                    <div className="pt-2 border-t border-[#ACC8E5] space-y-2">
                      <label className="block text-xs font-bold text-[#112A46]">
                        How would you rate {item.ngoName || 'the NGO'}? / आप {item.ngoName || 'NGO'} को कितनी रेटिंग देंगे? *
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isSelected = star <= currentRating.stars;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleSetStars(item.id, star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                              aria-label={`${star} star`}
                            >
                              <Star
                                size={26}
                                className={
                                  isSelected
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300 hover:text-amber-400'
                                }
                              />
                            </button>
                          );
                        })}
                        {currentRating.stars > 0 && (
                          <span className="text-xs font-bold text-[#112A46] ml-2">
                            {currentRating.stars} / 5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Optional Comment Box (Max 200 chars, NO placeholder) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#112A46]">
                          Anything to tell us? / कुछ कहना चाहते हैं?
                        </label>
                        <span className="text-[10px] text-stone-500">
                          {currentRating.comment.length}/200
                        </span>
                      </div>
                      <textarea
                        value={currentRating.comment}
                        onChange={(e) => handleSetComment(item.id, e.target.value)}
                        maxLength={200}
                        rows={3}
                        className="w-full bg-stone-50 border border-stone-200 rounded-[12px] p-3 text-xs text-stone-900 focus:outline-none focus:border-[#112A46] focus:bg-white resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => handleSubmitRating(item.id)}
                      disabled={currentRating.stars === 0}
                      className={`w-full font-bold text-xs py-3 px-4 rounded-[12px] transition-colors cursor-pointer text-center ${
                        currentRating.stars > 0
                          ? 'bg-[#112A46] hover:bg-[#0c1e33] text-white'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      Submit / जमा करें
                    </button>
                  </div>
                )}

                {/* Cancel Request Button: Allowed only before NGO accepts */}
                {item.status === 'waiting' && (
                  <div className="pt-1">
                    {confirmCancelId !== item.id ? (
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-stone-500">
                          You can cancel this donation request before it is claimed.
                        </p>
                        <button
                          onClick={() => setConfirmCancelId(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-[12px] border border-red-200 transition-colors cursor-pointer"
                        >
                          Cancel / रद्द करें
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] space-y-2">
                        <p className="text-xs font-bold text-red-800">
                          Are you sure you want to cancel? / क्या आप वाकई रद्द करना चाहते हैं?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onCancelDonation(item.id);
                              setConfirmCancelId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-[10px] cursor-pointer"
                          >
                            Yes, Cancel / हाँ, रद्द करें
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="bg-white border border-stone-300 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-[10px] cursor-pointer hover:bg-stone-50"
                          >
                            No, Keep / नहीं, रहने दें
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable Details toggle */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full pt-1 text-center text-xs font-bold text-stone-500 hover:text-[#112A46] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Full Details / पूरा विवरण'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-600 animate-in fade-in duration-200">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-800">Pickup Address: </span>
                        <span>{item.donorAddress}</span>
                        {item.landmark && <span className="text-stone-500"> (Landmark: {item.landmark})</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-stone-400 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-800">Safe Until: </span>
                        <span>{item.safeUntil}</span>
                      </div>
                    </div>

                    {item.specialInstructions && (
                      <div className="bg-stone-50 rounded-[12px] p-2.5 text-stone-600 border border-stone-100">
                        <span className="font-bold text-stone-800">Instructions: </span>
                        <span>{item.specialInstructions}</span>
                      </div>
                    )}
                  </div>
                )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- COMPLETED DONATIONS LIST ---------------- */}
          {completedDonations.length > 0 && (
            <div className="pt-4 space-y-3">
              <div>
                <h2 className="text-sm font-bold text-[#112A46]">
                  Completed Donations / पूरे हुए दान ({completedDonations.length})
                </h2>
                <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDonations.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)] flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#ACC8E5] pb-2.5">
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
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.servings} Servings ({item.netMassKg} kg)
                          {item.deliveredAt && <span> • Delivered at {item.deliveredAt}</span>}
                        </p>
                      </div>

                      <span className="bg-[#ACC8E5] text-[#112A46] text-[11px] font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="p-3 bg-stone-50 rounded-[12px] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-stone-400 block">
                            Delivered By
                          </span>
                          <span className="font-bold text-stone-800">
                            {item.ngoName || 'NGO Partner'}
                          </span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-1 bg-[#FDFD96] border border-[#E3E36B] px-2.5 py-1 rounded-[10px]">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="font-bold text-xs text-[#112A46]">
                              {item.rating.stars} / 5
                            </span>
                          </div>
                        )}
                      </div>

                      {item.rating?.comment && (
                        <div className="p-2.5 bg-white rounded-[10px] border border-stone-200 text-stone-700 italic">
                          "{item.rating.comment}"
                        </div>
                      )}

                      {/* Photo Section */}
                      {item.deliveryProofPhoto ? (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Delivery Proof Photo:
                          </span>
                          <img
                            src={item.deliveryProofPhoto}
                            alt="Delivery Proof"
                            className="w-full h-36 object-cover rounded-[12px] border border-[#ACC8E5]"
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500 italic">
                          No photo shared by the NGO / NGO ने कोई फोटो नहीं डाली
                        </p>
                      )}
                    </div>
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
