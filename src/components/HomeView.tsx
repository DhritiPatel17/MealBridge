import React from 'react';
import { TabType } from '../types';
import { UserProfile } from './auth/AuthPortal';
import { DonationRecord } from '../services/donationStore';
import { pilotStatsConfig } from '../config/pilotStats';
import { vadodaraNgos } from '../data/vadodaraNgos';
import { ArrowRight, Sparkles, MapPin, ShieldCheck } from 'lucide-react';
import { CountUp } from './common/CountUp';
import { HeroFoodShareSvg } from './home/HeroFoodShareSvg';

interface HomeViewProps {
  currentUser: UserProfile;
  donations: DonationRecord[];
  onNavigate: (tab: TabType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const isDonor = currentUser.role === 'donor';
  const isNgo = currentUser.role === 'ngo';

  // Greeting name
  const greetingName = isNgo
    ? currentUser.ngoName || currentUser.fullName || 'Partner'
    : currentUser.businessName || currentUser.fullName || 'Friend';

  return (
    <div className="space-y-8 lg:space-y-12 pb-16 pt-2 text-[#0B1C30]">
      {/* 1. HERO SECTION (Split 2-Column on Desktop, Full Viewport Height with Ambient Blurred Gradients) */}
      <div className="relative w-full lg:min-h-[calc(100vh-130px)] lg:flex lg:flex-col lg:justify-center py-2 lg:py-4">
        {/* Soft Ambient Background Decoration for Desktop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
          {/* Subtle Dot Pattern */}
          <div className="absolute inset-0 bg-dot-pattern opacity-30 sm:opacity-40" />
          {/* Ambient Blurred Circle 1: Soft Light-Blue #ACC8E5 */}
          <div className="hidden lg:block absolute top-[8%] -left-[6%] w-[540px] h-[540px] rounded-full bg-[#ACC8E5]/25 blur-[120px]" />
          {/* Ambient Blurred Circle 2: Soft Light-Yellow #FDFD96 */}
          <div className="hidden lg:block absolute bottom-[5%] right-[2%] w-[500px] h-[500px] rounded-full bg-[#FDFD96]/40 blur-[110px]" />
        </div>

        {/* Top Hero Header: Left (Tag, Logo, Wordmark) & Right (SVG Animation) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 xl:gap-12 items-center w-full pb-4 lg:pb-6">
          <div className="lg:col-span-7 xl:col-span-7 space-y-3 sm:space-y-4 lg:space-y-5 w-full">
            {/* Staggered Line 1: Tag & Logo */}
            <div className="flex items-center justify-between gap-3 animate-fade-up">
              <span className="inline-block bg-gradient-to-r from-[#E6F0FA] to-[#ACC8E5] text-[#112A46] text-[10px] sm:text-xs lg:text-sm font-extrabold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-[10px] uppercase tracking-wider border border-[#112A46]/10 shadow-2xs shrink-0">
                SURPLUS FOOD NETWORK • VADODARA
              </span>
              <div className="shrink-0 flex items-center justify-end">
                <img
                  src="/logo.jpg.png"
                  alt="MealBridge Logo"
                  className="w-[130px] sm:w-[150px] lg:w-[200px] xl:w-[220px] h-auto object-contain block select-none mix-blend-multiply"
                  style={{ imageRendering: 'auto' }}
                  loading="eager"
                />
              </div>
            </div>

            {/* Staggered Line 2: Wordmark Image & Hindi Subtitle */}
            <div className="flex flex-col animate-fade-up delay-100">
              <h1 className="relative flex items-center justify-start select-none m-0 p-0 leading-none">
                <span className="sr-only">MealBridge</span>
                <img
                  src="/mealbridge.png"
                  alt="MealBridge"
                  className="w-[300px] max-w-[85%] sm:w-[380px] md:w-[480px] lg:w-[580px] xl:w-[620px] h-auto object-contain block select-none m-0 p-0"
                  style={{ imageRendering: 'auto' }}
                  loading="eager"
                />
              </h1>
              <p className="font-rozha text-2xl sm:text-3xl lg:text-[44px] xl:text-[50px] font-normal leading-tight text-gradient-navy mt-[8px]">
                अन्नसेतु
              </p>
            </div>
          </div>

          {/* Right Column: Hand + Boy Animation */}
          <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center w-full animate-fade-up">
            <HeroFoodShareSvg />
          </div>
        </div>

        {/* Full-width 2-column grid for Quote card & Welcome card side by side filling full width */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-[20px] items-stretch animate-fade-up delay-200 mt-2 sm:mt-4">
          {/* Emotional Hindi Tagline Quote Card (Background image with gradient overlay) */}
          <div className="relative overflow-hidden w-full flex flex-col justify-center p-5 sm:p-6 lg:p-7 rounded-[18px] lg:rounded-[22px] bg-cover bg-center shadow-xs items-stretch" style={{ backgroundImage: 'url(/our-idea.jpg)' }}>
            {/* Dark Navy Gradient Overlay (#112A46, about 70% on left fading to 30% on right) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#112A46]/92 via-[#112A46]/80 to-[#112A46]/55 pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <p className="font-hindi text-lg sm:text-xl lg:text-[22px] font-bold text-white leading-snug">
                "जहाँ खाना बचता है, वहाँ से ज़रूरतमंद तक पहुँचे।"
              </p>
              <p className="text-xs sm:text-sm lg:text-[17px] text-[#ACC8E5] font-medium leading-relaxed">
                Fresh surplus food from commercial kitchens, shared with verified shelters in minutes.
              </p>
            </div>
          </div>

          {/* Greeting & Role Info Card (Welcome Card) */}
          <div className="w-full flex flex-col justify-between bg-white rounded-[20px] lg:rounded-[24px] p-4 sm:p-5 lg:p-6 border border-[#ACC8E5]/60 shadow-[0_4px_20px_rgba(17,42,70,0.06)] space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#112A46]/70">
                Welcome back / <span className="font-hindi font-bold">स्वागत है</span>
              </span>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#112A46] tracking-tight">
                Hello, {greetingName}
              </h2>
              <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#0B1C30]/85 font-normal pt-0.5">
                {isDonor
                  ? 'Have extra prepared food today? Post details for instant pickup by nearby verified NGOs.'
                  : 'Check live food rescue requests from kitchens, banquets, and caterers nearby.'}
              </p>
            </div>

            {/* Primary Action Button */}
            {isDonor ? (
              <button
                onClick={() => onNavigate('donate')}
                className="btn-premium w-full bg-gradient-to-r from-[#112A46] to-[#1E4A7A] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm md:text-base lg:text-[17px] py-3.5 sm:py-4 px-4 sm:px-6 rounded-[14px] lg:rounded-[16px] flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_6px_20px_rgba(17,42,70,0.25)] border border-[#112A46]"
              >
                <span className="leading-tight">Donate Food / <span className="font-hindi font-bold text-white">खाना दान करें</span></span>
                <ArrowRight size={20} className="shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('new-requests')}
                className="btn-premium w-full bg-gradient-to-r from-[#112A46] to-[#1E4A7A] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm md:text-base lg:text-[17px] py-3.5 sm:py-4 px-4 sm:px-6 rounded-[14px] lg:rounded-[16px] flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_6px_20px_rgba(17,42,70,0.25)] border border-[#112A46]"
              >
                <span className="leading-tight">View New Requests / <span className="font-hindi font-bold text-white">नए अनुरोध देखें</span></span>
                <ArrowRight size={20} className="shrink-0" />
              </button>
            )}

            <div className="text-center pt-2 border-t border-stone-100">
              <p className="text-[11px] lg:text-xs text-stone-500 font-medium">
                Pilot network for Vadodara • <span className="font-hindi">वडोदरा के लिए रियल-टाइम अन्न वितरण</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Stats Block in 1 Row on Laptop/Tablet */}
      <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#ACC8E5]/60 shadow-[0_4px_20px_rgba(17,42,70,0.06)] space-y-3.5 animate-fade-up delay-100">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#112A46]" />
            <h2 className="font-heading text-base sm:text-lg font-extrabold text-[#112A46] tracking-tight">
              Network Impact / <span className="font-hindi font-bold">प्रभाव</span>
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-[8px] bg-gradient-to-r from-[#E6F0FA] to-[#ACC8E5] text-[#112A46]">
            Vadodara Pilot
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {pilotStatsConfig.map((stat, idx) => {
            const numVal = parseInt(stat.number.replace(/[^0-9]/g, ''), 10) || 0;
            const suffix = stat.number.includes('+') ? '+' : stat.number.includes('%') ? '%' : '';

            return (
              <div
                key={stat.id}
                className="bg-gradient-to-b from-stone-50/80 to-[#E6F0FA]/40 rounded-[16px] p-4 border border-[#ACC8E5]/50 flex flex-col items-center text-center justify-center transition-all duration-300 hover:border-[#112A46]/40 hover:-translate-y-1 hover:shadow-sm"
              >
                <span className="text-[11px] tracking-wider font-extrabold text-[#112A46]/80 uppercase">
                  {stat.labelEn}
                </span>
                <span className="font-heading text-2xl sm:text-3xl font-black text-[#112A46] my-1">
                  <CountUp end={numVal} suffix={suffix} duration={1200 + idx * 200} />
                </span>
                <span className="font-hindi text-xs font-bold text-[#0B1C30]">
                  {stat.labelHi}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Vadodara Verified Partner NGOs Section */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#ACC8E5]/60 shadow-[0_4px_24px_rgba(17,42,70,0.06)] space-y-6 animate-fade-up delay-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#112A46]" />
              <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#112A46] tracking-tight">
                Vadodara Verified Partner NGOs / <span className="font-hindi font-bold">वडोदरा के पंजीकृत एनजीओ</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Verified local relief organizations receiving surplus food donations in real time.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-[10px] bg-gradient-to-r from-[#112A46] to-[#1E4A7A] text-white shadow-2xs self-start sm:self-auto">
            <MapPin size={14} className="text-[#FDFD96]" />
            Vadodara, Gujarat ({vadodaraNgos.length} Shelters)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {vadodaraNgos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-gradient-to-b from-white to-[#F4F8FC]/60 rounded-[18px] p-5 border border-[#ACC8E5]/60 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-[#112A46]/40 hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-extrabold text-[#112A46] group-hover:text-[#1E4A7A] transition-colors">
                    {ngo.name}
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-[8px] bg-[#E6F0FA] text-[#112A46] shrink-0 border border-[#ACC8E5]/50">
                    {ngo.area}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 font-normal leading-relaxed">
                  {ngo.focus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 font-medium">
                <MapPin size={14} className="text-[#112A46] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{ngo.address}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
