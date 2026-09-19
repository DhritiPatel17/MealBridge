import React, { useState } from 'react';
import { TabType } from '../types';
import { UserProfile } from './auth/AuthPortal';
import { DonationRecord } from '../services/donationStore';
import { vadodaraNgos } from '../data/vadodaraNgos';
import { pilotStatsConfig } from '../config/pilotStats';
import { MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import ourIdeaImg from '../assets/our-idea.jpg';

interface HomeViewProps {
  currentUser: UserProfile;
  donations: DonationRecord[];
  onNavigate: (tab: TabType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [imgError, setImgError] = useState(false);
  const isDonor = currentUser.role === 'donor';
  const isNgo = currentUser.role === 'ngo';

  // Greeting name
  const greetingName = isNgo
    ? currentUser.ngoName || currentUser.fullName || 'Partner'
    : currentUser.businessName || currentUser.fullName || 'Friend';

  return (
    <div className="space-y-5 pb-14 pt-1 text-black">
      {/* 1. Top Hero Section */}
      <div className="space-y-3">
        {/* Row with Chip, Title, Hindi Subtitle & Logo on Right */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="space-y-1">
            <span className="inline-block bg-[#ACC8E5] text-black text-[11px] font-bold px-2.5 py-0.5 rounded-[6px] uppercase tracking-wider border border-[#112A46]/10">
              FOOD SHARING NETWORK
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#112A46] leading-none pt-1">
              MealBridge
            </h1>
            <p className="text-xl font-bold text-[#112A46] leading-tight">
              अन्नसेतु
            </p>
          </div>

          {/* Sticker-style Logo (about 90px wide, no background, no tile, no shadow) */}
          <div className="shrink-0 flex items-center justify-end">
            <img
              src="/assets/mealbridge-logo.png"
              alt="MealBridge Logo"
              className="w-[90px] h-auto object-contain block select-none"
              style={{ imageRendering: 'auto' }}
              loading="eager"
            />
          </div>
        </div>

        {/* OUR IDEA Card with Background Photo & Navy Gradient Overlay */}
        <div
          id="our-idea-card"
          className="relative rounded-[16px] overflow-hidden border border-[#ACC8E5]/40 shadow-[0_4px_14px_rgba(17,42,70,0.12)] min-h-[250px] sm:min-h-[260px] flex flex-col justify-end bg-[#112A46]"
        >
          {/* Background Photo */}
          {!imgError && (
            <img
              src={ourIdeaImg}
              onError={() => setImgError(true)}
              alt="Happy children sharing meal"
              className="absolute inset-0 w-full h-full object-cover object-[left_top] select-none"
              loading="eager"
            />
          )}

          {/* Navy Overlay: 10% at top (girl's smile clearly visible) to 88% at bottom for high text contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(17, 42, 70, 0.10) 0%, rgba(17, 42, 70, 0.35) 40%, rgba(17, 42, 70, 0.88) 95%)',
            }}
          />

          {/* Text block placed at the bottom of the card - text stays fully solid */}
          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#FDFD96] text-black text-[11px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
                OUR IDEA
              </span>
              <span className="text-xs font-semibold text-[#ACC8E5] tracking-wide">
                From Excess to Access
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              "जहाँ खाना बचता है, वहाँ से ज़रूरतमंद तक पहुँचे।"
            </p>
            <p className="text-xs text-[#ACC8E5] leading-normal font-normal">
              Extra food from kitchens, shared with people who need it.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Greeting, Primary Action & 4-Card Stats Block */}
      <div className="bg-white rounded-[16px] p-5 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-3.5">
        <div>
          <p className="text-xs text-black/75 font-medium">Welcome back</p>
          <h2 className="text-lg font-bold text-[#112A46]">
            Hello, {greetingName}
          </h2>
        </div>

        {/* Primary Role Action Button */}
        {isDonor ? (
          <button
            onClick={() => onNavigate('donate')}
            className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-4 rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
          >
            <span>Donate Food / खाना दान करें</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('new-requests')}
            className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-4 rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
          >
            <span>View New Requests / नए अनुरोध देखें</span>
            <ArrowRight size={16} />
          </button>
        )}

        {/* 4-Card Stats Block in 2x2 Grid */}
        <div className="pt-2 border-t border-stone-200 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {pilotStatsConfig.map((stat) => (
              <div
                key={stat.id}
                className="bg-white rounded-[12px] p-3 border border-[#ACC8E5] flex flex-col items-center text-center justify-center shadow-2xs"
              >
                <span className="text-[10px] tracking-wider font-bold text-black/80 uppercase">
                  {stat.labelEn}
                </span>
                <span className="text-xl font-extrabold text-[#112A46] my-0.5">
                  {stat.number}
                </span>
                <span className="text-[11px] font-semibold text-black">
                  {stat.labelHi}
                </span>
              </div>
            ))}
          </div>

          {/* Tagline & pilot note */}
          <div className="text-center pt-1 space-y-0.5">
            <p className="text-xs italic text-black font-semibold leading-tight">
              "हर थाली जो बची, किसी की मुस्कान बनी • Har Thali Jo Bachi, Kisi Ki Muskaan Bani"
            </p>
            <p className="text-[10px] text-stone-600 font-medium">
              Pilot estimates for Vadodara / वडोदरा के लिए अनुमान
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section: "How MealBridge Works / कैसे काम करता है" */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#112A46]">
            How MealBridge Works / कैसे काम करता है
          </h2>
          <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
        </div>

        <div className="space-y-2.5">
          {/* Card 01 */}
          <div className="bg-white rounded-[16px] p-4 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#112A46] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                01
              </span>
              <h3 className="text-xs font-bold text-[#112A46]">
                Donor posts the food details / दानदाता खाने की जानकारी डालता है
              </h3>
            </div>
            <p className="text-xs text-black font-normal leading-relaxed pl-8">
              Restaurants, hotels and canteens fill in the food type, quantity,
              cooked time, packing and pickup address.
            </p>
          </div>

          {/* Card 02 */}
          <div className="bg-white rounded-[16px] p-4 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#112A46] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                02
              </span>
              <h3 className="text-xs font-bold text-[#112A46]">
                Nearby NGOs get notified / पास के NGO को सूचना मिलती है
              </h3>
            </div>
            <p className="text-xs text-black font-normal leading-relaxed pl-8">
              MealBridge sends the request to registered NGOs nearby. The first
              NGO to accept gets the order. If no one accepts in 10 minutes, the
              request is cancelled.
            </p>
          </div>

          {/* Card 03 */}
          <div className="bg-white rounded-[16px] p-4 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#112A46] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                03
              </span>
              <h3 className="text-xs font-bold text-[#112A46]">
                Pickup and delivery / पिकअप और डिलीवरी
              </h3>
            </div>
            <p className="text-xs text-black font-normal leading-relaxed pl-8">
              The NGO picks up the food, gives it to people in need and can
              share a photo. The donor can then rate the NGO.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Section: "NGOs in Vadodara / वडोदरा के NGO" */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#112A46]">
            NGOs in Vadodara / वडोदरा के NGO
          </h2>
          <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
          <p className="text-xs text-black font-normal leading-relaxed mt-1.5">
            These NGOs are listed for information. Only NGOs marked 'Registered
            on MealBridge' can receive donations here. / ये NGO जानकारी के लिए
            दिए गए हैं। सिर्फ 'Registered on MealBridge' वाले NGO यहाँ दान ले
            सकते हैं।
          </p>
        </div>

        <div className="space-y-3">
          {vadodaraNgos.map((ngo) => {
            const mapsUrl = typeof ngo.latitude === 'number' && typeof ngo.longitude === 'number'
              ? `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ngo.name + ', ' + ngo.address)}`;

            return (
              <div
                key={ngo.id}
                className="bg-white rounded-[16px] p-4 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#112A46] leading-snug">
                    {ngo.name}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#ACC8E5] text-black text-[11px] font-bold px-2.5 py-0.5 rounded-[6px]">
                      {ngo.area}
                    </span>
                    {ngo.isRegisteredOnMealBridge && (
                      <span className="bg-[#FDFD96] text-black text-[11px] font-bold px-2 py-0.5 rounded-[6px] border border-[#E3E36B]">
                        Registered on MealBridge
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-black font-normal leading-relaxed">
                  {ngo.focus}
                </p>

                <div className="text-xs text-black font-normal flex items-start gap-1.5 pt-0.5">
                  <MapPin size={14} className="text-[#112A46] shrink-0 mt-0.5" />
                  <span>{ngo.address}</span>
                </div>

                <div className="pt-1">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#112A46] bg-white border border-[#112A46] px-3.5 py-1.5 rounded-[8px] hover:bg-[#ACC8E5]/20 transition-colors cursor-pointer"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Section: "About MealBridge / MealBridge के बारे में" */}
      <div className="bg-white rounded-[16px] p-5 border border-[#ACC8E5] shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-3.5">
        <div>
          <h2 className="text-base font-bold text-[#112A46]">
            About MealBridge / MealBridge के बारे में
          </h2>
          <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
          <p className="text-xs text-black font-normal leading-relaxed mt-2">
            MealBridge connects people who have extra food with NGOs who can use
            it. Food that would be thrown away reaches people who need it. Free to
            use. Currently in Vadodara.
          </p>
        </div>

        {/* Three small points in a row or stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-stone-200">
          <div className="bg-[#ACC8E5]/20 rounded-[10px] p-2.5 border border-[#ACC8E5]/50 text-center flex flex-col justify-center">
            <span className="text-[11px] text-black font-semibold leading-tight">
              Food safety first: every request shows cooked time and a safe-to-eat limit.
            </span>
          </div>
          <div className="bg-[#ACC8E5]/20 rounded-[10px] p-2.5 border border-[#ACC8E5]/50 text-center flex flex-col justify-center">
            <span className="text-[11px] text-black font-semibold leading-tight">
              Registered NGOs only: NGOs are checked before they can accept.
            </span>
          </div>
          <div className="bg-[#ACC8E5]/20 rounded-[10px] p-2.5 border border-[#ACC8E5]/50 text-center flex flex-col justify-center">
            <span className="text-[11px] text-black font-semibold leading-tight">
              Free to use.
            </span>
          </div>
        </div>

        {/* Tagline at the bottom */}
        <div className="pt-2 text-center border-t border-stone-100">
          <p className="text-xs font-bold text-[#112A46] tracking-wide">
            "Har Thali Jo Bachi, Kisi Ki Muskaan Bani"
          </p>
        </div>
      </div>
    </div>
  );
};
